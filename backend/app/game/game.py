import time
from app.game_models import ActivateGame
from app.constants import COOKIE_EXPIRY, BOARD_SIZE
import json


def create_game(user) -> ActivateGame:
    current_time = int(time.time())
    expires = current_time + COOKIE_EXPIRY
    board = [[None for j in range(BOARD_SIZE)] for i in range(BOARD_SIZE)]
    game = ActivateGame(owner=user["id"], expires=expires, board=json.dumps(board))
    return game
