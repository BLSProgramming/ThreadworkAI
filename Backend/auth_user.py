from db_connection import get_db_connection

def get_or_create_user(google_id, email, name):
    connection = get_db_connection()
    cursor = connection.cursor()

    # Check if user already exists
    cursor.execute("""
        SELECT id, email, full_name, birth_date
        FROM users
        WHERE google_id = %s
        """,
        (google_id,)
    )

    user = cursor.fetchone()

    if user:
        # Existing user - check if profile is complete
        profile_complete = bool(user[2] and user[3])  # full_name and birth_date
        cursor.close()
        connection.close()
        return {
            "id": user[0],
            "email": user[1],
            "isNewUser": False,
            "needsProfile": not profile_complete
        }

    # Create new user
    cursor.execute("""
        INSERT INTO users (google_id, email, full_name)
        VALUES (%s, %s, %s)
        RETURNING id, email
        """,
        (google_id, email, name)
    )

    new_user = cursor.fetchone()
    connection.commit()

    cursor.close()
    connection.close()

    return {
        "id": new_user[0],
        "email": new_user[1],
        "isNewUser": True,
        "needsProfile": True
    }
