from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated

from fastapi import (
    Depends,
    FastAPI,
    Request,
    Response,
    status,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
    WebSocketException,
    Cookie,
    Query,
)
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
    cleanup_games,
    find_game,
    find_games_by_owner,
    update_game,
    reset_board,
)
from app.constants import ROOT_PATH, COOKIE_NAME, COOKIE_EXPIRY
from app.auth import CurrentUser, create_user, create_jwt, decode_token
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
async def login(
    request: Request, user: CurrentUser, session: Session = Depends(get_session)
):
    cleanup_users(session)
    if user:
        jwt_token = request.cookies.get(COOKIE_NAME)
        return {**user, "token": jwt_token}
    else:
        user = create_user()
        new_user = add_user(session, user)
        jwt_token = create_jwt(new_user)
        response = JSONResponse(content={**user.model_dump(), "token": jwt_token})
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
    cleanup_games(session)
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


class Reset(BaseModel):
    id: int


@app.post("/reset")
async def reset(
    reset: Reset, user: CurrentUser, session: Session = Depends(get_session)
):
    if user is None:
        raise HTTPException(status_code=404, detail="Item not found")
    else:
        game = find_game(session, game_id=reset.id)
        updated_game = reset_board(session, game)
        return updated_game


@app.post("/logout")
async def logout(response: Response):
    response.delete_cookie(COOKIE_NAME)
    response.status_code = status.HTTP_200_OK
    return response


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
        self.users: dict[WebSocket, dict] = {}

    async def connect(self, websocket: WebSocket, token: str):
        user = decode_token(token)
        self.users[websocket] = user
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            deleted_user = self.users[websocket]
            del self.users[websocket]
            return deleted_user

    async def send(self, data, websocket: WebSocket):
        await websocket.send_json(data=data)

    async def broadcast(self, data):
        for connection in self.active_connections:
            await connection.send_json(data=data)


manager = ConnectionManager()


async def get_token(
    websocket: WebSocket,
    token: Annotated[str | None, Query()] = None,
):
    if token is None:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)
    return token


@app.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: int,
    token: Annotated[str, Depends(get_token)],
):
    await manager.connect(websocket, token)
    try:
        while True:
            data = await websocket.receive_json()
            user_name = manager.users.get(websocket)["name"]
            await manager.send(
                data={"message": f'Your message was: "{data["message"]}"'},
                websocket=websocket,
            )
            await manager.broadcast(data={"joined": user_name})
    except WebSocketDisconnect:
        user = manager.disconnect(websocket)
        user_name = user["name"]
        await manager.broadcast(data={"left": user_name})


app.mount("/", StaticFiles(directory="../dist", html=True), name="dist")
