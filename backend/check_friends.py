import database as db

def check_friends_schema():
    client = db.get_client()
    res = client.table("friends").select("*").limit(1).execute()
    print("Friends row:", res.data)

if __name__ == "__main__":
    check_friends_schema()
