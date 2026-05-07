
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

def sync_activity_ghost_users():
    print("Fetching activities...")
    res = supabase.table("activities").select("id, title").execute()
    activities = res.data or []
    
    print(f"Found {len(activities)} activities.")
    
    for activity in activities:
        a_id = activity['id']
        a_title = activity['title']
        
        # Check if ghost user exists
        user_res = supabase.table("users").select("id").eq("id", a_id).execute()
        if not user_res.data:
            print(f"Creating ghost user for activity: {a_title} ({a_id})")
            payload = {
                "id": a_id,
                "name": f"Group: {a_title}",
                "email": f"{a_id}@squadup.group",
                "interests": [],
                "competition_level": 3,
                "attended_events": 0,
                "joined_events": 0
            }
            try:
                supabase.table("users").insert(payload).execute()
                print(f"Successfully created ghost user for {a_id}")
            except Exception as e:
                print(f"Failed to create ghost user for {a_id}: {e}")
        else:
            print(f"Ghost user already exists for {a_id}")

if __name__ == "__main__":
    sync_activity_ghost_users()
