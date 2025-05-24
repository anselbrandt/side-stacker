from datetime import datetime, timedelta
from typing import Annotated
import logging
import time

from fastapi import Depends, Request
from fastapi.security.utils import get_authorization_scheme_param
import jwt

from app.constants import COOKIE_NAME, COOKIE_EXPIRY, TOKEN_ALGORITHM, TOKEN_SECRET
from app.models import User, UserDict
from utils import generateFruitname

log = logging.getLogger("uvicorn")


def decode_token(token) -> UserDict:
    user = jwt.decode(token, TOKEN_SECRET, algorithms=[TOKEN_ALGORITHM])
    return user


def get_current_user(request: Request) -> User | None:
    authorization: str = request.headers.get("Authorization")
    if not authorization:
        return None

    scheme, token = get_authorization_scheme_param(authorization)
    if scheme.lower() != "bearer":
        return None

    try:
        user = decode_token(token)
        return User(id=user["id"], name=user["name"], expires=user["expires"])
    except Exception as error:
        log.info(f"{request.headers.items()}_{error}")
        return None


CurrentUser = Annotated[User, Depends(get_current_user)]


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


def create_user() -> User:
    current_time = int(time.time())
    expires = current_time + COOKIE_EXPIRY
    user = User(name=generateFruitname(), expires=expires)
    return user
