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
def google_auth():
    token = request.json.get("token")

    idinfo = id_token.verify_oauth2_token(
        token,
        requests.Request(),
        GOOGLE_CLIENT_ID
    )

    user = get_or_create_user(
        google_id=idinfo["sub"],
        email=idinfo["email"],
        name=idinfo.get("name")
    )

    jwt_token = create_jwt(user["id"])

    return jsonify({
        "token": jwt_token,
        "user": user
    })
