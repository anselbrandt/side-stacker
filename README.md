# Side-Stacker

This project was originally developed as part of a technical interview take-home assignment. Fundamentally, a variant of Connect Four, where players alternate turns stacking pieces from either the left or right side of a row with the goal of placing four consecutive pieces horizontally, vertically, or diagonally.

## Core Features

1. **Player vs Player** mode with real-time interaction.
2. **Player vs AI Bot**, featuring three difficulty levels:
   - **Easy**: Semi-random legal moves.
   - **Medium**: AI using basic machine learning fundamentals
   - **Hard**: AI powered by a fully trained machine learning model

## Technical requirements

- **Frontend**: Built with React (or vanilla JS), using modern ES6+ syntax and supporting real-time updates without requiring page reloads.
- **Backend**: Game state persisted to a relational database.
- **Communication**: WebSockets strongly recommended

## Challenges

Implementing the game mechanics and frontend logic was fairly straightforward, but not a lot of guidance was given regarding the AI bot.

## AlphaZero

[AlphaZero](https://en.wikipedia.org/wiki/AlphaZero) is a state of the art algorithm developed for playing chess, shogi and go. Luckily it also works for other turn based games, like Connect Four.

Alphazero consists of two parts:

1. A modified [Monte-Carlo Tree Search (MCTS)](https://en.wikipedia.org/wiki/Monte_Carlo_tree_search)
2. A [Residual Neural Network (ResNet)](https://en.wikipedia.org/wiki/Residual_neural_network)

This is fortuitous, since a standalone Monte-Carlo tree search can be used as the basis for the "medium" difficulty bot, and the full AlphaZero algorithm can be used for "hard" mode.

Fortunately much has been written about the AlphaZero algorithm. Some good resources include:

#### AlphaZero from Scratch

1. [AlphaZero from scratch in PyTorch for the game of Chain Reaction — Part 1](https://medium.com/@bentou.pub/alphazero-from-scratch-in-pytorch-for-the-game-of-chain-reaction-part-1-8cffdc399233)
2. [AlphaZero from scratch in PyTorch for the game of Chain Reaction — Part 2](https://medium.com/@bentou.pub/alphazero-from-scratch-in-pytorch-for-the-game-of-chain-reaction-part-2-b2e7edda14fb)
3. [AlphaZero from scratch in PyTorch for the game of Chain Reaction — Part 3](https://medium.com/@bentou.pub/alphazero-from-scratch-in-pytorch-for-the-game-of-chain-reaction-part-3-c3fbf0d6f986)

#### Lessons From Implementing AlphaZero

1. [Lessons From Implementing AlphaZero](https://medium.com/oracledevs/lessons-from-implementing-alphazero-7e36e9054191)
2. [Lessons from AlphaZero: Connect Four](https://medium.com/oracledevs/lessons-from-alphazero-connect-four-e4a0ae82af68)
3. [Lessons from AlphaZero (part 3): Parameter Tweaking
   ](https://medium.com/oracledevs/lessons-from-alphazero-part-3-parameter-tweaking-4dceb78ed1e5)
4. [Lessons From AlphaZero (part 4): Improving the Training Target](https://medium.com/oracledevs/lessons-from-alphazero-part-4-improving-the-training-target-6efba2e71628)
5. [Lessons From Alpha Zero (part 5): Performance Optimization](https://medium.com/oracledevs/lessons-from-alpha-zero-part-5-performance-optimization-664b38dc509e)
6. [Lessons From Alpha Zero (part 6) — Hyperparameter Tuning](https://medium.com/oracledevs/lessons-from-alpha-zero-part-6-hyperparameter-tuning-b1cfcbe4ca9a)

## Frontend

Fairly straightforward Next.js application containing all game logic for standalone play in "Easy" mode. Most of the complexity is in managing state for the websocket connection.

## Backend

Lightweight [FastAPI](https://fastapi.tiangolo.com/) based server backed by SQLite for persisting game state. Engines for Monte-Carlo tree search and AlphaZero reside in the backend, primarily because the AlphaZero implementation was developed in Python notebooks `/alphazero/MCTS.ipyunb` and `/alphazero/AlphaZero_Training.ipynb`.

### Run

#### Backend

```
cd backend && uv sync

&&

uv run task dev

or

uv run uvicorn main:app --reload
```

#### Frontend

```
cd frontend && npm install

&&

npm run dev
```
