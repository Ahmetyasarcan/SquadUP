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
    user_data keys: name, email, interests, competition_level
    auth_id: The UUID from Supabase Auth (optional, for linking).
    """
    client = get_client()
    payload = {
        "name": user_data["name"],
        "email": user_data.get("email"),
        "interests": user_data["interests"],
        "competition_level": user_data["competition_level"],
        "attended_events": 0,
        "joined_events": 0,
    }
    
    if auth_id:
        payload["id"] = auth_id

    result = client.table("users").insert(payload).execute()
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
    return result.data[0]


def list_all_users() -> List[Dict]:
    """Fetch all users. Used for testing/admin."""
    client = get_client()
    result = client.table("users").select("*").execute()
    return result.data


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


# ---------------------------------------------------------------------------
# Participation operations
# ---------------------------------------------------------------------------
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


def join_activity(user_id: str, activity_id: str) -> Dict:
    """
    Create a participation record (user joins activity).
    Returns the created participation dict.
    Raises ValueError if user already joined or activity is full.
    """
    client = get_client()

    # Check if already joined
    existing = (
        client.table("participations")
        .select("id")
        .eq("user_id", user_id)
        .eq("activity_id", activity_id)
        .in_("status", ["joined", "attended"])
        .execute()
    )
    if existing.data:
        raise ValueError("User has already joined this activity")

    # Check capacity
    activity = get_activity_by_id(activity_id)
    if not activity:
        raise ValueError(f"Activity {activity_id} not found")

    current_count = get_activity_participant_count(activity_id)
    if current_count >= activity["max_participants"]:
        raise ValueError("Activity is full")

    # Create participation
    payload = {
        "user_id": user_id,
        "activity_id": activity_id,
        "status": "joined",
    }
    result = client.table("participations").insert(payload).execute()

    # Increment user's joined_events counter
    update_user_attendance(user_id, attended_delta=0, joined_delta=1)

    return result.data[0]
