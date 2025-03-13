import json
import time
from typing import List

from app.models import Game
from app.constants import COOKIE_EXPIRY, BOARD_SIZE
from app.models import User


def new_board():
    return [[None for j in range(BOARD_SIZE)] for i in range(BOARD_SIZE)]


def create_game(users: List[User]) -> Game:
    current_time = int(time.time())
    expires = current_time + COOKIE_EXPIRY
    board = new_board()
    ids = [user["id"] for user in users]
    players = {str(ids[0]): "X"}
    if len(ids) == 2:
        players = {str(ids[0]): "X", ids[1]: "O"}
    game = Game(
        owners=ids,
        expires=expires,
        board=json.dumps(board),
        players=players,
        turn="X",
        winner=None,
    )
    return game
