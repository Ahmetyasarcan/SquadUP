"""
database.py - Supabase Client Wrapper for SquadUp
==================================================
Provides a clean interface to Supabase (PostgreSQL).
Separates database concerns from business logic.

Note: This module contains I/O (impure by nature).
      Business logic in scoring.py and recommendations.py remains pure.
"""

import os
from typing import List, Dict, Optional
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# Supabase client initialization (singleton pattern)
# ---------------------------------------------------------------------------
_supabase_client: Optional[Client] = None


def get_client() -> Client:
    """
    Returns the Supabase client singleton.
    Lazily initialized on first call.
    """
    global _supabase_client
    if _supabase_client is None:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_ANON_KEY")
        if not url or not key:
            raise EnvironmentError(
                "SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment."
            )
        _supabase_client = create_client(url, key)
    return _supabase_client


# ---------------------------------------------------------------------------
# User operations
# ---------------------------------------------------------------------------
def get_user_by_id(user_id: str) -> Optional[Dict]:
    """Fetch a single user by UUID. Returns None if not found."""
    client = get_client()
    result = client.table("users").select("*").eq("id", user_id).execute()
    data = result.data
    return data[0] if data else None


def create_user(user_data: Dict, auth_id: Optional[str] = None) -> Dict:
    """
    Insert a new user into the users table.
    user_data keys: name, email, interests, competition_level, avatar_seed
    auth_id: The UUID from Supabase Auth (optional, for linking).
    """
    client = get_client()
    payload = {
        "name": user_data["name"],
        "email": user_data.get("email"),
        "interests": user_data["interests"],
        "competition_level": user_data["competition_level"],
        "avatar_seed": user_data.get("avatar_seed"),
        "attended_events": 0,
        "joined_events": 0,
    }
    
    if auth_id:
        payload["id"] = auth_id

    result = client.table("users").insert(payload).execute()
    if not result.data:
        raise Exception(f"User could not be created in table. Result: {result}")
    return result.data[0]


def get_user_by_email(email: str) -> Optional[Dict]:
    """Fetch a single user by email. Returns None if not found."""
    client = get_client()
    result = client.table("users").select("*").eq("email", email).execute()
    data = result.data
    return data[0] if data else None


# ---------------------------------------------------------------------------
# Auth operations (Supabase Auth Wrapper)
# ---------------------------------------------------------------------------
def sign_up(email: str, password: str) -> Dict:
    """Register a new user in Supabase Auth."""
    client = get_client()
    return client.auth.sign_up({
        "email": email,
        "password": password
    })


def sign_in(email: str, password: str) -> Dict:
    """Sign in a user with email and password."""
    client = get_client()
    return client.auth.sign_in_with_password({
        "email": email,
        "password": password
    })


def update_user_attendance(user_id: str, attended_delta: int, joined_delta: int) -> Dict:
    """
    Increment a user's attended/joined event counters.
    Called when a user joins or is confirmed to attend an activity.
    
    Note: Uses RPC for atomic increment to avoid race conditions.
    """
    client = get_client()
    # Fetch current values first
    user = get_user_by_id(user_id)
    if not user:
        raise ValueError(f"User {user_id} not found")

    new_attended = user["attended_events"] + attended_delta
    new_joined = user["joined_events"] + joined_delta

    result = (
        client.table("users")
        .update({"attended_events": new_attended, "joined_events": new_joined})
        .eq("id", user_id)
        .execute()
    )
    if not result.data:
        raise Exception(f"User attendance could not be updated. ID: {user_id}")
    return result.data[0]


def update_user(user_id: str, user_data: Dict) -> Dict:
    """Update user profile details."""
    client = get_client()
    try:
        result = (
            client.table("users")
            .update(user_data)
            .eq("id", user_id)
            .execute()
        )
        if not result.data:
            print(f"DEBUG: update_user failed for ID {user_id}. Data: {user_data}")
            print(f"DEBUG: Full result: {result}")
            raise ValueError(f"Kullanıcı bulunamadı veya güncellenemedi (ID: {user_id})")
        return result.data[0]
    except Exception as e:
        print(f"ERROR in update_user: {e}")
        raise e


def list_all_users() -> List[Dict]:
    """Fetch all users. Used for testing/admin."""
    client = get_client()
    result = client.table("users").select("*").execute()
    return result.data


def award_badge(user_id: str, badge_name: str) -> Dict:
    """Add a badge to user's badges array if not already present."""
    client = get_client()
    user = get_user_by_id(user_id)
    if not user:
        raise ValueError(f"User {user_id} not found")
    
    current_badges = user.get("badges", [])
    if badge_name not in current_badges:
        current_badges.append(badge_name)
        result = client.table("users").update({"badges": current_badges}).eq("id", user_id).execute()
        if not result.data:
            raise Exception(f"Badge could not be awarded. ID: {user_id}")
        return result.data[0]
    return user


# ---------------------------------------------------------------------------
# Activity operations
# ---------------------------------------------------------------------------
def get_activity_by_id(activity_id: str) -> Optional[Dict]:
    """Fetch a single activity by UUID with participant count."""
    client = get_client()
    result = client.table("activities").select("*").eq("id", activity_id).execute()
    data = result.data
    return data[0] if data else None


def list_all_activities() -> List[Dict]:
    """Fetch all activities ordered by datetime ascending."""
    client = get_client()
    result = (
        client.table("activities")
        .select("*")
        .order("datetime", desc=False)
        .execute()
    )
    return result.data


def create_activity(activity_data: Dict) -> Dict:
    """
    Insert a new activity.
    activity_data keys: creator_id, title, category, competition_level,
                        location, datetime, max_participants
    """
    client = get_client()
    result = client.table("activities").insert(activity_data).execute()
    if not result.data:
        raise Exception("Activity could not be created.")
    return result.data[0]


def get_activity_participant_count(activity_id: str) -> int:
    """Count active participants ('joined' or 'attended') for an activity."""
    client = get_client()
    result = (
        client.table("participations")
        .select("id", count="exact")
        .eq("activity_id", activity_id)
        .in_("status", ["joined", "attended"])
        .execute()
    )
    return result.count or 0


def get_activity_participants(activity_id: str) -> List[Dict]:
    """Fetch full user profiles for all participants of an activity."""
    client = get_client()
    # Join participations with users
    result = (
        client.table("participations")
        .select("users(*)")
        .eq("activity_id", activity_id)
        .in_("status", ["joined", "attended"])
        .execute()
    )
    # Extract user data from nested result
    return [row["users"] for row in result.data if row.get("users")]


# ---------------------------------------------------------------------------
# Participation operations
# ---------------------------------------------------------------------------
def get_user_all_participations(user_id: str) -> Dict[str, str]:
    """Return dict of activity_id -> status for all user participations."""
    client = get_client()
    result = (
        client.table("participations")
        .select("activity_id, status")
        .eq("user_id", user_id)
        .execute()
    )
    return {row["activity_id"]: row["status"] for row in result.data}

def get_user_joined_activity_ids(user_id: str) -> List[str]:
    """Return list of activity IDs the user has joined (non-cancelled)."""
    client = get_client()
    result = (
        client.table("participations")
        .select("activity_id")
        .eq("user_id", user_id)
        .in_("status", ["joined", "attended"])
        .execute()
    )
    return [row["activity_id"] for row in result.data]


def get_activity_requests_and_participants(activity_id: str) -> Dict[str, List[Dict]]:
    """Fetch all pending requests and approved participants for an activity."""
    client = get_client()
    result = (
        client.table("participations")
        .select("id, status, users(*)")
        .eq("activity_id", activity_id)
        .execute()
    )
    
    pending = []
    approved = []
    
    for row in result.data:
        user_data = row.get("users")
        if not user_data:
            continue
        # Inject participation_id for easy response
        user_data["participation_id"] = row["id"]
        
        if row["status"] == "pending":
            pending.append(user_data)
        elif row["status"] in ["joined", "attended"]:
            approved.append(user_data)
            
    return {"pending": pending, "approved": approved}

def respond_to_activity_request(participation_id: str, status: str, creator_id: str) -> Dict:
    """Accept or reject an activity join request."""
    client = get_client()
    if status not in ["joined", "rejected"]:
        raise ValueError("Invalid status. Must be 'joined' or 'rejected'")
        
    # Check if the current user is the creator of the activity
    part_res = client.table("participations").select("*, activities(creator_id, title)").eq("id", participation_id).execute()
    if not part_res.data:
        raise ValueError("Participation request not found")
        
    participation = part_res.data[0]
    activity_data = participation.get("activities", {})
    if activity_data.get("creator_id") != creator_id:
        raise ValueError("Only the activity creator can respond to requests")

    if status == "rejected":
        res = client.table("participations").delete().eq("id", participation_id).execute()
        
        # Send rejection notification
        try:
            client.table("notifications").insert({
                "user_id": participation["user_id"],
                "type": "activity_rejected",
                "title": "Katılım İsteği Reddedildi",
                "message": f"\"{activity_data.get('title')}\" etkinliğine katılım isteğiniz reddedildi.",
                "related_id": participation["activity_id"],
                "read": False,
            }).execute()
        except:
            pass
            
        return {"status": "deleted"}
    else:
        # Check capacity again before approving
        activity_id = participation["activity_id"]
        activity = get_activity_by_id(activity_id)
        current_count = get_activity_participant_count(activity_id)
        if current_count >= activity["max_participants"]:
            raise ValueError("Activity is already full")

        res = client.table("participations").update({"status": "joined"}).eq("id", participation_id).execute()
        
        # Increment user's joined_events counter since they are now officially joined
        user_id = participation["user_id"]
        user = update_user_attendance(user_id, attended_delta=0, joined_delta=1)

        # Check for automatic badges
        if user["joined_events"] >= 3:
            award_badge(user_id, "active_squadmate")
        if user["joined_events"] >= 10:
            award_badge(user_id, "squad_legend")
            
        # Send approval notification
        try:
            client.table("notifications").insert({
                "user_id": user_id,
                "type": "activity_approved",
                "title": "Katılım İsteği Onaylandı! 🎉",
                "message": f"\"{activity_data.get('title')}\" etkinliğine katılım isteğiniz onaylandı!",
                "related_id": activity_id,
                "read": False,
            }).execute()
        except:
            pass

        return res.data[0]

def join_activity(user_id: str, activity_id: str) -> Dict:
    """
    Create a participation record (user joins activity).
    Status is initially 'pending' to require creator approval.
    Returns the created participation dict.
    Raises ValueError if user already requested/joined or activity is full.
    Also sends a notification to the activity creator.
    """
    client = get_client()

    # Check if already joined or pending
    existing = (
        client.table("participations")
        .select("id, status")
        .eq("user_id", user_id)
        .eq("activity_id", activity_id)
        .in_("status", ["joined", "attended", "pending"])
        .execute()
    )
    if existing.data:
        status = existing.data[0]["status"]
        if status == "pending":
            raise ValueError("Bu etkinlik için onay bekleyen bir isteğiniz zaten var")
        raise ValueError("User has already joined this activity")

    # Check capacity
    activity = get_activity_by_id(activity_id)
    if not activity:
        raise ValueError(f"Activity {activity_id} not found")

    current_count = get_activity_participant_count(activity_id)
    if current_count >= activity["max_participants"]:
        raise ValueError("Activity is full")

    # Create participation as pending
    payload = {
        "user_id": user_id,
        "activity_id": activity_id,
        "status": "pending",
    }
    result = client.table("participations").insert(payload).execute()

    # ── Send notification to activity creator (skip if user IS the creator) ──
    creator_id = activity.get("creator_id")
    if creator_id and creator_id != user_id:
        try:
            # Fetch joiner's display name
            joiner = get_user_by_id(user_id)
            joiner_name = joiner.get("name", "Bir kullanıcı") if joiner else "Bir kullanıcı"
            activity_title = activity.get("title", "Etkinliğiniz")

            client.table("notifications").insert({
                "user_id": creator_id,
                "type": "activity_request",
                "title": "Yeni Katılım İsteği! 🔔",
                "message": f"{joiner_name} \"{activity_title}\" etkinliğinize katılmak istiyor.",
                "related_id": activity_id,
                "read": False,
            }).execute()
        except Exception as notif_err:
            # Non-fatal: don't block the join if notification fails
            print(f"Warning: Could not send join notification: {notif_err}")

    return result.data[0]


# ---------------------------------------------------------------------------
# Squad operations
# ---------------------------------------------------------------------------
def list_all_squads() -> List[Dict]:
    """Fetch all squads with member count. Returns [] if table is missing."""
    client = get_client()
    try:
        # Fetch squads
        res = client.table("squads").select("*").execute()
        squads = res.data if res.data else []
        
        # Enrich with member count
        for squad in squads:
            try:
                count_res = client.table("squad_members").select("id", count="exact").eq("squad_id", squad["id"]).execute()
                squad["member_count"] = count_res.count or 0
            except:
                squad["member_count"] = 0
        return squads
    except Exception as e:
        error_str = str(e).lower()
        if "relation" in error_str and "does not exist" in error_str:
            print("Warning: squads table not found in Supabase. Returning empty list.")
            return []
        raise e


def create_squad(squad_data: Dict) -> Dict:
    """Create a new squad and add creator as member."""
    client = get_client()
    # Insert squad
    res = client.table("squads").insert(squad_data).execute()
    if not res.data:
        raise Exception("Squad could not be created.")
    squad = res.data[0]
    
    # Add creator as member
    client.table("squad_members").insert({
        "squad_id": squad["id"],
        "user_id": squad_data["creator_id"],
        "role": "creator"
    }).execute()
    
    return squad


def join_squad(squad_id: str, user_id: str) -> Dict:
    """Add a user to a squad."""
    client = get_client()
    # Check if already a member
    existing = client.table("squad_members").select("id").eq("squad_id", squad_id).eq("user_id", user_id).execute()
    if existing.data:
        raise ValueError("User is already a member of this squad")
        
    res = client.table("squad_members").insert({
        "squad_id": squad_id,
        "user_id": user_id,
        "role": "member"
    }).execute()
    if not res.data:
        raise Exception("Failed to join squad.")
    return res.data[0]


# ---------------------------------------------------------------------------
# Friend operations
# ---------------------------------------------------------------------------
def search_users(query: str, current_user_id: str) -> List[Dict]:
    """Search for users by name or email, excluding current user."""
    client = get_client()
    result = (
        client.table("users")
        .select("*")
        .or_(f"name.ilike.%{query}%,email.ilike.%{query}%")
        .neq("id", current_user_id)
        .limit(20)
        .execute()
    )
    return result.data


def send_friend_request(user_id: str, friend_id: str) -> Dict:
    """Create a pending friend request."""
    if user_id == friend_id:
        raise ValueError("Kendine arkadaşlık isteği gönderemezsin")
        
    client = get_client()
    # Check if already friends or pending (either direction)
    # Using a simpler query for compatibility
    existing = (
        client.table("friends")
        .select("*")
        .or_(f"user_id.eq.{user_id},friend_id.eq.{user_id}")
        .execute()
    )
    
    # Filter manually for exact pair to be 100% sure of logic
    for rel in existing.data:
        if (rel["user_id"] == user_id and rel["friend_id"] == friend_id) or \
           (rel["user_id"] == friend_id and rel["friend_id"] == user_id):
            raise ValueError("Zaten bir arkadaşlık ilişkisi veya bekleyen istek var")
        
    res = client.table("friends").insert({
        "user_id": user_id,
        "friend_id": friend_id,
        "status": "pending"
    }).execute()
    
    if not res.data:
        error_msg = res.error.message if hasattr(res, 'error') and res.error else "Unknown error"
        print(f"Friend request insert error: {error_msg}")
        raise Exception(f"Friend request could not be created: {error_msg}")
        
    return res.data[0]


def get_user_friends(user_id: str) -> Dict[str, List[Dict]]:
    """Get accepted friends and pending requests."""
    client = get_client()
    
    # 1. Fetch all relationships involving this user
    res = client.table("friends").select("*").or_(f"user_id.eq.{user_id},friend_id.eq.{user_id}").execute()
    records = res.data if res.data else []
    
    # 2. Collect all unique friend IDs
    other_user_ids = set()
    for r in records:
        other_id = r["friend_id"] if r["user_id"] == user_id else r["user_id"]
        other_user_ids.add(other_id)
    
    # 3. Fetch profiles for these users
    user_profiles = {}
    if other_user_ids:
        profiles_res = client.table("users").select("*").in_("id", list(other_user_ids)).execute()
        if profiles_res.data:
            for p in profiles_res.data:
                user_profiles[p["id"]] = p
    
    # 4. Sort into categories
    friends = []
    incoming = []
    outgoing = []
    
    for r in records:
        other_id = r["friend_id"] if r["user_id"] == user_id else r["user_id"]
        profile = user_profiles.get(other_id)
        
        if not profile:
            # Fallback if profile is still missing
            profile = {"id": other_id, "name": "Bilinmeyen Kullanıcı", "email": ""}
            
        if r["status"] == "accepted":
            friends.append(profile)
        elif r["status"] == "pending":
            if r["user_id"] == user_id:
                # We sent this
                outgoing.append(profile)
            else:
                # We received this
                incoming.append({**profile, "request_id": r["id"]})
                
    return {
        "friends": friends,
        "pending_incoming": incoming,
        "pending_outgoing": outgoing
    }


def respond_to_friend_request(request_id: str, status: str) -> Dict:
    """Accept or reject a friend request."""
    client = get_client()
    if status not in ["accepted", "rejected"]:
        raise ValueError("Invalid status")
        
    if status == "rejected":
        res = client.table("friends").delete().eq("id", request_id).execute()
        return {"status": "deleted"}
    else:
        res = client.table("friends").update({"status": "accepted"}).eq("id", request_id).execute()
        if not res.data:
            raise Exception("Failed to accept friend request.")
        return res.data[0]
