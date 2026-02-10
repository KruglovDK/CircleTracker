from datetime import datetime
from uuid import UUID

from circle_tracker.transactions.exceptions import (
    TransactionAccessDeniedError,
    TransactionNotFoundError,
)
from circle_tracker.transactions.schemas import (
    Transaction,
    TransactionCreate,
    TransactionUpdate,
)


async def get_transactions(
    conn,
    user_id: UUID,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    category_id: int | None = None,
    group_id: int | None = None,
) -> list[Transaction]:
    query = "SELECT id, amount, description, user_id, category_id, group_id, is_essential, created_at FROM transactions WHERE user_id = %s"
    params: list = [user_id]

    if date_from is not None:
        query += " AND created_at >= %s"
        params.append(date_from)
#TODO: Исправить баг, если date_from == date_to и в эту дату есть транзакция -> в ответе транзакций нет  # noqa: RUF003
    if date_to is not None:
        query += " AND created_at <= %s"
        params.append(date_to)

    if category_id is not None:
        query += " AND category_id = %s"
        params.append(category_id)

    if group_id is not None:
        query += " AND group_id = %s"
        params.append(group_id)

    query += " ORDER BY created_at DESC"

    result = await conn.execute(query, tuple(params))
    rows = await result.fetchall()

    return [
        Transaction(
            id=row[0],
            amount=row[1],
            description=row[2],
            user_id=row[3],
            category_id=row[4],
            group_id=row[5],
            is_essential=row[6],
            created_at=row[7],
        )
        for row in rows
    ]


async def get_transaction_by_id(conn, transaction_id: int) -> Transaction | None:
    result = await conn.execute(
        "SELECT id, amount, description, user_id, category_id, group_id, is_essential, created_at FROM transactions WHERE id = %s",
        (transaction_id,),
    )
    row = await result.fetchone()

    if row is None:
        return None

    return Transaction(
        id=row[0],
        amount=row[1],
        description=row[2],
        user_id=row[3],
        category_id=row[4],
        group_id=row[5],
        is_essential=row[6],
        created_at=row[7],
    )


async def create_transaction(
    conn,
    user_id: UUID,
    data: TransactionCreate,
) -> Transaction:
    result = await conn.execute(
        """
        INSERT INTO transactions (amount, description, category_id, group_id, user_id, is_essential)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id, amount, description, user_id, category_id, group_id, is_essential, created_at
        """,
        (data.amount, data.description, data.category_id, data.group_id, user_id, data.is_essential),
    )
    row = await result.fetchone()

    return Transaction(
        id=row[0],
        amount=row[1],
        description=row[2],
        user_id=row[3],
        category_id=row[4],
        group_id=row[5],
        is_essential=row[6],
        created_at=row[7],
    )


async def update_transaction(
    conn,
    transaction_id: int,
    user_id: UUID,
    data: TransactionUpdate,
) -> Transaction:
    transaction = await get_transaction_by_id(conn, transaction_id)

    if transaction is None:
        raise TransactionNotFoundError

    if transaction.user_id != user_id:
        raise TransactionAccessDeniedError

    updates = []
    params = []

    if data.amount is not None:
        updates.append("amount = %s")
        params.append(data.amount)

    if data.description is not None:
        updates.append("description = %s")
        params.append(data.description)

    if data.category_id is not None:
        updates.append("category_id = %s")
        params.append(data.category_id)

    if data.group_id is not None:
        updates.append("group_id = %s")
        params.append(data.group_id)

    if data.is_essential is not None:
        updates.append("is_essential = %s")
        params.append(data.is_essential)

    if not updates:
        return transaction

    params.append(transaction_id)
    query = f"UPDATE transactions SET {', '.join(updates)} WHERE id = %s RETURNING id, amount, description, user_id, category_id, group_id, is_essential, created_at"

    result = await conn.execute(query, tuple(params))
    row = await result.fetchone()

    return Transaction(
        id=row[0],
        amount=row[1],
        description=row[2],
        user_id=row[3],
        category_id=row[4],
        group_id=row[5],
        is_essential=row[6],
        created_at=row[7],
    )


async def delete_transaction(conn, transaction_id: int, user_id: UUID) -> None:
    transaction = await get_transaction_by_id(conn, transaction_id)

    if transaction is None:
        raise TransactionNotFoundError

    if transaction.user_id != user_id:
        raise TransactionAccessDeniedError

    await conn.execute(
        "DELETE FROM transactions WHERE id = %s",
        (transaction_id,),
    )