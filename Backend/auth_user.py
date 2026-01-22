from db_connection import get_db_connection

def get_or_create_user(google_id, email, name):
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT id, email
        FROM users
        WHERE google_id = %(google_id)s
        """), {
        "google_id": google_id
        }

    user = cursor.fetchone()

    if user:
        cursor.close()
        connection.close()
        return {"id": user[0], "email": user[1]}

    cursor.execute("""
        INSERT INTO users (google_id, email, name)
        VALUES (%s, %s, %s)
        RETURNING id, email
        """,
        (google_id, email, name)
    )

    new_user = cursor.fetchone()
    connection.commit()

    cursor.close()
    connection.close()

    return {"id": new_user[0], "email": new_user[1]}
