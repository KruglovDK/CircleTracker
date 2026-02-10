from uuid import UUID

from circle_tracker.custom_items.schemas import CustomItem, CustomItemCreate, CustomItemUpdate


async def get_custom_items(conn, user_id: UUID) -> list[CustomItem]:
    result = await conn.execute(
        "SELECT id, name, user_id, last_category_id FROM custom_items WHERE user_id = %s ORDER BY name",
        (user_id,),
    )
    rows = await result.fetchall()

    return [
        CustomItem(id=row[0], name=row[1], user_id=row[2], last_category_id=row[3])
        for row in rows
    ]


async def get_custom_item_by_id(conn, item_id: int) -> CustomItem | None:
    result = await conn.execute(
        "SELECT id, name, user_id, last_category_id FROM custom_items WHERE id = %s",
        (item_id,),
    )
    row = await result.fetchone()

    if row is None:
        return None

    return CustomItem(id=row[0], name=row[1], user_id=row[2], last_category_id=row[3])


async def suggest_custom_items(conn, user_id: UUID, query: str) -> list[CustomItem]:
    result = await conn.execute(
        """
        SELECT id, name, user_id, last_category_id
        FROM custom_items
        WHERE user_id = %s AND name ILIKE %s
        ORDER BY name
        LIMIT 10
        """,
        (user_id, f"%{query}%"),
    )
    rows = await result.fetchall()

    return [
        CustomItem(id=row[0], name=row[1], user_id=row[2], last_category_id=row[3])
        for row in rows
    ]


async def create_custom_item(conn, user_id: UUID, data: CustomItemCreate) -> CustomItem:
    result = await conn.execute(
        """
        INSERT INTO custom_items (name, user_id, last_category_id)
        VALUES (%s, %s, %s)
        RETURNING id, name, user_id, last_category_id
        """,
        (data.name, user_id, data.last_category_id),
    )
    row = await result.fetchone()

    return CustomItem(id=row[0], name=row[1], user_id=row[2], last_category_id=row[3])


async def update_custom_item(
    conn, item_id: int, user_id: UUID, data: CustomItemUpdate
) -> CustomItem | None:
    item = await get_custom_item_by_id(conn, item_id)

    if item is None or item.user_id != user_id:
        return None

    updates = []
    params = []

    if data.name is not None:
        updates.append("name = %s")
        params.append(data.name)

    if data.last_category_id is not None:
        updates.append("last_category_id = %s")
        params.append(data.last_category_id)

    if not updates:
        return item

    params.append(item_id)
    query = f"UPDATE custom_items SET {', '.join(updates)} WHERE id = %s RETURNING id, name, user_id, last_category_id"

    result = await conn.execute(query, tuple(params))
    row = await result.fetchone()

    return CustomItem(id=row[0], name=row[1], user_id=row[2], last_category_id=row[3])


async def delete_custom_item(conn, item_id: int, user_id: UUID) -> bool:
    item = await get_custom_item_by_id(conn, item_id)

    if item is None or item.user_id != user_id:
        return False

    await conn.execute("DELETE FROM custom_items WHERE id = %s", (item_id,))
    return True