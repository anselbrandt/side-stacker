import numpy as np
import torch
from pathlib import Path

from sidestacker import SideStacker
from .ResNet import ResNet
from .mcts import MCTS

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

sideStacker = SideStacker()

args = {
    "C": 2,
    "num_searches": 1000,
    "dirichlet_epsilon": 0.0,
    "dirichlet_alpha": 0.3,
}

model = ResNet(sideStacker, 4, 64, device)
model_path = Path("model_27.pt")
model.load_state_dict(torch.load(model_path, map_location=device))
model.eval()

mcts = MCTS(sideStacker, args, model)


def convert_board(board, player_symbol):
    symbol_map = {None: 0, player_symbol: 1, "O" if player_symbol == "X" else "X": -1}
    return np.array(
        [[symbol_map.get(cell, 0) for cell in row] for row in board], dtype=np.int8
    )


def action_to_row_col(action: int, size=7):
    row = action // size
    col = action % size
    return row, col


def alphazero_engine(board, player_symbol):
    state = convert_board(board, player_symbol)
    neutral_state = sideStacker.change_perspective(state, -1)
    mcts_probs = mcts.search(neutral_state)
    action = int(np.argmax(mcts_probs))
    row, col = action_to_row_col(action)
    return row, col
