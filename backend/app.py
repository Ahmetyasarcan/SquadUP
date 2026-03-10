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

import database as db
from scoring import create_match_scorer, DEFAULT_SCORER
from recommendations import build_recommendations, compute_recommendation_stats

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from React web app

# ---------------------------------------------------------------------------
# Health Check
# ---------------------------------------------------------------------------
@app.route("/api/health", methods=["GET"])
def health_check():
    """Simple health endpoint to verify the API is running."""
    return jsonify({"status": "ok", "service": "SquadUp API"}), 200


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
    Registers a user's participation in an activity.

    Request body (JSON):
        user_id (str): UUID of user joining

    Response: Created participation record
    """
    body = request.get_json()
    if not body or "user_id" not in body:
        return jsonify({"error": "user_id required in request body"}), 400

    try:
        participation = db.join_activity(body["user_id"], activity_id)
        return jsonify({
            "participation": participation,
            "message": "Successfully joined the activity",
        }), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
