import jwt
from datetime import datetime, timedelta
import os

JWT_SECRET = os.getenv('JWT_SECRET')
JWT_ALGO = os.getenv('JWT_ALGO')

def create_jwt(user_id):
    return jwt.encode(
        {
            "user_id": user_id,
            "exp": datetime.utcnow() + timedelta(days=7)
        },
        JWT_SECRET,
        algorithm=JWT_ALGO
    )
