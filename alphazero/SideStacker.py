import numpy as np
from numpy.typing import NDArray

SIZE = 7
TARGET = 4

type Board = NDArray[np.int8]


class SideStacker:
    def __init__(self):
        self.column_count = SIZE
        self.row_count = SIZE
        self.size = SIZE
        self.target = TARGET
        self.action_size = self.size * self.size

    def __repr__(self):
        return "SideStacker"

    def get_initial_state(self) -> Board:
        return np.zeros((self.size, self.size), dtype=np.int8)

    def get_next_state(self, state: Board, action: int, player: int) -> Board:
        row = action // self.column_count
        col = action % self.column_count
        state[row, col] = player
        return state

    def get_valid_moves(self, state=None) -> NDArray[np.uint8]:
        if state is None:
            state = np.zeros((self.size, self.size), dtype=np.int8)

        mask = np.zeros((self.size, self.size), dtype=np.uint8)
        for i, row in enumerate(state):
            zero_indices = np.flatnonzero(row == 0)
            if zero_indices.size:
                left = zero_indices[0]
                right = zero_indices[-1]
                mask[i, left] = 1
                if left != right:
                    mask[i, right] = 1
        return mask.flatten()

    def check_win(self, state: Board, action: int) -> bool:
        if action is None:
            return False

        i = action // self.column_count
        j = action % self.column_count
        player = state[i, j]
        if player == 0:
            return False

        directions = [(0, 1), (1, 0), (1, 1), (-1, 1)]

        for di, dj in directions:
            count = 1
            for sign in [1, -1]:
                x, y = i + sign * di, j + sign * dj
                while (
                    0 <= x < self.size
                    and 0 <= y < self.size
                    and state[x, y] == player
                    and count < self.target
                ):
                    count += 1
                    x += sign * di
                    y += sign * dj
            if count >= self.target:
                return True

        return False

    def winning_moves(self, state: Board, player: int) -> NDArray[np.uint8]:
        mask = np.zeros((self.size * self.size,), dtype=np.uint8)
        valid_mask = self.get_valid_moves(state)

        for idx in np.flatnonzero(valid_mask):
            row, col = idx // self.column_count, idx % self.column_count
            original = state[row, col]
            state[row, col] = player
            if self.check_win(state, idx):
                mask[idx] = 1
            state[row, col] = original

        return mask

    def blocking_moves(self, state: Board, player: int) -> NDArray[np.uint8]:
        mask = np.zeros((self.size * self.size,), dtype=np.uint8)
        valid_mask = self.get_valid_moves(state)

        for idx in np.flatnonzero(valid_mask):
            row, col = idx // self.column_count, idx % self.column_count
            original = state[row, col]
            state[row, col] = -player
            if self.check_win(state, idx):
                mask[idx] = 1
            state[row, col] = original

        return mask

    def get_value_and_terminated(self, state: Board, action: int):
        if self.check_win(state, action):
            return 1, True
        if not self.get_valid_moves(state).any():
            return 0, True
        return 0, False

    def get_opponent(self, player: int):
        return -player

    def get_opponent_value(self, value: int):
        return -value

    def change_perspective(self, state: Board, player: int):
        return state * player

    def get_encoded_state(self, state: Board) -> NDArray[np.float32]:
        encoded_state = np.array(
            [state == -1, state == 0, state == 1], dtype=np.float32
        )
        if len(state.shape) == 3:
            encoded_state = np.swapaxes(encoded_state, 0, 1)

        return encoded_state
