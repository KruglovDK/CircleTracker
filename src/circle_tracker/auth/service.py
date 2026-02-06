from circle_tracker.auth.exceptions import (
    InvalidPasswordError,
    UserAlreadyExistsError,
    UserNotFoundError,
)
from circle_tracker.auth.schemas import User
from circle_tracker.auth.utils import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)


async def get_user_by_username(conn, username: str) -> User | None:
    result = await conn.execute(
        "SELECT id, username, password_hash, created_at FROM users WHERE username = %s",
        (username,),
    )
    row = await result.fetchone()

    if row is None:
        return None

    return User(id=row[0], username=row[1], created_at=row[3])


async def get_user_by_id(conn, user_id: str) -> User | None:
    result = await conn.execute(
        "SELECT id, username, password_hash, created_at FROM users WHERE id = %s",
        (user_id,),
    )
    row = await result.fetchone()

    if row is None:
        return None

    return User(id=row[0], username=row[1], created_at=row[3])

async def authenticate_user(conn, username: str, password: str) -> User:
    result = await conn.execute(
        "SELECT id, username, password_hash, created_at FROM users WHERE username = %s",
        (username,),
    )
    row = await result.fetchone()

    if row is None:
        raise UserNotFoundError

    if not verify_password(password, row[2]):
        raise InvalidPasswordError

    return User(id=row[0], username=row[1], created_at=row[3])


async def create_user(conn, username: str, password: str) -> User:
    existing = await get_user_by_username(conn, username)
    if existing:
        raise UserAlreadyExistsError

    hashed = hash_password(password)

    result = await conn.execute(
        "INSERT INTO users (username, password_hash) VALUES (%s, %s) RETURNING id, username, created_at",
        (username, hashed),
    )
    row = await result.fetchone()

    return User(id=row[0], username=row[1], created_at=row[2])

def create_tokens(user_id: str) -> dict:
    data = {"sub": user_id}
    return {
        "access_token": create_access_token(data),
        "refresh_token": create_refresh_token(data),
        "token_type": "bearer",
    }