import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
import numpy as np

size = 7
display_size = 3


def display_board(board):
    colors = {0: "white", 1: "blue", -1: "red"}
    fig, ax = plt.subplots(figsize=(display_size, display_size))
    ax.set_xticks(np.arange(size + 1) - 0.5, minor=True)
    ax.set_yticks(np.arange(size + 1) - 0.5, minor=True)
    ax.grid(which="minor", color="black", linestyle="-", linewidth=2)
    ax.tick_params(
        which="both", bottom=False, left=False, labelbottom=False, labelleft=False
    )

    for i in range(size):
        for j in range(size):
            color = colors[board[i][j]]
            ax.add_patch(Rectangle((j - 0.5, size - 1 - i - 0.5), 1, 1, color=color))

    plt.show()
