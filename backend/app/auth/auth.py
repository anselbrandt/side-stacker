import time
from app.user_models import User
from utils import generateFruitname
from app.constants import COOKIE_EXPIRY


def create_user() -> User:
    current_time = int(time.time())
    expires = current_time + COOKIE_EXPIRY
    user = User(name=generateFruitname(), expires=expires)
    return user
