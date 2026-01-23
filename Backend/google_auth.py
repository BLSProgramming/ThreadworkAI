from google.oauth2 import id_token
from google.auth.transport import requests
from flask import request, jsonify, Blueprint

from utils import create_jwt
from auth_user import get_or_create_user

from dotenv import load_dotenv
import os

load_dotenv()

google_auth_blueprint = Blueprint("auth", __name__)

GOOGLE_CLIENT_ID = os.getenv('CLIENT_ID')

@google_auth_blueprint.route('/api/google-signup', methods=["POST"])
def google_signup():
    try:
        credential = request.json.get("credential")
        
        if not credential:
            return jsonify({"error": "No credential provided"}), 400

        # Verify the Google token
        idinfo = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )

        # Create or get user
        user = get_or_create_user(
            google_id=idinfo["sub"],
            email=idinfo["email"],
            name=idinfo.get("name")
        )

        # Create JWT token
        jwt_token = create_jwt(user["id"])
        
        response_data = {
            "token": jwt_token,
            "user": {
                "id": user["id"],
                "email": user["email"]
            },
            "needsProfile": user.get("needsProfile", False)
        }
        
        print("Google signup response:", response_data)
        print("Token type:", type(jwt_token))
        
        return jsonify(response_data), 200

    except ValueError as e:
        # Invalid token
        print("Google signup ValueError:", str(e))
        return jsonify({"error": "Invalid Google token"}), 401
    except Exception as e:
        print("Google signup Exception:", str(e))
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@google_auth_blueprint.route('/api/google-login', methods=["POST"])
def google_login():
    try:
        credential = request.json.get("credential")
        
        if not credential:
            return jsonify({"error": "No credential provided"}), 400

        # Verify the Google token
        idinfo = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )

        # Get or create user (same logic as signup for OAuth)
        user = get_or_create_user(
            google_id=idinfo["sub"],
            email=idinfo["email"],
            name=idinfo.get("name")
        )

        # Create JWT token
        jwt_token = create_jwt(user["id"])

        return jsonify({
            "token": jwt_token,
            "user": {
                "id": user["id"],
                "email": user["email"]
            },
            "needsProfile": user.get("needsProfile", False)
        }), 200

    except ValueError as e:
        # Invalid token
        return jsonify({"error": "Invalid Google token"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500
