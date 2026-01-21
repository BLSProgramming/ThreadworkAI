from flask import Blueprint, request, jsonify, session
import bcrypt
from db_connection import get_db_connection
 
# Creates blueprints for sign up and login
signup_routes = Blueprint("signup_login", __name__)
 
# Hashes password
def password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
 
# Checks login password hash with stored password hash
def check_password(password, hashed_password):
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
 
 
@signup_routes.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    country = data.get('country')
 
    # Checks if fields are empty
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
 
    # Hashed password
    hashed_password = password_hash(password)
 
    connection = get_db_connection()
    cursor = connection.cursor()
 
    # Check if the email already exists
    cursor.execute("""
        SELECT 1
        FROM users
        WHERE email = %(email)s
        """, {
        'email': email
    })
    existing_user = cursor.fetchone()
 
    if existing_user:
        cursor.close()
        connection.close()
        return jsonify({"error": "Email already registered"}), 409
 
    # Hash password and insert if email is free
    cursor.execute("""
    INSERT INTO users (email, password, country)
    VALUES (%(email)s, %(password)s, %(country)s)
    RETURNING id
    """, {
        'email': email,
        'password': hashed_password,
        'country': country
    })
 
    user_id = cursor.fetchone()[0]
 
    connection.commit()
    cursor.close()
    connection.close()
 
    return jsonify({"message": "User created successfully!"}), 200
 
 
@signup_routes.route('/api/login', methods=["POST"])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
 
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
 
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
 
        # Get stored id and password from DB
        cursor.execute("""
            SELECT id, password
            FROM users
            WHERE email = %(email)s
        """, {
            'email': email
        })
        row = cursor.fetchone()
 
        # Checks if user exists
        if not row:
            cursor.close()
            connection.close()
            return jsonify({"error": "invalid email or password"}), 401
 
        user_id = row[0]
        stored_hash = row[1]
 
        # Checks password hash
        if not check_password(password, stored_hash):
            cursor.close()
            connection.close()
            return jsonify({"error": "invalid email or password"}), 401
 
        # Authenticate if passwords match
        session['user_id'] = user_id
        cursor.close()
        connection.close()
        print(user_id)
 
        return jsonify({"success": "access granted"}), 200
 
    except Exception as e:
        print("Error ", e)
        return jsonify({"error": str(e)})


@signup_routes.route('/api/check-auth', methods=['GET'])
def check_auth():
    """Check if user is authenticated via session"""
    user_id = session.get('user_id')
    
    if user_id:
        return jsonify({"authenticated": True, "user_id": user_id}), 200
    else:
        return jsonify({"authenticated": False}), 401


@signup_routes.route('/api/check-profile', methods=['GET'])
def check_profile():
    """Check if user's profile is complete"""
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        cursor.execute("""
            SELECT full_name, birth_date
            FROM users
            WHERE id = %(user_id)s
        """, {
            'user_id': user_id
        })
        row = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        if row and row[0] and row[1]:
            # Both full_name and birth_date exist
            return jsonify({"profileComplete": True}), 200
        else:
            return jsonify({"profileComplete": False}), 200
            
    except Exception as e:
        print("Check profile error:", e)
        return jsonify({"error": str(e)}), 500


@signup_routes.route('/api/complete-profile', methods=['POST'])
def complete_profile():
    """Complete profile for existing authenticated users"""
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    data = request.get_json()
    full_name = data.get('full_name')
    birth_date = data.get('birth_date')
    
    if not full_name or not birth_date:
        return jsonify({"error": "Full name and birth date required"}), 400
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        cursor.execute("""
            UPDATE users
            SET full_name = %(full_name)s, birth_date = %(birth_date)s
            WHERE id = %(user_id)s
        """, {
            'full_name': full_name,
            'birth_date': birth_date,
            'user_id': user_id
        })
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({"message": "Profile completed successfully"}), 200
        
    except Exception as e:
        print("Complete profile error:", e)
        return jsonify({"error": str(e)}), 500