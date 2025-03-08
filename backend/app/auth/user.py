import logging
from typing import Annotated

from fastapi import Depends, Request
import jwt

from app.user_models import User
from app.constants import COOKIE_NAME, TOKEN_ALGORITHM, TOKEN_SECRET

log = logging.getLogger("uvicorn")


def get_current_user(request: Request) -> User | None:
    token = request.cookies.get(COOKIE_NAME)
    if token is None:
        return None
    try:
        user = jwt.decode(token, TOKEN_SECRET, algorithms=[TOKEN_ALGORITHM])
        return user
    except Exception as error:
        log.info(f"{request.headers.items()}_{error}")
        return None


CurrentUser = Annotated[User, Depends(get_current_user)]
