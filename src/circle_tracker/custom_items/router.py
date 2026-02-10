from typing import Annotated

from fastapi import APIRouter, HTTPException, Query

from circle_tracker.custom_items.schemas import CustomItem, CustomItemCreate, CustomItemUpdate
from circle_tracker.custom_items.service import (
    create_custom_item,
    delete_custom_item,
    get_custom_items,
    suggest_custom_items,
    update_custom_item,
)
from circle_tracker.dependencies import CurrentUser, DbConn

router = APIRouter(prefix="/custom-items", tags=["custom-items"])


@router.get("")
async def find_all_custom_items(conn: DbConn, user: CurrentUser) -> list[CustomItem]:
    return await get_custom_items(conn, user.id)


@router.get("/suggest")
async def suggest(
    conn: DbConn,
    user: CurrentUser,
    q: Annotated[str, Query(description="Поисковый запрос", min_length=1)],
) -> list[CustomItem]:
    return await suggest_custom_items(conn, user.id, q)


@router.post("", status_code=201)
async def create_new_custom_item(
    data: CustomItemCreate, conn: DbConn, user: CurrentUser
) -> CustomItem:
    return await create_custom_item(conn, user.id, data)


@router.put("/{item_id}")
async def update_existing_custom_item(
    item_id: int, data: CustomItemUpdate, conn: DbConn, user: CurrentUser
) -> CustomItem:
    item = await update_custom_item(conn, item_id, user.id, data)

    if item is None:
        raise HTTPException(status_code=404, detail="Custom item not found")

    return item


@router.delete("/{item_id}", status_code=204)
async def delete_existing_custom_item(
    item_id: int, conn: DbConn, user: CurrentUser
) -> None:
    deleted = await delete_custom_item(conn, item_id, user.id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Custom item not found")