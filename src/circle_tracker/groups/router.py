from fastapi import APIRouter, HTTPException

from circle_tracker.auth.exceptions import UserNotFoundError
from circle_tracker.dependencies import CurrentUser, DbConn
from circle_tracker.groups.exceptions import (
    GroupAccessDeniedError,
    GroupNotFoundError,
    InviteAccessDeniedError,
    InviteAlreadyExistsError,
    InviteNotFoundError,
    UserAlreadyInGroupError,
)
from circle_tracker.groups.schemas import (
    Group,
    GroupCreate,
    GroupUpdate,
    Invite,
    InviteCreate,
)
from circle_tracker.groups.service import (
    accept_invite,
    create_group,
    create_invite,
    decline_invite,
    delete_group,
    get_group_by_id,
    get_group_transactions,
    get_user_groups,
    get_user_invites,
    is_group_member,
    update_group,
)
from circle_tracker.transactions.schemas import Transaction

router = APIRouter(tags=["groups"])


@router.post("/groups", status_code=201)
async def create_new_group(
    data: GroupCreate, conn: DbConn, user: CurrentUser
) -> Group:
    return await create_group(conn, user.id, data.name)


@router.get("/groups")
async def find_user_groups(conn: DbConn, user: CurrentUser) -> list[Group]:
    return await get_user_groups(conn, user.id)


@router.get("/groups/{group_id}")
async def find_group_by_id(
    group_id: int, conn: DbConn, user: CurrentUser
) -> Group:
    group = await get_group_by_id(conn, group_id)

    if group is None:
        raise HTTPException(status_code=404, detail="Group not found")

    if not await is_group_member(conn, group_id, user.id):
        raise HTTPException(status_code=403, detail="Access denied")

    return group


@router.get("/groups/{group_id}/transactions")
async def find_group_transactions(
    group_id: int, conn: DbConn, user: CurrentUser
) -> list[Transaction]:
    try:
        return await get_group_transactions(conn, group_id, user.id)
    except GroupNotFoundError as err:
        raise HTTPException(status_code=404, detail="Group not found") from err
    except GroupAccessDeniedError as err:
        raise HTTPException(status_code=403, detail="Access denied") from err


@router.put("/groups/{group_id}")
async def update_existing_group(
    group_id: int, data: GroupUpdate, conn: DbConn, user: CurrentUser
) -> Group:
    try:
        return await update_group(conn, group_id, user.id, data.name)
    except GroupNotFoundError as err:
        raise HTTPException(status_code=404, detail="Group not found") from err
    except GroupAccessDeniedError as err:
        raise HTTPException(status_code=403, detail="Access denied") from err


@router.delete("/groups/{group_id}", status_code=204)
async def delete_existing_group(
    group_id: int, conn: DbConn, user: CurrentUser
) -> None:
    try:
        await delete_group(conn, group_id, user.id)
    except GroupNotFoundError as err:
        raise HTTPException(status_code=404, detail="Group not found") from err
    except GroupAccessDeniedError as err:
        raise HTTPException(status_code=403, detail="Access denied") from err


@router.post("/groups/{group_id}/invites", status_code=201)
async def create_group_invite(
    group_id: int, data: InviteCreate, conn: DbConn, user: CurrentUser
) -> Invite:
    try:
        return await create_invite(conn, group_id, user.id, data.username)
    except GroupNotFoundError as err:
        raise HTTPException(status_code=404, detail="Group not found") from err
    except GroupAccessDeniedError as err:
        raise HTTPException(status_code=403, detail="Access denied") from err
    except UserNotFoundError as err:
        raise HTTPException(status_code=404, detail="User not found") from err
    except UserAlreadyInGroupError as err:
        raise HTTPException(status_code=409, detail="User already in group") from err
    except InviteAlreadyExistsError as err:
        raise HTTPException(status_code=409, detail="Invite already exists") from err


@router.get("/invites")
async def find_user_invites(conn: DbConn, user: CurrentUser) -> list[Invite]:
    return await get_user_invites(conn, user.id)


@router.post("/invites/{invite_id}/accept")
async def accept_group_invite(
    invite_id: int, conn: DbConn, user: CurrentUser
) -> Invite:
    try:
        return await accept_invite(conn, invite_id, user.id)
    except InviteNotFoundError as err:
        raise HTTPException(status_code=404, detail="Invite not found") from err
    except InviteAccessDeniedError as err:
        raise HTTPException(status_code=403, detail="Access denied") from err


@router.post("/invites/{invite_id}/decline")
async def decline_group_invite(
    invite_id: int, conn: DbConn, user: CurrentUser
) -> Invite:
    try:
        return await decline_invite(conn, invite_id, user.id)
    except InviteNotFoundError as err:
        raise HTTPException(status_code=404, detail="Invite not found") from err
    except InviteAccessDeniedError as err:
        raise HTTPException(status_code=403, detail="Access denied") from err