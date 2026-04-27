import database as db

def check_all_tables():
    client = db.get_client()
    print("Checking all potential tables...")
    for table in ["users", "sqlusers", "profiles", "friends"]:
        try:
            res = client.table(table).select("count", count="exact").limit(1).execute()
            print(f"Table '{table}' exists. Count: {res.count}")
        except Exception as e:
            print(f"Table '{table}' not found or error: {e}")

if __name__ == "__main__":
    check_all_tables()
