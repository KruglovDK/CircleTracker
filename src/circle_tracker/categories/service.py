from uuid import UUID

from circle_tracker.categories.exceptions import (
    CategoryAccessDeniedError,
    CategoryNotFoundError,
)
from circle_tracker.categories.schemas import Category


async def get_categories(conn, user_id: UUID) -> list[Category]:
    result = await conn.execute(
        "SELECT id, name, user_id FROM categories WHERE user_id = %s OR user_id IS NULL ORDER BY name",
        (user_id,),
    )
    rows = await result.fetchall()
    return [Category(id=row[0], name=row[1], user_id=row[2]) for row in rows]


async def get_category_by_id(conn, category_id: int) -> Category | None:
    result = await conn.execute(
        "SELECT id, name, user_id FROM categories WHERE id = %s",
        (category_id,),
    )
    row = await result.fetchone()

    if row is None:
        return None

    return Category(id=row[0], name=row[1], user_id=row[2])


async def create_category(conn, user_id: UUID, name: str) -> Category:
    result = await conn.execute(
        "INSERT INTO categories (user_id, name) VALUES (%s, %s) RETURNING id, name, user_id",
        (user_id, name),
    )
    row = await result.fetchone()
    return Category(id=row[0], name=row[1], user_id=row[2])


async def update_category(conn, category_id: int, user_id: UUID, name: str) -> Category:
    category = await get_category_by_id(conn, category_id)

    if category is None:
        raise CategoryNotFoundError

    if category.user_id is None or category.user_id != user_id:
        raise CategoryAccessDeniedError

    result = await conn.execute(
        "UPDATE categories SET name = %s WHERE id = %s RETURNING id, name, user_id",
        (name, category_id),
    )
    row = await result.fetchone()
    return Category(id=row[0], name=row[1], user_id=row[2])


async def delete_category(conn, category_id: int, user_id: UUID) -> None:
    category = await get_category_by_id(conn, category_id)

    if category is None:
        raise CategoryNotFoundError

    if category.user_id is None or category.user_id != user_id:
        raise CategoryAccessDeniedError

    await conn.execute(
        "DELETE FROM categories WHERE id = %s",
        (category_id,),
    )