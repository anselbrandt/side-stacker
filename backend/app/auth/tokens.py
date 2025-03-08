from datetime import datetime, timedelta
import jwt

from app.constants import TOKEN_SECRET, TOKEN_ALGORITHM
from app.user_models import User


def create_jwt(user: User):
    expiration = datetime.now() + timedelta(hours=24)
    token = jwt.encode(
        {
            **user.model_dump(),
            "expiration": expiration.timestamp(),
        },
        TOKEN_SECRET,
        algorithm=TOKEN_ALGORITHM,
    )
    return token
