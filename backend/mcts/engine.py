import numpy as np

from sidestacker import SideStacker
from .mcts import MCTS

sideStacker = SideStacker()

args = {"C": 1.41, "num_searches": 1000}

mcts = MCTS(sideStacker, args)


def convert_board(board, player_symbol):
    symbol_map = {None: 0, player_symbol: 1, "O" if player_symbol == "X" else "X": -1}
    return np.array(
        [[symbol_map.get(cell, 0) for cell in row] for row in board], dtype=np.int8
    )


def action_to_row_col(action: int, size=7):
    row = action // size
    col = action % size
    return row, col


def mcts_engine(board, player_symbol):
    state = convert_board(board, player_symbol)
    neutral_state = sideStacker.change_perspective(state, -1)
    mcts_probs = mcts.search(neutral_state)
    action = int(np.argmax(mcts_probs))
    row, col = action_to_row_col(action)
    return row, col
