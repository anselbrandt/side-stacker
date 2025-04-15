# Side Stacker AlphaZero

This repo contains game logic and algorithms to solve a variation of Connect Four. The origin of this game was a take-home coding exam whose description can be found below.

### Helpful Resources:

[Solving Connect 4: how to build a perfect AI](http://blog.gamesolver.org/)

[Alpha-Zero Connect Four NN](https://github.com/advait/c4a0) ([YouTube Presentation](https://www.youtube.com/watch?v=_Y26BFaVclg))

[AlphaZero from scratch in PyTorch for the game of Chain Reaction](https://medium.com/@bentou.pub/alphazero-from-scratch-in-pytorch-for-the-game-of-chain-reaction-part-1-8cffdc399233)

[Lessons From Implementing AlphaZero](https://medium.com/oracledevs/lessons-from-implementing-alphazero-7e36e9054191)

[AlphaZero from Scratch – Machine Learning Tutorial](https://www.youtube.com/watch?v=wuSQpLinRB4)

[AlphaZero from Scratch – Code](https://github.com/foersterrobert/Alp...)

## Side Stacker

### Difficulty: Advanced (senior full-stack applicants)

### Side-Stacker Game

This is essentially connect-four, but the pieces stack on either side of the board instead of bottom-up.

Two players see a board, which is a grid of 7 rows and 7 columns. They take turn adding pieces to a row, on one of the sides. The pieces stack on top of each other, and the game ends when there are no spaces left available, or when a player has four consecutive pieces on a diagonal, column, or row.

For example, the board might look like this:

```
0 [ _ _ _ _ _ _ _ ]
1 [ o x _ _ _ _ o ]
2 [ x _ _ _ _ _ x ]
3 [ x _ _ _ _ _ o ]
4 [ o _ _ _ _ _ _ ]
5 [ _ _ _ _ _ _ _ ]
6 [ _ _ _ _ _ _ _ ]
```

in this case, it is x’s turn. If x plays (2, R), the board will look like this:

```
0 [ _ _ _ _ _ _ _ ]
1 [ o x _ _ _ _ o ]
2 [ x _ _ _ _ x x ]
3 [ x _ _ _ _ _ o ]
4 [ o _ _ _ _ _ _ ]
5 [ _ _ _ _ _ _ _ ]
6 [ _ _ _ _ _ _ _ ]
```

The take-home task is to implement the 2-player version of this game, where each player sees the board in their frontend and can place moves that the other player sees, and the game should display “player 1 won” “player 2 lost” when the game is complete.

The implementation should include an AI bot that integrates with the game so players can compete against it.

The bot can have different difficulty levels, but at least medium difficulty is required:

- Easy: the bot makes semi-random moves with basic rules
- Medium: the bot uses basic strategies and machine learning fundamentals
- Hard: the bot uses a complete ML model

The game can have multiple game modes:

- Player vs Player (required)
- Player vs AI Bot (required)
- AI Bot vs AI Bot (optional)

Please store the game in the backend using a relational database; how you define your models is up to you. You should not have to refresh the page to see your opponent’s moves.
