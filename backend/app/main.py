from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated
import json

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
    delete_game,
    add_shared_game,
)
from app.constants import ROOT_PATH, COOKIE_NAME, COOKIE_EXPIRY
from app.auth import CurrentUser, create_user, create_jwt, decode_token
from app.game import create_game
from app.user_models import User

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
        game = create_game(users=[user])
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
        self.ids: dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user: User):
        self.active_connections.append(websocket)
        self.users[websocket] = {**user, "available": True}
        self.ids[user["id"]] = websocket
        await websocket.accept()

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            deleted_user = self.users.pop(websocket)
            user_id = deleted_user["id"]
            self.ids.pop(user_id, None)
            return deleted_user

    async def send(self, data, websocket: WebSocket):
        await websocket.send_json(data=data)

    async def send_by_id(self, data, id: int):
        websocket = self.ids.get(id)
        if websocket:
            await websocket.send_json(data=data)
        else:
            raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)

    async def broadcast(self, data):
        for connection in self.active_connections:
            await connection.send_json(data=data)

    def get_users(self):
        users = [
            {"id": user["id"], "name": user["name"], "available": user["available"]}
            for user in self.users.values()
        ]
        return users

    def get_user(self, id: int):
        user = [
            {"id": user["id"], "name": user["name"], "available": user["available"]}
            for user in self.users.values()
            if user["id"] == id
        ][0]
        return user

    def update_availability(self, id: int, available: bool):
        websocket = self.ids.get(id)
        if websocket and websocket in self.users:
            self.users[websocket]["available"] = available


manager = ConnectionManager()


async def get_user_from_token(
    websocket: WebSocket,
    token: Annotated[str | None, Query()] = None,
):
    if token is None:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)
    user = decode_token(token)
    return user


@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    user: Annotated[User, Depends(get_user_from_token)],
    session: Session = Depends(get_session),
):
    await manager.connect(websocket, user)
    users = manager.get_users()
    await manager.broadcast(data={"online": users})
    requester_id = user["id"]
    requester_name = user["name"]
    try:
        while True:
            data = await websocket.receive_json()
            if "invite" in data:
                await manager.send_by_id(
                    data={"invite": {"id": requester_id, "name": requester_name}},
                    id=data["invite"],
                )
            if "quit" in data:
                await manager.send_by_id(
                    data={
                        "quitnotification": {"id": requester_id, "name": requester_name}
                    },
                    id=data["quit"],
                )
            if "available" in data:
                status = data["available"]
                manager.update_availability(requester_id, status)
                users = manager.get_users()
                await manager.broadcast(data={"online": users})
            if "accept" in data:
                # [x] cleanup games belonging to each player
                # [x] create a shared game
                # [x] persist the game to sqlite
                # [x] send the board to each player
                # [] persist the shared game player ids to a local variable
                # [] notify other player invitee has accepted
                # [] frontend should reset the board, setplayer and setturn
                # [] set alert for player going first
                # [] set alert for other player remote player is going first

                user_to_notify = manager.get_user(data["accept"])
                ids = [requester_id, user_to_notify["id"]]

                # refactor to bulk delete - may require sqlalchemy
                delete_game(session, ids[0])
                delete_game(session, ids[1])

                shared_game = create_game(users=[user, user_to_notify])
                game = add_shared_game(session, shared_game)
                owners = game.owners
                players = game.players
                board = game.board
                payload = {
                    "multiplayer_start": {
                        "owners": owners,
                        "players": players,
                        "board": board,
                    }
                }
                await manager.send_by_id(data=payload, id=ids[0])
                await manager.send_by_id(data=payload, id=ids[1])

    except WebSocketDisconnect:
        user = manager.disconnect(websocket)
        user_name = user["name"]
        await manager.broadcast(data={"left": user_name})
        users = manager.get_users()
        await manager.broadcast(data={"online": users})


app.mount("/", StaticFiles(directory="../dist", html=True), name="dist")
