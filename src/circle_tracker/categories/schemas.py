from uuid import UUID

from pydantic import BaseModel, Field


class CategoryCreate(BaseModel):
    name: str

class CategoryUpdate(BaseModel):
    name: str

class Category(BaseModel):
    id: int
    name: str
    user_id: UUID | None


