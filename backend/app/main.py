from contextlib import asynccontextmanager
from typing import Annotated

from game_engine import alphazero_engine, mcts_engine

from fastapi import (
    Depends,
    FastAPI,
    Header,
    HTTPException,
    Query,
    Request,
    Response,
    status,
    WebSocket,
    WebSocketDisconnect,
    WebSocketException,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlmodel import Session

from app.auth import CurrentUser, create_user, create_jwt, decode_token
from app.constants import ROOT_PATH, COOKIE_NAME, COOKIE_EXPIRY
from app.db import (
    add_game,
    add_multiplayer,
    add_user,
    cleanup_games,
    cleanup_users,
    get_session,
    init_db,
    update_game,
)
from app.game import create_game, create_multiplayer_game
from app.models import User, UserDict, Game, Move, GameState, GameResponse

origins = [
    "http://localhost:3000",
    "https://air.anselbrandt.net",
    "https://anselbrandt.com",
    "https://www.anselbrandt.com",
    "https://app.anselbrandt.ca",
    "https://www.app.anselbrandt.ca",
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


@app.get("/login")
async def login(
    request: Request, user: CurrentUser, session: Session = Depends(get_session)
):
    cleanup_users(session)
    if user:
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        return {**user.model_dump(), "token": token}
    else:
        user = create_user()
        new_user = add_user(session, user)
        jwt_token = create_jwt(new_user)
        return JSONResponse(content={**user.model_dump(), "token": jwt_token})


@app.get("/board", response_model=GameResponse)
async def get_board(user: CurrentUser, session: Session = Depends(get_session)):
    if user is None:
        raise HTTPException(status_code=404, detail="Item not found")
    cleanup_games(session)
    db_user = session.get(User, user.id)
    if db_user:
        prev_game = db_user.game
        if prev_game:
            prev_game.board
            return prev_game
        new_game = create_game(db_user)
        game = add_game(session, new_game, db_user)
        return game


@app.post("/move", response_model=GameResponse)
async def create_move(
    move: Move, user: CurrentUser, session: Session = Depends(get_session)
):
    if user is None:
        raise HTTPException(status_code=404, detail="Item not found")

    game = session.get(Game, move.id)
    if game:
        updated_game = update_game(session, game, move)
        return updated_game


@app.post("/mcts")
async def mcts(
    gameState: GameState,
    user: CurrentUser,
    session: Session = Depends(get_session),
):
    if user is None:
        raise HTTPException(status_code=404, detail="Item not found")
    action = mcts_engine(gameState.board, gameState.player_symbol)
    return action


@app.post("/alphazero")
async def alphazero(
    gameState: GameState,
    user: CurrentUser,
    session: Session = Depends(get_session),
):
    if user is None:
        raise HTTPException(status_code=404, detail="Item not found")
    action = alphazero_engine(gameState.board, gameState.player_symbol)
    return action


class Reset(BaseModel):
    id: int


@app.post("/reset", response_model=GameResponse)
async def reset(
    reset: Reset, user: CurrentUser, session: Session = Depends(get_session)
):
    if user is None:
        raise HTTPException(status_code=404, detail="Item not found")
    else:
        db_user = session.get(User, user.id)
        if db_user:
            prev_game = db_user.game
            if prev_game:
                session.delete(prev_game)
                session.commit()
                session.refresh(db_user)
            new_game = create_game(db_user)
            game = add_game(session, new_game, db_user)
            return game


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
        self.users: dict[WebSocket, UserDict] = {}
        self.ids: dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user: UserDict):
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

    async def send_by_id_text(self, text, id: int):
        websocket = self.ids.get(id)
        if websocket:
            await websocket.send_text(data=text)
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


async def get_user_from_token(websocket: WebSocket, token: str = Query(None)):
    if not token:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)
    user = decode_token(token)
    return user


@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    incoming_user: Annotated[UserDict, Depends(get_user_from_token)],
    session: Session = Depends(get_session),
):
    await manager.connect(websocket, incoming_user)
    onlinUsers = manager.get_users()
    await manager.broadcast(data={"online": onlinUsers})
    sender_id = incoming_user["id"]
    sender_name = incoming_user["name"]
    try:
        while True:
            data = await websocket.receive_json()
            if "invite" in data:
                await manager.send_by_id(
                    data={"invite": {"id": sender_id, "name": sender_name}},
                    id=data["invite"],
                )
            if "quit" in data:
                await manager.send_by_id(
                    data={
                        "quit_notification": {
                            "id": sender_id,
                            "name": sender_name,
                        }
                    },
                    id=data["quit"],
                )
            if "available" in data:
                status = data["available"]
                manager.update_availability(sender_id, status)
                onlinUsers = manager.get_users()
                await manager.broadcast(data={"online": onlinUsers})
            if "accept" in data:
                user_to_notify = manager.get_user(data["accept"])
                db_sender = session.get(User, sender_id)
                db_to_notify = session.get(User, user_to_notify["id"])
                if db_sender and db_to_notify:
                    users = [db_sender, db_to_notify]
                    for user in users:
                        prev_game = user.game
                        if prev_game:
                            session.delete(prev_game)
                            session.commit()
                            session.refresh(user)
                    notification_payload = {
                        "accept_notification": {
                            "id": sender_id,
                            "name": sender_name,
                        }
                    }
                    await manager.send_by_id(
                        data=notification_payload, id=user_to_notify["id"]
                    )

                    shared_game = create_multiplayer_game(users)
                    game = add_multiplayer(session, shared_game, users)
                    payload = {
                        "multiplayer_game": {
                            "id": game.id,
                            "players": game.players,
                            "board": game.board,
                            "turn": game.turn,
                        }
                    }
                    await manager.send_by_id(data=payload, id=sender_id)
                    await manager.send_by_id(data=payload, id=user_to_notify["id"])
            if "move" in data:
                player_id = data["move"]["player_id"]
                game_id = data["move"]["game_id"]
                turn = data["move"]["turn"]
                board = data["move"]["updated_board"]
                winner = data["move"]["winner"]
                payload = {
                    "id": game_id,
                    "board": board,
                    "turn": turn,
                    "winner": winner,
                }
                await manager.send_by_id(data={"updated_game": payload}, id=player_id)

    except WebSocketDisconnect:
        user = manager.disconnect(websocket)
        if user:
            user_name = user["name"]
            await manager.broadcast(data={"left": user_name})
        users = manager.get_users()
        await manager.broadcast(data={"online": users})
