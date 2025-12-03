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
    full_name = data.get('full_name')
    email = data.get('email')
    password = data.get('password')

    if not full_name or not password:
        return jsonify({"error": "Full name and password required"}), 400

    # Checks username validity
    if len(full_name) >= 20:
        return jsonify({"error": "invalid username"}), 400

    for letter in full_name:
        if letter in special_characters:
            return jsonify({"error": "invalid username"}), 400

    # Hashed username and password
    hashed_password = password_hash(password)

    if not full_name or not password:
        return jsonify({'error': 'Full name and password required'}), 400

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
    INSERT INTO users (full_name, email, password)
    VALUES (%(full_name)s, %(email)s, %(password)s)
    RETURNING id
    """, {
        'full_name': full_name,
        'email': email,
        'password': hashed_password
    })

    user_id = cursor.fetchone()[0]
    connection.commit()
    cursor.close()
    connection.close()

    return jsonify({"message": f"User {full_name} created successfully!"}), 200