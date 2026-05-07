"""
app.py - Flask REST API for SquadUp
=====================================
Thin API layer that wires together:
  - database.py   (I/O — fetching data)
  - scoring.py    (pure computation)
  - recommendations.py (pure pipeline)

API is intentionally thin: no business logic lives here.
All responses in English; frontend maps to Turkish UI text.

Endpoints:
  GET  /api/users                       — List all users
  POST /api/users                       — Create user
  GET  /api/users/<id>/recommendations  — Get top 10 recommendations
  GET  /api/activities                  — List all activities
  POST /api/activities                  — Create activity
  POST /api/activities/<id>/score       — Score an activity for a user
  POST /api/activities/<id>/join        — Join an activity
  GET  /api/health                      — Health check
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from functools import wraps

import database as db
from scoring import create_match_scorer, DEFAULT_SCORER
from recommendations import build_recommendations, compute_recommendation_stats

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from React web app

# ---------------------------------------------------------------------------
# Error Logging to File
# ---------------------------------------------------------------------------
import logging
logging.basicConfig(
    filename='backend_errors.log',
    level=logging.ERROR,
    format='%(asctime)s %(levelname)s: %(message)s'
)

# ---------------------------------------------------------------------------
# Health Check
# ---------------------------------------------------------------------------
@app.route("/api/health", methods=["GET"])
def health_check():
    """Simple health endpoint to verify the API is running."""
    return jsonify({"status": "ok", "service": "SquadUp API"}), 200


# ---------------------------------------------------------------------------
# Auth Middleware
# ---------------------------------------------------------------------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            # Format: Bearer <token>
            auth_header = request.headers["Authorization"].split(" ")
            if len(auth_header) == 2:
                token = auth_header[1]

        if not token:
            return jsonify({"error": "Token is missing"}), 401

        try:
            # Verify token with Supabase
            client = db.get_client()
            response = client.auth.get_user(token)
            request.user = response.user
        except Exception as e:
            return jsonify({"error": f"Invalid token: {str(e)}"}), 401

        return f(*args, **kwargs)

    return decorated


# ---------------------------------------------------------------------------
# Auth Endpoints
# ---------------------------------------------------------------------------
@app.route("/api/auth/register", methods=["POST"])
def register():
    """
    POST /api/auth/register
    Register a new user and create their profile.
    """
    body = request.get_json()
    email = body.get("email")
    password = body.get("password")
    name = body.get("name", email.split("@")[0] if email else "User")
    interests = body.get("interests", [])
    competition_level = body.get("competition_level", 3)

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    try:
        # 1. Sign up in Supabase Auth
        auth_response = db.sign_up(email, password)
        if not auth_response.user:
            return jsonify({"error": "Registration failed"}), 400

        # 2. Create entry in users table
        user_data = {
            "name": name,
            "email": email,
            "interests": interests,
            "competition_level": competition_level
        }
        profile = db.create_user(user_data, auth_id=auth_response.user.id)

        return jsonify({
            "message": "Registration successful",
            "user": profile,
            "session": {
                "access_token": auth_response.session.access_token if auth_response.session else None,
                "expires_in": auth_response.session.expires_in if auth_response.session else None
            }
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/auth/login", methods=["POST"])
def login():
    """
    POST /api/auth/login
    Sign in with email and password.
    """
    body = request.get_json()
    email = body.get("email")
    password = body.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    try:
        auth_response = db.sign_in(email, password)
        
        # Fetch profile
        profile = db.get_user_by_id(auth_response.user.id)
        
        return jsonify({
            "message": "Login successful",
            "user": profile,
            "session": {
                "access_token": auth_response.session.access_token,
                "expires_in": auth_response.session.expires_in,
                "refresh_token": auth_response.session.refresh_token
            }
        }), 200
    except Exception as e:
        return jsonify({"error": "Invalid credentials or login failed"}), 401


@app.route("/api/auth/me", methods=["GET"])
@token_required
def get_current_user():
    """Get currently logged in user profile. Auto-creates if missing."""
    profile = db.get_user_by_id(request.user.id)
    
    if not profile:
        # Lazy profile creation for users who exist in Auth but not in our users table
        email = request.user.email
        # Extract name from metadata or email
        name = request.user.user_metadata.get("full_name") or \
               request.user.user_metadata.get("name") or \
               email.split("@")[0]
        
        user_data = {
            "name": name,
            "email": email,
            "interests": [],
            "competition_level": 3
        }
        try:
            profile = db.create_user(user_data, auth_id=request.user.id)
            print(f"Auto-created profile for user: {email}")
        except Exception as e:
            error_str = str(e).lower()
            if "duplicate key" in error_str or "23505" in error_str or "unique constraint" in error_str:
                # If email already exists (e.g. created via web first, or ID mismatch), just return it
                profile = db.get_user_by_email(email)
                if not profile:
                    return jsonify({"error": "Profile sync failed: Unique constraint but email not found"}), 500
                print(f"Recovered profile by email due to collision for: {email}")
            else:
                print(f"Failed to auto-create profile: {str(e)}")
                import traceback
                error_details = traceback.format_exc()
                print(error_details)
                import logging
                logging.error(f"Profile Sync Error: {str(e)}\n{error_details}")
                return jsonify({"error": f"Profile could not be synchronized: {str(e)}"}), 500
            
    return jsonify({"user": profile}), 200


# ---------------------------------------------------------------------------
# User Endpoints
# ---------------------------------------------------------------------------
@app.route("/api/users", methods=["GET"])
def list_users():
    """
    GET /api/users
    Returns all users (for dev/testing).
    """
    users = db.list_all_users()
    return jsonify({"users": users, "count": len(users)}), 200


@app.route("/api/users", methods=["POST"])
def create_user():
    """
    POST /api/users
    Create a new user profile.

    Request body (JSON):
        name (str): Display name
        interests (list[str]): Turkish interest tags e.g. ['futbol', 'valorant']
        competition_level (int): Skill level 1-5

    Response: Created user dict
    """
    body = request.get_json()
    if not body:
        return jsonify({"error": "Request body required"}), 400

    required_fields = ["name", "interests", "competition_level"]
    missing = [f for f in required_fields if f not in body]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    # Validate competition_level range
    level = body["competition_level"]
    if not isinstance(level, int) or not (1 <= level <= 5):
        return jsonify({"error": "competition_level must be integer 1-5"}), 400

    try:
        user = db.create_user(body)
        return jsonify({"user": user, "message": "User created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/users/<user_id>", methods=["GET"])
def get_user_profile(user_id: str):
    """Fetch user profile by ID."""
    profile = db.get_user_by_id(user_id)
    if not profile:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": profile}), 200


@app.route("/api/users/<user_id>", methods=["PUT"])
@token_required
def api_update_user(user_id: str):
    """Update user profile. Only self-update allowed."""
    if request.user.id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    body = request.get_json()
    try:
        updated = db.update_user(user_id, body)
        return jsonify({"user": updated, "message": "Profile updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/users/<user_id>/recommendations", methods=["GET"])
def get_recommendations(user_id: str):
    """
    GET /api/users/<user_id>/recommendations
    Returns top 10 personalized activity recommendations.

    Query params:
        min_score (float): Minimum match score threshold (default: 0.3)
        top_n (int): Max results (default: 10)
        w_interest (float): Weight for interest score (optional)
        w_competition (float): Weight for competition similarity (optional)
        w_reliability (float): Weight for reliability score (optional)

    Response: List of scored activities with match_result breakdown
    """
    # Fetch user
    user = db.get_user_by_id(user_id)
    if not user:
        return jsonify({"error": f"User {user_id} not found"}), 404

    # Parse optional query params
    min_score = float(request.args.get("min_score", 0.3))
    top_n = int(request.args.get("top_n", 10))

    # Optional custom weights
    w_interest = request.args.get("w_interest")
    w_competition = request.args.get("w_competition")
    w_reliability = request.args.get("w_reliability")

    if w_interest and w_competition and w_reliability:
        weights = {
            "interest": float(w_interest),
            "competition": float(w_competition),
            "reliability": float(w_reliability),
        }
        try:
            scorer = create_match_scorer(weights)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
    else:
        scorer = DEFAULT_SCORER

    # Fetch all activities and user's joined activity IDs
    all_activities = db.list_all_activities()
    joined_ids = db.get_user_joined_activity_ids(user_id)

    # Run the functional recommendation pipeline
    recommendations = build_recommendations(
        user=user,
        activities=all_activities,
        joined_activity_ids=joined_ids,
        min_score=min_score,
        top_n=top_n,
        scorer=scorer,
    )

    stats = compute_recommendation_stats(recommendations)

    return jsonify({
        "user_id": user_id,
        "recommendations": recommendations,
        "stats": stats,
    }), 200


# ---------------------------------------------------------------------------
# Activity Endpoints
# ---------------------------------------------------------------------------
@app.route("/api/activities", methods=["GET"])
def list_activities():
    """
    GET /api/activities
    Returns all activities ordered by datetime.
    """
    activities = db.list_all_activities()
    # Enrich with participant count
    enriched = [
        {**a, "participant_count": db.get_activity_participant_count(a["id"])}
        for a in activities
    ]
    return jsonify({"activities": enriched, "count": len(enriched)}), 200


@app.route("/api/activities", methods=["POST"])
def create_activity():
    """
    POST /api/activities
    Create a new activity.

    Request body (JSON):
        creator_id (str): UUID of user creating the activity
        title (str): Activity title (Turkish, e.g. "Kadıköy'de Futbol")
        category (str): English key — 'sports', 'esports', 'board_games', 'outdoor'
        competition_level (int): Required skill level 1-5
        location (str): Location description (Turkish)
        datetime (str): ISO 8601 datetime string
        max_participants (int): Maximum allowed participants

    Response: Created activity dict
    """
    body = request.get_json()
    if not body:
        return jsonify({"error": "Request body required"}), 400

    required_fields = [
        "creator_id", "title", "category", "competition_level",
        "location", "datetime", "max_participants"
    ]
    missing = [f for f in required_fields if f not in body]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    valid_categories = ["sports", "esports", "board_games", "outdoor"]
    if body["category"] not in valid_categories:
        return jsonify({"error": f"category must be one of {valid_categories}"}), 400

    try:
        activity = db.create_activity(body)
        
        # Create a ghost user for this activity to enable group chat (bypass FK constraints on messages table)
        try:
            db.create_user({
                "name": f"Group: {activity['title']}",
                "email": f"{activity['id']}@squadup.group",
                "interests": [],
                "competition_level": 3,
                "avatar_seed": "group_default"
            }, auth_id=activity['id'])
        except Exception as ghost_err:
            print(f"Warning: Could not create ghost user for activity: {ghost_err}")
            
        return jsonify({"activity": activity, "message": "Activity created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/activities/<activity_id>/score", methods=["POST"])
def score_activity(activity_id: str):
    """
    POST /api/activities/<activity_id>/score
    Calculates and explains match score for a user-activity pair.

    Request body (JSON):
        user_id (str): UUID of the user

    Response: Full score explanation with breakdown
    """
    body = request.get_json()
    if not body or "user_id" not in body:
        return jsonify({"error": "user_id required in request body"}), 400

    user = db.get_user_by_id(body["user_id"])
    if not user:
        return jsonify({"error": f"User {body['user_id']} not found"}), 404

    activity = db.get_activity_by_id(activity_id)
    if not activity:
        return jsonify({"error": f"Activity {activity_id} not found"}), 404

    match_result = DEFAULT_SCORER(user, activity)

    return jsonify({
        "user_id": body["user_id"],
        "activity_id": activity_id,
        "match_result": match_result,
    }), 200


@app.route("/api/activities/<activity_id>/join", methods=["POST"])
def join_activity(activity_id: str):
    """
    POST /api/activities/<activity_id>/join
    Registers a user's request to participate in an activity.

    Request body (JSON):
        user_id (str): UUID of user joining

    Response: Created participation record (pending)
    """
    body = request.get_json()
    if not body or "user_id" not in body:
        return jsonify({"error": "user_id required in request body"}), 400

    try:
        participation = db.join_activity(body["user_id"], activity_id)
        # We don't increment the count yet since it's pending.
        activity = db.get_activity_by_id(activity_id)
        return jsonify({
            "participation": participation,
            "message": "Katılım isteğiniz gönderildi! ⏳",
            "activity_title": activity.get("title", "") if activity else "",
        }), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/activities/<activity_id>/participants", methods=["GET"])
@token_required
def get_activity_participants(activity_id: str):
    """Get all approved and pending participants for an activity."""
    try:
        data = db.get_activity_requests_and_participants(activity_id)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/activities/<activity_id>/respond_request", methods=["POST"])
@token_required
def respond_activity_request(activity_id: str):
    """Approve or reject a participation request."""
    body = request.get_json()
    participation_id = body.get("participation_id")
    status = body.get("status")

    if not participation_id or not status:
        return jsonify({"error": "participation_id and status required"}), 400

    try:
        creator_id = request.user.id
        result = db.respond_to_activity_request(participation_id, status, creator_id)
        return jsonify({
            "message": "İstek güncellendi",
            "data": result
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# Squad Endpoints (Restored)
# ---------------------------------------------------------------------------
@app.route("/api/squads", methods=["GET"])
def list_squads():
    """List all permanent squads."""
    try:
        squads = db.list_all_squads()
        return jsonify({"squads": squads, "count": len(squads)}), 200
    except Exception as e:
        error_str = str(e).lower()
        if "relation \"public.squads\" does not exist" in error_str or "42p01" in error_str or "does not exist" in error_str:
            # Graceful fallback if the squads table hasn't been created in Supabase yet
            return jsonify({"squads": [], "count": 0, "warning": "Squads table not initialized"}), 200
        return jsonify({"error": str(e)}), 500

@app.route("/api/participations", methods=["GET"])
@token_required
def get_my_participations():
    """Get activities the current user has joined."""
    user_id = request.user.id
    try:
        activity_ids = db.get_user_joined_activity_ids(user_id)
        activities = []
        for aid in activity_ids:
            activity = db.get_activity_by_id(aid)
            if activity:
                activities.append(activity)
        
        return jsonify({"activities": activities, "count": len(activities)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/participations/status", methods=["GET"])
@token_required
def get_participation_status():
    """Get dict of activity_id -> status for the current user."""
    user_id = request.user.id
    try:
        statuses = db.get_user_all_participations(user_id)
        return jsonify({"statuses": statuses}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/squads", methods=["POST"])
@token_required
def create_squad():
    """Create a new squad."""
    body = request.get_json()
    if not body or "name" not in body or "category" not in body:
        return jsonify({"error": "Missing required squad fields"}), 400
        
    try:
        # Use auth token for creator
        body["creator_id"] = request.user.id
        squad = db.create_squad(body)
        return jsonify({"squad": squad, "message": "Squad created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/squads/<squad_id>/join", methods=["POST"])
@token_required
def join_squad(squad_id: str):
    """Join a permanent squad."""
    try:
        membership = db.join_squad(squad_id, request.user.id)
        return jsonify({"membership": membership, "message": "Successfully joined squad"}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------------------------------------------------------------------
# Friend System Endpoints
# ---------------------------------------------------------------------------
@app.route("/api/users/search", methods=["GET"])
@token_required
def api_search_users():
    query = request.args.get("q", "")
    if not query:
        return jsonify({"users": []}), 200
    users = db.search_users(query, request.user.id)
    return jsonify({"users": users}), 200

@app.route("/api/friends", methods=["GET"])
@token_required
def api_get_friends():
    friends_data = db.get_user_friends(request.user.id)
    return jsonify(friends_data), 200

@app.route("/api/friends/request", methods=["POST"])
@token_required
def api_send_friend_request():
    body = request.get_json()
    friend_id = body.get("friend_id")
    if not friend_id:
        return jsonify({"error": "friend_id required"}), 400
    try:
        data = db.send_friend_request(request.user.id, friend_id)
        return jsonify({"message": "Friend request sent", "data": data}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/friends/respond", methods=["POST"])
@token_required
def api_respond_friend_request():
    body = request.get_json()
    request_id = body.get("request_id")
    status = body.get("status")
    if not request_id or not status:
        return jsonify({"error": "request_id and status required"}), 400
    try:
        data = db.respond_to_friend_request(request_id, status)
        return jsonify({"message": "Responded to friend request", "data": data}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
