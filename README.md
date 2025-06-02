# Side-Stacker

This project was originally developed as part of a technical interview take-home assignment. Fundamentally, a variant of Connect Four, where players alternate turns stacking pieces from either the left or right side of a row with the goal of placing four consecutive pieces horizontally, vertically, or diagonally.

## Requirements

1. Player vs player mode
2. Player vs AI bot with 3 levels of difficulty:
   1. Semi-random moves
   2. "Machine learning fundamentals"
   3. Full trained ML model

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
