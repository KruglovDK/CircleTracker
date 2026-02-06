# dependencies.py

from typing import TYPE_CHECKING, Annotated

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from psycopg import AsyncConnection

from circle_tracker.auth.schemas import User
from circle_tracker.auth.service import get_user_by_id
from circle_tracker.auth.utils import decode_token
from circle_tracker.database import db

security = HTTPBearer()

DbConn = Annotated[AsyncConnection, Depends(db.get_connection)]


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    conn: DbConn,
) -> User:
    token = credentials.credentials  # токен без "Bearer "

    try:
        payload = decode_token(token)
    except jwt.ExpiredSignatureError as err:
        raise HTTPException(status_code=401, detail="Token expired") from err
    except jwt.InvalidTokenError as err:
        raise HTTPException(status_code=401, detail="Invalid token") from err

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await get_user_by_id(conn, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user

CurrentUser = Annotated[User, Depends(get_current_user)]