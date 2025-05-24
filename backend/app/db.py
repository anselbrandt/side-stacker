import time
from typing import List

from sqlmodel import create_engine, SQLModel, Session, select

from app.models import User, Game

DATABASE_URL = "sqlite:///db.sqlite"

engine = create_engine(
    DATABASE_URL,
    echo=False,
)


def init_db():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


def cleanup_users(session: Session):
    current_time = int(time.time())
    statement = select(User).where(User.expires < current_time)
    users = session.exec(statement).all()
    for user in users:
        session.delete(user)
    session.commit()


def add_user(session: Session, user: User):
    statement = select(User).where((User.name == user.name) & (User.id == user.id))
    existing_user = session.exec(statement).first()
    if existing_user:
        return existing_user
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def add_game(session: Session, game: Game, user: User) -> Game:
    session.add(game)
    session.commit()
    session.refresh(game)
    game.owners.append(user)
    session.add(game)
    session.commit()
    session.refresh(game)
    game.board
    return game


def add_multiplayer(session: Session, game: Game, users: List[User]) -> Game:
    user_1, user_2 = users
    session.add(game)
    session.commit()
    session.refresh(game)
    game.owners.append(user_1)
    game.owners.append(user_2)
    session.add(game)
    session.commit()
    session.refresh(user_1)
    session.refresh(user_2)
    session.refresh(game)
    game.board
    return game


def cleanup_games(session: Session):
    current_time = int(time.time())
    statement = select(Game).where(Game.expires < current_time)
    games = session.exec(statement).all()
    for game in games:
        session.delete(game)
    session.commit()


def update_game(session: Session, game: Game, move) -> Game:
    position = (move.i, move.j)
    symbol = move.player
    winner = move.winner
    row, col = position
    board = game.board
    next_turn = "O"
    if symbol == "O":
        next_turn = "X"
    if board[row][col] is None:
        board[row][col] = symbol
        game.board = board
        game.turn = next_turn
        game.winner = winner
        session.commit()
        session.refresh(game)
        game.board
    return game
