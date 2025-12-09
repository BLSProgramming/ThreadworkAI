from flask import Blueprint, request, jsonify, session
import bcrypt
from db_connection import get_db_connection

user_routes = Blueprint('user', __name__)

def password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_password(password, hashed_password):
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))


@user_routes.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    """
    Get user profile information.
    For now, returns mock data. In production, would check session/token
    and return actual user data from database.
    """
    # TODO: Get user_id from session or JWT token
    # For now, returning the most recent user as a placeholder
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Get the most recent user (placeholder - should use session)
        cursor.execute("""
            SELECT id, full_name, email, birth_date
            FROM users
            ORDER BY id DESC
            LIMIT 1
        """)
        
        row = cursor.fetchone()
        cursor.close()
        connection.close()
        
        if not row:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({
            "id": row[0],
            "full_name": row[1],
            "email": row[2],
            "birth_date": row[3] if row[3] else None
        }), 200
        
    except Exception as e:
        print(f"Error getting user profile: {e}")
        return jsonify({"error": str(e)}), 500


@user_routes.route('/api/user/profile', methods=['PUT'])
def update_user_profile():
    """
    Update user profile information.
    """
    data = request.json
    full_name = data.get('full_name')
    email = data.get('email')
    birth_date = data.get('birth_date')
    
    # TODO: Get user_id from session or JWT token
    # For now, updating the most recent user as a placeholder
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Get the most recent user ID (placeholder)
        cursor.execute("SELECT id FROM users ORDER BY id DESC LIMIT 1")
        user_row = cursor.fetchone()
        
        if not user_row:
            cursor.close()
            connection.close()
            return jsonify({"error": "User not found"}), 404
        
        user_id = user_row[0]
        
        # Update user profile
        cursor.execute("""
            UPDATE users
            SET full_name = %(full_name)s,
                email = %(email)s,
                birth_date = %(birth_date)s
            WHERE id = %(user_id)s
        """, {
            'full_name': full_name,
            'email': email,
            'birth_date': birth_date,
            'user_id': user_id
        })
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({"message": "Profile updated successfully"}), 200
        
    except Exception as e:
        print(f"Error updating user profile: {e}")
        return jsonify({"error": str(e)}), 500


@user_routes.route('/api/user/password', methods=['PUT'])
def update_password():
    """
    Update user password.
    """
    data = request.json
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not current_password or not new_password:
        return jsonify({"error": "Current and new password required"}), 400
    
    # TODO: Get user_id from session or JWT token
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Get the most recent user (placeholder)
        cursor.execute("SELECT id, password FROM users ORDER BY id DESC LIMIT 1")
        user_row = cursor.fetchone()
        
        if not user_row:
            cursor.close()
            connection.close()
            return jsonify({"error": "User not found"}), 404
        
        user_id = user_row[0]
        stored_hash = user_row[1]
        
        # Verify current password
        if not check_password(current_password, stored_hash):
            cursor.close()
            connection.close()
            return jsonify({"error": "Current password is incorrect"}), 401
        
        # Hash new password and update
        new_hash = password_hash(new_password)
        cursor.execute("""
            UPDATE users
            SET password = %(password)s
            WHERE id = %(user_id)s
        """, {
            'password': new_hash,
            'user_id': user_id
        })
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({"message": "Password updated successfully"}), 200
        
    except Exception as e:
        print(f"Error updating password: {e}")
        return jsonify({"error": str(e)}), 500
