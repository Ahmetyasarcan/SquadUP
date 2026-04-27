import database as db
import uuid

def test_registration_flow():
    email = f"squadup_test_{uuid.uuid4().hex[:6]}@gmail.com"
    password = "password123"
    
    print(f"1. Attempting sign_up for {email}...")
    try:
        auth_res = db.sign_up(email, password)
        user_id = auth_res.user.id
        print(f"   Auth success. User ID: {user_id}")
        
        print(f"2. Attempting create_user in 'users' table...")
        user_data = {
            "name": "Test User",
            "email": email,
            "interests": [],
            "competition_level": 3
        }
        profile = db.create_user(user_data, auth_id=user_id)
        print(f"   Table success. Profile: {profile}")
        
        print(f"3. Verifying if user exists in table...")
        check = db.get_user_by_id(user_id)
        if check:
            print("   Verification SUCCESS: User found in table.")
        else:
            print("   Verification FAILED: User NOT found in table after successful insert!")
            
    except Exception as e:
        print(f"   ERROR: {e}")

if __name__ == "__main__":
    test_registration_flow()
