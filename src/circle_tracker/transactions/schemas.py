from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class TransactionCreate(BaseModel):
    amount: int
    description: str | None = None
    category_id: int | None = None
    group_id: int | None = None
    is_essential: bool = False

class TransactionUpdate(BaseModel):
    amount: int
    description: str
    category_id: int | None
    group_id: int | None
    user_id: UUID
    is_essential: bool

class Transaction(BaseModel):
    id: int
    amount: int
    description: str
    user_id: UUID
    category_id: int | None
    group_id: int | None
    is_essential: bool
    created_at: datetime