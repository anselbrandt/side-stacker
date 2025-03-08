import time
from sqlmodel import create_engine, SQLModel, Session, select, delete
from app.user_models import User
from app.game_models import ActiveGame

DATABASE_URL = "sqlite:///db.sqlite"

engine = create_engine(
    DATABASE_URL,
    echo=True,
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
    return game
