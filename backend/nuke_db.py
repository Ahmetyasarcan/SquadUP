import database as db
import os

def nuke_database():
    client = db.get_client()
    print("WARNING: Nuking all database records...")
    
    tables = [
        "friends",
        "activity_participants",
        "squad_members",
        "activities",
        "squads",
        "users"
    ]
    
    for table in tables:
        try:
            # Delete all rows: .delete().neq("id", "00000000-0000-0000-0000-000000000000") 
            # is a common way to delete everything in Supabase-py without where
            res = client.table(table).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
            print(f"Cleared table '{table}'.")
        except Exception as e:
            print(f"Error clearing table '{table}': {e}")

    print("\nDatabase records cleared.")
    print("NOTE: Supabase Auth users are NOT deleted. Users should re-register or use their existing Auth accounts.")
    print("Existing Auth accounts will have their profiles auto-created on next login/refresh.")

if __name__ == "__main__":
    nuke_database()
