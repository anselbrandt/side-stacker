# Side-Stacker

This project was originally developed as part of a technical interview take-home assignment. Fundamentally, a variant of Connect Four, where players alternate turns stacking pieces from either the left or right side of a row with the goal of placing four consecutive pieces horizontally, vertically, or diagonally.

## Core Features

1. **Player vs Player** mode with real-time interaction.
2. **Player vs AI Bot**, featuring three difficulty levels:
   - **Easy**: Semi-random legal moves.
   - **Medium**: AI using basic machine learning fundamentals
   - **Hard**: AI powered by a fully trained machine learning model

## Technicaly requirements

- **Frontend**: Built with React (or vanilla JS), using modern ES6+ syntax and supporting real-time updates without requiring page reloads.
- **Backend**: Game state persisted to a relational database.
- **Communication**: WebSockets strongly recommended

## Challenges

Implementing the game mechanics and frontend logic was fairly straightforward, but not a lot of guidance was given regarding the AI bot.

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
