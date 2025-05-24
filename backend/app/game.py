import json
import time
from typing import List

from app.models import Game
from app.constants import COOKIE_EXPIRY, BOARD_SIZE
from app.models import User


def new_board():
    return [[None for j in range(BOARD_SIZE)] for i in range(BOARD_SIZE)]


def create_game(user: User) -> Game:
    current_time = int(time.time())
    expires = current_time + COOKIE_EXPIRY
    board = new_board()
    players = {str(user.id): "X"}
    game = Game(
        owners=[user],
        expires=expires,
        board_raw=json.dumps(board),
        players=players,
        turn="X",
        winner=None,
    )
    game.board
    return game


def create_multiplayer_game(users: List[User]) -> Game:
    current_time = int(time.time())
    expires = current_time + COOKIE_EXPIRY
    board = new_board()
    ids = [user.id for user in users]
    players = {str(ids[0]): "X"}
    if len(ids) == 2:
        players = {str(ids[0]): "X", str(ids[1]): "O"}
    game = Game(
        expires=expires,
        board_raw=json.dumps(board),
        players=players,
        turn="X",
        winner=None,
    )
    game.board
    return game
