from flask import request, jsonify, Blueprint
from utils import create_jwt
from db_connection import get_db_connection
import traceback

profile_blueprint = Blueprint("profile", __name__)

@profile_blueprint.route("/api/complete-google-profile", methods=["POST"])
def complete_google_profile():
    try:
        data = request.get_json()
        full_name = data.get("full_name")
        birth_date = data.get("birth_date")
        country = data.get("country")
        password = data.get("password")  # optional, email signup only

        # Extract JWT from cookies or Authorization header
        auth_header = request.headers.get("Authorization", "")
        token = None
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        elif "jwt_token" in request.cookies:
            token = request.cookies.get("jwt_token")

        if not token:
            return jsonify({"error": "Missing JWT token"}), 401

        # Decode JWT to get user_id
        decoded = decode_jwt(token)
        user_id = decoded.get("user_id")
        if not user_id:
            return jsonify({"error": "Invalid JWT"}), 401

        connection = get_db_connection()
        cursor = connection.cursor()

        # Build dynamic SET clause
        fields = []
        values = []

        if full_name:
            fields.append("full_name = %s")
            values.append(full_name)
        if birth_date:
            fields.append("birth_date = %s")
            values.append(birth_date)
        if country:
            fields.append("country = %s")
            values.append(country)
        if password:
            fields.append("password = %s")  # consider hashing
            values.append(password)

        if not fields:
            return jsonify({"error": "No profile fields to update"}), 400

        values.append(user_id)
        sql = f"""
                UPDATE users
                SET {', '.join(fields)}
                WHERE id = %s
                RETURNING id, email
            """
        cursor.execute(sql, tuple(values))
        user = cursor.fetchone()
        connection.commit()
        cursor.close()
        connection.close()

        if not user:
            return jsonify({"error": "User not found"}), 404

        # Create a new JWT for the updated profile
        jwt_token = create_jwt(user[0])

        return jsonify({
            "token": jwt_token,
            "user": {
                "id": user[0],
                "email": user[1]
            },
            "needsProfile": False
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
