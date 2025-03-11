import json
import time
from typing import List

from app.game_models import ActiveGame
from app.constants import COOKIE_EXPIRY, BOARD_SIZE
from app.user_models import User


def new_board():
    return [[None for j in range(BOARD_SIZE)] for i in range(BOARD_SIZE)]


def create_game(users: List[User]) -> ActiveGame:
    current_time = int(time.time())
    expires = current_time + COOKIE_EXPIRY
    board = new_board()
    ids = [user["id"] for user in users]
    if len(ids) == 1:
        players = {str(ids[0]): "X"}
    elif len(ids) == 2:
        players = {str(ids[0]): "X", ids[1]: "O"}
    game = ActiveGame(
        owners=ids,
        expires=expires,
        board=json.dumps(board),
        players=json.dumps(players),
        turn="X",
    )
    return game
