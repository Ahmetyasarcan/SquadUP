import database as db

def test_update():
    user_id = "f4ea14a9-94b6-4ec6-94bc-6459e290e299"
    user_data = {
        "name": "Ahmet Test",
        "interests": ["voleybol", "yüzme"],
        "competition_level": 4
    }
    print(f"Attempting to update user {user_id}...")
    try:
        profile = db.update_user(user_id, user_data)
        print("Update successful!")
        print(f"Profile: {profile}")
    except Exception as e:
        print(f"Update failed: {e}")

if __name__ == "__main__":
    test_update()
