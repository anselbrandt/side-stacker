from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, Request, Response, status, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session
from pydantic import BaseModel

from app.db import (
    init_db,
    get_session,
    add_user,
    cleanup_users,
    add_game,
    find_game,
    find_games_by_owner,
    update_game,
)
from app.constants import ROOT_PATH, COOKIE_NAME, COOKIE_EXPIRY
from app.auth import CurrentUser, create_user, create_jwt
from app.game import create_game

dist = Path("../dist")
dist.mkdir(exist_ok=True)

origins = [
    "http://localhost:5173",
    "http://localhost:8000",
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    process = None
    try:
        init_db()
        yield
    finally:
        if process:
            process.terminate()


app = FastAPI(root_path=ROOT_PATH, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health(request: Request, response: Response):
    response.status_code = status.HTTP_200_OK
    return {"status": "ok"}


@app.get("/count/{count}")
async def add(
    count: int,
    request: Request,
    response: Response,
):
    return {"count": count + 1}


@app.get("/login")
async def login(user: CurrentUser, session: Session = Depends(get_session)):
    cleanup_users(session)
    if user:
        return user
    else:
        user = create_user()
        new_user = add_user(session, user)
        jwt_token = create_jwt(new_user)
        response = JSONResponse(content={**user.model_dump()})
        response.set_cookie(
            key=COOKIE_NAME,
            value=jwt_token,
            httponly=True,
            max_age=COOKIE_EXPIRY,
            secure=True,
            samesite="strict",
        )
        return response


@app.get("/board")
async def get_board(user: CurrentUser, session: Session = Depends(get_session)):
    if user is None:
        raise HTTPException(status_code=404, detail="Item not found")
    existing_game = find_games_by_owner(session, user["id"])
    if existing_game:
        return existing_game
    else:
        game = create_game(user)
        new_game = add_game(session, game)
        return new_game


class Move(BaseModel):
    i: int
    j: int
    id: int
    player: str


@app.post("/move")
async def create_move(
    move: Move, user: CurrentUser, session: Session = Depends(get_session)
):
    if user is None:
        raise HTTPException(status_code=404, detail="Item not found")
    else:
        game = find_game(session, game_id=move.id)
        position = (move.i, move.j)
        symbol = move.player
        updated_game = update_game(session, game, position, symbol)
        return updated_game


@app.post("/logout")
async def logout(response: Response):
    response.delete_cookie(COOKIE_NAME)
    response.status_code = status.HTTP_200_OK
    return response


app.mount("/", StaticFiles(directory="../dist", html=True), name="dist")
