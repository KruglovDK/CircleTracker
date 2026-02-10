from uuid import UUID

from circle_tracker.auth.service import get_user_by_username
from circle_tracker.groups.exceptions import (
    GroupAccessDeniedError,
    GroupNotFoundError,
    InviteAccessDeniedError,
    InviteAlreadyExistsError,
    InviteNotFoundError,
    UserAlreadyInGroupError,
)
from circle_tracker.groups.schemas import Group, Invite
from circle_tracker.transactions.schemas import Transaction


async def get_group_by_id(conn, group_id: int) -> Group | None:
    result = await conn.execute(
        "SELECT id, name, owner_id, created_at FROM user_groups WHERE id = %s",
        (group_id,),
    )
    row = await result.fetchone()

    if row is None:
        return None

    return Group(id=row[0], name=row[1], owner_id=row[2], created_at=row[3])


async def is_group_member(conn, group_id: int, user_id: UUID) -> bool:
    result = await conn.execute(
        "SELECT 1 FROM user_group_members WHERE group_id = %s AND user_id = %s",
        (group_id, user_id),
    )
    row = await result.fetchone()
    return row is not None


async def create_group(conn, owner_id: UUID, name: str) -> Group:
    result = await conn.execute(
        "INSERT INTO user_groups (name, owner_id) VALUES (%s, %s) RETURNING id, name, owner_id, created_at",
        (name, owner_id),
    )
    row = await result.fetchone()
    group = Group(id=row[0], name=row[1], owner_id=row[2], created_at=row[3])

    # Добавляем владельца в участники группы
    await conn.execute(
        "INSERT INTO user_group_members (user_id, group_id) VALUES (%s, %s)",
        (owner_id, group.id),
    )

    return group


async def get_user_groups(conn, user_id: UUID) -> list[Group]:
    result = await conn.execute(
        """
        SELECT g.id, g.name, g.owner_id, g.created_at
        FROM user_groups g
        JOIN user_group_members m ON g.id = m.group_id
        WHERE m.user_id = %s
        ORDER BY g.created_at DESC
        """,
        (user_id,),
    )
    rows = await result.fetchall()

    return [
        Group(id=row[0], name=row[1], owner_id=row[2], created_at=row[3])
        for row in rows
    ]


async def update_group(conn, group_id: int, user_id: UUID, name: str) -> Group:
    group = await get_group_by_id(conn, group_id)

    if group is None:
        raise GroupNotFoundError

    if group.owner_id != user_id:
        raise GroupAccessDeniedError

    result = await conn.execute(
        "UPDATE user_groups SET name = %s WHERE id = %s RETURNING id, name, owner_id, created_at",
        (name, group_id),
    )
    row = await result.fetchone()

    return Group(id=row[0], name=row[1], owner_id=row[2], created_at=row[3])


async def delete_group(conn, group_id: int, user_id: UUID) -> None:
    group = await get_group_by_id(conn, group_id)

    if group is None:
        raise GroupNotFoundError

    if group.owner_id != user_id:
        raise GroupAccessDeniedError

    await conn.execute("DELETE FROM user_groups WHERE id = %s", (group_id,))


async def get_group_transactions(
    conn, group_id: int, user_id: UUID
) -> list[Transaction]:
    group = await get_group_by_id(conn, group_id)

    if group is None:
        raise GroupNotFoundError

    if not await is_group_member(conn, group_id, user_id):
        raise GroupAccessDeniedError

    result = await conn.execute(
        """
        SELECT id, amount, description, user_id, category_id, group_id, is_essential, created_at
        FROM transactions
        WHERE group_id = %s
        ORDER BY created_at DESC
        """,
        (group_id,),
    )
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


async def get_invite_by_id(conn, invite_id: int) -> Invite | None:
    result = await conn.execute(
        "SELECT id, group_id, inviter_id, invitee_id, status, created_at FROM group_invites WHERE id = %s",
        (invite_id,),
    )
    row = await result.fetchone()

    if row is None:
        return None

    return Invite(
        id=row[0],
        group_id=row[1],
        inviter_id=row[2],
        invitee_id=row[3],
        status=row[4],
        created_at=row[5],
    )


async def create_invite(
    conn, group_id: int, inviter_id: UUID, invitee_username: str
) -> Invite:
    group = await get_group_by_id(conn, group_id)

    if group is None:
        raise GroupNotFoundError

    if not await is_group_member(conn, group_id, inviter_id):
        raise GroupAccessDeniedError

    invitee = await get_user_by_username(conn, invitee_username)

    if invitee is None:
        from circle_tracker.auth.exceptions import UserNotFoundError
        raise UserNotFoundError

    if await is_group_member(conn, group_id, invitee.id):
        raise UserAlreadyInGroupError

    # Проверяем, нет ли уже pending приглашения
    result = await conn.execute(
        "SELECT 1 FROM group_invites WHERE group_id = %s AND invitee_id = %s AND status = 'pending'",
        (group_id, invitee.id),
    )
    if await result.fetchone():
        raise InviteAlreadyExistsError

    result = await conn.execute(
        """
        INSERT INTO group_invites (group_id, inviter_id, invitee_id)
        VALUES (%s, %s, %s)
        RETURNING id, group_id, inviter_id, invitee_id, status, created_at
        """,
        (group_id, inviter_id, invitee.id),
    )
    row = await result.fetchone()

    return Invite(
        id=row[0],
        group_id=row[1],
        inviter_id=row[2],
        invitee_id=row[3],
        status=row[4],
        created_at=row[5],
    )


async def get_user_invites(conn, user_id: UUID) -> list[Invite]:
    result = await conn.execute(
        """
        SELECT id, group_id, inviter_id, invitee_id, status, created_at
        FROM group_invites
        WHERE invitee_id = %s AND status = 'pending'
        ORDER BY created_at DESC
        """,
        (user_id,),
    )
    rows = await result.fetchall()

    return [
        Invite(
            id=row[0],
            group_id=row[1],
            inviter_id=row[2],
            invitee_id=row[3],
            status=row[4],
            created_at=row[5],
        )
        for row in rows
    ]


async def accept_invite(conn, invite_id: int, user_id: UUID) -> Invite:
    invite = await get_invite_by_id(conn, invite_id)

    if invite is None:
        raise InviteNotFoundError

    if invite.invitee_id != user_id:
        raise InviteAccessDeniedError

    # Добавляем в группу
    await conn.execute(
        "INSERT INTO user_group_members (user_id, group_id) VALUES (%s, %s)",
        (user_id, invite.group_id),
    )

    # Обновляем статус приглашения
    result = await conn.execute(
        """
        UPDATE group_invites SET status = 'accepted'
        WHERE id = %s
        RETURNING id, group_id, inviter_id, invitee_id, status, created_at
        """,
        (invite_id,),
    )
    row = await result.fetchone()

    return Invite(
        id=row[0],
        group_id=row[1],
        inviter_id=row[2],
        invitee_id=row[3],
        status=row[4],
        created_at=row[5],
    )


async def decline_invite(conn, invite_id: int, user_id: UUID) -> Invite:
    invite = await get_invite_by_id(conn, invite_id)

    if invite is None:
        raise InviteNotFoundError

    if invite.invitee_id != user_id:
        raise InviteAccessDeniedError

    result = await conn.execute(
        """
        UPDATE group_invites SET status = 'declined'
        WHERE id = %s
        RETURNING id, group_id, inviter_id, invitee_id, status, created_at
        """,
        (invite_id,),
    )
    row = await result.fetchone()

    return Invite(
        id=row[0],
        group_id=row[1],
        inviter_id=row[2],
        invitee_id=row[3],
        status=row[4],
        created_at=row[5],
    )