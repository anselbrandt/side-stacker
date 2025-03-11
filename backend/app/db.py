import time
from typing import List, Tuple, Optional
from sqlmodel import create_engine, SQLModel, Session, select, delete
from app.user_models import User
from app.game_models import ActiveGame
from app.game import new_board

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
    session.exec(delete(User).where(User.expires < current_time))
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


def add_game(session: Session, game: ActiveGame):
    session.add(game)
    session.commit()
    session.refresh(game)
    game.board = game.get_board()
    game.players = game.get_players()
    return game


def add_shared_game(session: Session, game: ActiveGame):
    session.add(game)
    session.commit()
    session.refresh(game)
    game.board = game.get_board()
    game.players = game.get_players()
    return game


def cleanup_games(session: Session):
    current_time = int(time.time())
    session.exec(delete(ActiveGame).where(ActiveGame.expires < current_time))
    session.commit()


def delete_game(session: Session, owner_id: int):
    session.exec(delete(ActiveGame).where(ActiveGame.owners.contains([owner_id])))
    session.commit()


def find_game(session: Session, game_id: int) -> Optional[ActiveGame]:
    return session.get(ActiveGame, game_id)


def find_games_by_owner(session: Session, owner_id: int) -> Optional[ActiveGame]:
    statement = (
        select(ActiveGame).where(ActiveGame.owners.contains([owner_id])).limit(1)
    )
    game = session.exec(statement).first()
    if game:
        game.board = game.get_board()
        return game
    else:
        return None


def update_game(
    session: Session, game: ActiveGame, position: Tuple[int, int], symbol: str
) -> ActiveGame:
    row, col = position
    board = game.get_board()
    if symbol == "X":
        next_turn = "O"
    elif symbol == "O":
        next_turn = "X"

    if board[row][col] is None:
        board[row][col] = symbol
        game.set_board(board)
        game.set_turn(next_turn)
        session.commit()
        session.refresh(game)
    else:
        raise ValueError("Position already occupied")

    game.board = game.get_board()
    game.players = game.get_players()
    return game


def reset_board(session: Session, game: ActiveGame) -> ActiveGame:
    board = new_board()
    game.set_board(board)
    session.commit()
    session.refresh(game)
    game.board = game.get_board()
    return game
