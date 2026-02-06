from typing import TYPE_CHECKING

from pydantic import BaseModel

if TYPE_CHECKING:
    import datetime
    from uuid import UUID

class User(BaseModel):
    id: UUID
    username: str
    created_at: datetime.datetime