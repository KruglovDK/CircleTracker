from fastapi import APIRouter, HTTPException

from circle_tracker.categories.exceptions import (
    CategoryAccessDeniedError,
    CategoryNotFoundError,
)
from circle_tracker.categories.schemas import Category, CategoryCreate, CategoryUpdate
from circle_tracker.categories.service import (
    create_category,
    delete_category,
    get_categories,
    update_category,
)
from circle_tracker.dependencies import CurrentUser, DbConn

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("")
async def find_all_categories(conn: DbConn, user: CurrentUser) -> list[Category]:
    return await get_categories(conn, user.id)


@router.post("")
async def create_new_category(
    data: CategoryCreate, conn: DbConn, user: CurrentUser
) -> Category:
    return await create_category(conn, user.id, data.name)


@router.put("/{category_id}")
async def update_existing_category(
    category_id: int, data: CategoryUpdate, conn: DbConn, user: CurrentUser
) -> Category:
    try:
        return await update_category(conn, category_id, user.id, data.name)
    except CategoryNotFoundError as err:
        raise HTTPException(status_code=404, detail="Category not found") from err
    except CategoryAccessDeniedError as err:
        raise HTTPException(status_code=403, detail="Access denied") from err


@router.delete("/{category_id}", status_code=204)
async def delete_existing_category(
    category_id: int, conn: DbConn, user: CurrentUser
) -> None:
    try:
        await delete_category(conn, category_id, user.id)
    except CategoryNotFoundError as err:
        raise HTTPException(status_code=404, detail="Category not found") from err
    except CategoryAccessDeniedError as err:
        raise HTTPException(status_code=403, detail="Access denied") from err