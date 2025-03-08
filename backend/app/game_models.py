from typing import List, Optional
from sqlmodel import SQLModel, Field
import json


class ActiveGame(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    owner: int = Field(foreign_key="user.id")
    expires: int
    board: str = Field(default="[]")  # Store as a string

    def get_board(self) -> List[List[Optional[str]]]:
        return json.loads(self.board)

    def set_board(self, new_board: List[List[Optional[str]]]):
        self.board = json.dumps(new_board)
