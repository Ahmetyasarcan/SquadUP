"""
seed_data.py - Sample Data Generator for SquadUp
=================================================
Inserts realistic Turkish sample data into Supabase for testing.

Usage:
    python seed_data.py            # Insert all sample data
    python seed_data.py --clear    # Clear existing data first, then insert

WARNING: --clear will DELETE all existing rows in participations, activities, sqlusers.
"""

import sys
import os
from datetime import datetime, timedelta
from database import get_client

supabase = get_client()


# ---------------------------------------------------------------------------
# Sample Users (Turkish names, realistic interest sets)
# ---------------------------------------------------------------------------
SAMPLE_USERS = [
    {
        "name": "Ahmet Yılmaz",
        "interests": ["futbol", "koşu", "basketbol"],
        "competition_level": 3,
        "attended_events": 5,
        "joined_events": 6,
    },
    {
        "name": "Fatma Demir",
        "interests": ["valorant", "lol", "cs2", "gaming"],
        "competition_level": 4,
        "attended_events": 8,
        "joined_events": 9,
    },
    {
        "name": "Mehmet Can",
        "interests": ["satranç", "kutu oyunu", "risk"],
        "competition_level": 2,
        "attended_events": 2,
        "joined_events": 2,
    },
    {
        "name": "Zeynep Kaya",
        "interests": ["futbol", "basketbol", "voleybol"],
        "competition_level": 4,
        "attended_events": 3,
        "joined_events": 4,
    },
    {
        "name": "Ali Yıldız",
        "interests": ["doğa yürüyüşü", "kamp", "bisiklet"],
        "competition_level": 1,
        "attended_events": 0,
        "joined_events": 1,
    },
    {
        "name": "Selin Arslan",
        "interests": ["valorant", "dota2", "fifa", "gaming"],
        "competition_level": 5,
        "attended_events": 15,
        "joined_events": 15,
    },
    {
        "name": "Burak Öztürk",
        "interests": ["kutu oyunu", "catan", "monopoly"],
        "competition_level": 2,
        "attended_events": 4,
        "joined_events": 5,
    },
]


# ---------------------------------------------------------------------------
# Sample Activities (Turkish titles/locations, varied categories)
# ---------------------------------------------------------------------------
def build_sample_activities(creator_id: str) -> list:
    """
    Pure function: returns list of activity dicts.
    All datetimes are future-relative to now().
    """
    base = datetime.now()

    return [
        {
            "creator_id": creator_id,
            "title": "Kadıköy'de Hafta Sonu Futbolu",
            "category": "sports",
            "competition_level": 3,
            "location": "Kadıköy Halı Saha",
            "datetime": (base + timedelta(days=2)).isoformat(),
            "max_participants": 10,
        },
        {
            "creator_id": creator_id,
            "title": "Valorant 5v5 Turnuvası",
            "category": "esports",
            "competition_level": 4,
            "location": "Online (Discord)",
            "datetime": (base + timedelta(days=3)).isoformat(),
            "max_participants": 10,
        },
        {
            "creator_id": creator_id,
            "title": "Catan Strateji Gecesi",
            "category": "board_games",
            "competition_level": 2,
            "location": "Beşiktaş Board Game Kafe",
            "datetime": (base + timedelta(days=5)).isoformat(),
            "max_participants": 6,
        },
        {
            "creator_id": creator_id,
            "title": "Belgrad Ormanı Doğa Yürüyüşü",
            "category": "outdoor",
            "competition_level": 1,
            "location": "Belgrad Ormanı Giriş",
            "datetime": (base + timedelta(days=7)).isoformat(),
            "max_participants": 20,
        },
        {
            "creator_id": creator_id,
            "title": "CS2 Ranked Maçı - Platinum+",
            "category": "esports",
            "competition_level": 5,
            "location": "Online (Steam)",
            "datetime": (base + timedelta(hours=6)).isoformat(),
            "max_participants": 10,
        },
        {
            "creator_id": creator_id,
            "title": "Beşiktaş Parkı Koşu Grubu",
            "category": "sports",
            "competition_level": 2,
            "location": "Beşiktaş Kordon",
            "datetime": (base + timedelta(days=1)).isoformat(),
            "max_participants": 15,
        },
        {
            "creator_id": creator_id,
            "title": "Risk Masası Gecesi",
            "category": "board_games",
            "competition_level": 3,
            "location": "Üsküdar Oyun Evi",
            "datetime": (base + timedelta(days=4)).isoformat(),
            "max_participants": 6,
        },
        {
            "creator_id": creator_id,
            "title": "Bisiklet Turu - Boğaz Hattı",
            "category": "outdoor",
            "competition_level": 2,
            "location": "Ortaköy İskele",
            "datetime": (base + timedelta(days=6)).isoformat(),
            "max_participants": 12,
        },
    ]


# ---------------------------------------------------------------------------
# Insertion helpers
# ---------------------------------------------------------------------------
def seed_users() -> list:
    """Insert sample users and return created user records."""
    print("👤 Kullanıcılar ekleniyor...")
    result = supabase.table("users").insert(SAMPLE_USERS).execute()
    users = result.data
    print(f"   ✅ {len(users)} kullanıcı oluşturuldu.")
    return users


def seed_activities(creator_id: str) -> list:
    """Insert sample activities and return created records."""
    print("🏟️  Etkinlikler ekleniyor...")
    activities = build_sample_activities(creator_id)
    result = supabase.table("activities").insert(activities).execute()
    created = result.data
    print(f"   ✅ {len(created)} etkinlik oluşturuldu.")
    return created


def clear_all_data() -> None:
    """Delete all rows in reverse dependency order."""
    print("🗑️  Mevcut veriler siliniyor...")
    supabase.table("participations").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    supabase.table("activities").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    supabase.table("sqlusers").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    print("   ✅ Tüm veriler silindi.")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    should_clear = "--clear" in sys.argv

    if should_clear:
        clear_all_data()

    users = seed_users()
    # Use the first created user as activity creator
    creator_id = users[0]["id"]
    activities = seed_activities(creator_id)

    print()
    print("✅ Örnek veriler başarıyla eklendi!")
    print(f"   Kullanıcılar : {len(users)}")
    print(f"   Etkinlikler  : {len(activities)}")
    print()
    print("🚀 Sunucuyu başlatmak için: python app.py")
    print("🔍 Test için:               curl http://localhost:5000/api/health")
