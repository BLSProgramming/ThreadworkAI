import jwt
from datetime import datetime, timedelta
import os

JWT_SECRET = os.getenv('JWT_SECRET')
JWT_ALGO = os.getenv('JWT_ALGO')

def create_jwt(user_id):
    token = jwt.encode(
        {
            "user_id": user_id,
            "exp": datetime.utcnow() + timedelta(days=7)
        },
        JWT_SECRET,
        algorithm=JWT_ALGO
    )
    # PyJWT 2.x returns a string, but ensure it's always a string
    if isinstance(token, bytes):
        token = token.decode('utf-8')
    return token
