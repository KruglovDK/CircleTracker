from typing import TYPE_CHECKING

from pydantic import BaseModel, Field

if TYPE_CHECKING:
    import datetime
    from uuid import UUID


class SignUp(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8)


class SignIn(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

class User(BaseModel):
    id: UUID
    username: str
    created_at: datetime.datetime
