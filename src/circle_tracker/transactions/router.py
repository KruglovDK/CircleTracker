from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query

from circle_tracker.dependencies import CurrentUser, DbConn
from circle_tracker.transactions.exceptions import (
    TransactionAccessDeniedError,
    TransactionNotFoundError,
)
from circle_tracker.transactions.schemas import (
    Transaction,
    TransactionCreate,
    TransactionUpdate,
)
from circle_tracker.transactions.service import (
    create_transaction,
    delete_transaction,
    get_transaction_by_id,
    get_transactions,
    update_transaction,
)

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("")
async def find_all_transactions(
    conn: DbConn,
    user: CurrentUser,
    date_from: Annotated[datetime | None, Query(description="Начало периода")] = None,
    date_to: Annotated[datetime | None, Query(description="Конец периода")] = None,
    category_id: Annotated[int | None, Query(description="ID категории")] = None,
    group_id: Annotated[int | None, Query(description="ID группы")] = None,
) -> list[Transaction]:
    return await get_transactions(
        conn,
        user.id,
        date_from=date_from,
        date_to=date_to,
        category_id=category_id,
        group_id=group_id,
    )


@router.get("/{transaction_id}")
async def find_transaction_by_id(
    transaction_id: int, conn: DbConn, user: CurrentUser
) -> Transaction:
    transaction = await get_transaction_by_id(conn, transaction_id)

    if transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if transaction.user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return transaction


@router.post("", status_code=201)
async def create_new_transaction(
    data: TransactionCreate, conn: DbConn, user: CurrentUser
) -> Transaction:
    return await create_transaction(conn, user.id, data)


@router.put("/{transaction_id}")
async def update_existing_transaction(
    transaction_id: int, data: TransactionUpdate, conn: DbConn, user: CurrentUser
) -> Transaction:
    try:
        return await update_transaction(conn, transaction_id, user.id, data)
    except TransactionNotFoundError as err:
        raise HTTPException(status_code=404, detail="Transaction not found") from err
    except TransactionAccessDeniedError as err:
        raise HTTPException(status_code=403, detail="Access denied") from err


@router.delete("/{transaction_id}", status_code=204)
async def delete_existing_transaction(
    transaction_id: int, conn: DbConn, user: CurrentUser
) -> None:
    try:
        await delete_transaction(conn, transaction_id, user.id)
    except TransactionNotFoundError as err:
        raise HTTPException(status_code=404, detail="Transaction not found") from err
    except TransactionAccessDeniedError as err:
        raise HTTPException(status_code=403, detail="Access denied") from err