from flask import request, jsonify, Blueprint
from google.oauth2 import id_token
from google.auth.transport import requests
from utils import create_jwt
from auth_user import get_or_create_user
from dotenv import load_dotenv
import os

load_dotenv()

google_auth_blueprint = Blueprint("auth", __name__)
GOOGLE_CLIENT_ID = os.getenv("CLIENT_ID")

@google_auth_blueprint.route("/api/google-login", methods=["POST"])
def google_login():
    print("🔥 ENTERED /api/google-login ROUTE")

    # Parse JSON safely
    data = request.get_json(force=True, silent=True)
    print("Request JSON:", data)

    if not data or "credential" not in data:
        print("❌ No credential provided in request")
        return jsonify({"error": "Missing credential"}), 400

    credential = data["credential"]

    # Verify Google token
    try:
        print("🔹 Verifying Google token...")
        idinfo = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )
        print("✅ Token verified successfully")
        print("IDINFO:", idinfo)

    except ValueError as e:
        # Invalid token
        print("❌ Google token verification failed:", str(e))
        return jsonify({"error": "Invalid Google token"}), 401
    except Exception as e:
        print("❌ Unexpected error during token verification:", str(e))
        return jsonify({"error": "Token verification error"}), 500

    # Create or fetch user from DB
    try:
        user = get_or_create_user(
            google_id=idinfo["sub"],
            email=idinfo["email"],
            name=idinfo.get("name")
        )
        print("User fetched/created:", user)

    except Exception as e:
        print("❌ Error in get_or_create_user:", str(e))
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Database error"}), 500

    # Create JWT
    try:
        jwt_token = create_jwt(user["id"])
        print("JWT token created:", jwt_token)
    except Exception as e:
        print("❌ Error creating JWT:", str(e))
        return jsonify({"error": "JWT creation failed"}), 500

    # Return response
    response_data = {
        "token": jwt_token,
        "user": {
            "id": user["id"],
            "email": user["email"]
        },
        "needsProfile": user.get("needsProfile", False)
    }

    print("🔹 Response data ready:", response_data)
    return jsonify(response_data), 200
