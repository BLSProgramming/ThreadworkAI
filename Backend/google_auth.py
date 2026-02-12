from google.oauth2 import id_token
from google.auth.transport import requests
from flask import request, jsonify, Blueprint, session

from auth_user import get_or_create_user

from dotenv import load_dotenv
import os
import traceback

load_dotenv()

google_auth_blueprint = Blueprint("auth", __name__)

GOOGLE_CLIENT_ID = os.getenv('CLIENT_ID')
print(f"🔧 Backend Google CLIENT_ID loaded: {GOOGLE_CLIENT_ID}")

@google_auth_blueprint.route('/api/google-signup', methods=["POST"])
def google_signup():
    try:
        credential = request.json.get("credential")
        
        if not credential:
            return jsonify({"error": "No credential provided"}), 400

        # Verify the Google token (10s clock-skew tolerance)
        idinfo = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10
        )

        # Create or get user
        user = get_or_create_user(
            google_id=idinfo["sub"],
            email=idinfo["email"],
            name=idinfo.get("name")
        )

        session['user_id'] = user["id"]
        
        response_data = {
            "user": {
                "id": user["id"],
                "email": user["email"]
            },
            "needsProfile": user.get("needsProfile", False)
        }
        
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

        # Verify the Google token (10s clock-skew tolerance)
        # Retry once on transient ValueError (key-fetch hiccup)
        idinfo = None
        for attempt in range(2):
            try:
                idinfo = id_token.verify_oauth2_token(
                    credential,
                    requests.Request(),
                    GOOGLE_CLIENT_ID,
                    clock_skew_in_seconds=10
                )
                break
            except ValueError as ve:
                print(f"Google login verify attempt {attempt+1} failed: {ve}")
                if attempt == 1:
                    raise

        # Get or create user (same logic as signup for OAuth)
        user = get_or_create_user(
            google_id=idinfo["sub"],
            email=idinfo["email"],
            name=idinfo.get("name")
        )

        session['user_id'] = user["id"]

        return jsonify({
            "user": {
                "id": user["id"],
                "email": user["email"]
            },
            "needsProfile": user.get("needsProfile", False)
        }), 200

    except ValueError as e:
        print("Google login ValueError:", str(e))
        traceback.print_exc()
        return jsonify({"error": "Invalid Google token"}), 401
    except Exception as e:
        print("Google login Exception:", str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
