from typing import Dict, List, Optional, TypedDict
import json

from sqlalchemy import JSON
from sqlmodel import SQLModel, Field, Column


class Game(SQLModel, table=True):
    expires: int
    id: int | None = Field(default=None, primary_key=True)
    owners: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    board: str = Field(default="[]")
    players: Dict = Field(default_factory=dict, sa_column=Column(JSON))
    turn: str
    winner: str | None

    def get_board(self) -> List[List[Optional[str]]]:
        return json.loads(self.board)

    def set_board(self, new_board: List[List[Optional[str]]]):
        self.board = json.dumps(new_board)

    def get_owners(self) -> List[int]:
        return json.loads(self.owners)

    def set_owners(self, owners: List[int]):
        self.owners = json.dumps(owners)


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    expires: int


class UserDict(TypedDict):
    id: int
    name: str
    expires: int
    available: bool | None
