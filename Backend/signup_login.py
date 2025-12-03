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
def add_username():
    special_characters = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '[', ']', '{', '}', '"', ':', ';', "'",
                          '/', '?', '>', '<', '|', '=', '+']
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # Checks username validity
    if len(username) >= 20:
        return jsonify({"error": "invalid username"}), 400

    for letter in username:
        if letter in special_characters:
            return jsonify({"error": "invalid username"}), 400

    # Hashed username and password
    hashed_password = password_hash(password)

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    # Check if the username already exists
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
        return jsonify({"error": "Username already taken"}), 409

    # Hash password and insert if email is free
    cursor.execute("""
    INSERT INTO users (username, email, password)
    VALUES (%(username)s, %(email)s, %(password)s)
    RETURNING id
    """, {
        'username': username,
        'email': email,
        'password': hashed_password
    })

    user_id = cursor.fetchone()[0]
    connection.commit()
    cursor.close()
    connection.close()

    return jsonify({"message": f"User {username} created successfully!"}), 200