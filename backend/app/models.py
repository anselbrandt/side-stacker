from typing import Dict, List, TypedDict
import json

from pydantic import BaseModel
from sqlalchemy import JSON
from sqlmodel import SQLModel, Field, Column, Relationship


class Game(SQLModel, table=True):
    expires: int
    id: int = Field(default=None, primary_key=True)
    owners: List["User"] = Relationship(back_populates="game")
    board: str = Field(default="[]")
    players: Dict = Field(default_factory=dict, sa_column=Column(JSON))
    turn: str
    winner: str | None

    def get_board(self) -> List[List[str | None]]:
        return json.loads(self.board)

    def set_board(self, new_board: List[List[str | None]]):
        self.board = json.dumps(new_board)


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    expires: int
    game_id: int | None = Field(default=None, foreign_key="game.id")
    game: "Game" = Relationship(back_populates="owners")


class UserDict(TypedDict):
    id: int
    name: str
    expires: int
    game_id: int | None
    available: bool | None


class Move(BaseModel):
    i: int
    j: int
    id: int
    player: str
    winner: str | None


class GameState(BaseModel):
    board: list[list[str | None]]
    player_symbol: str
