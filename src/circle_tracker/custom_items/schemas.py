from uuid import UUID

from pydantic import BaseModel


class CustomItemCreate(BaseModel):
    name: str
    last_category_id: int | None = None


class CustomItemUpdate(BaseModel):
    name: str | None = None
    last_category_id: int | None = None


class CustomItem(BaseModel):
    id: int
    name: str
    user_id: UUID
    last_category_id: int | None