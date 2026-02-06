from typing import Annotated

import jwt
from fastapi import APIRouter, Depends, HTTPException
from psycopg import AsyncConnection

from circle_tracker.auth.exceptions import InvalidPasswordError, UserAlreadyExistsError, UserNotFoundError
from circle_tracker.auth.schemas import RefreshRequest, SignIn, SignUp, Token
from circle_tracker.auth.service import authenticate_user, create_tokens, create_user
from circle_tracker.auth.utils import decode_token
from circle_tracker.database import db

router = APIRouter(prefix="/auth", tags=["auth"])

# Dependency как type alias
DbConn = Annotated[AsyncConnection, Depends(db.get_connection)]


@router.post("/register")
async def register(data: SignUp, conn: DbConn):
    try:
        user = await create_user(conn, data.username, data.password)
        return Token(**create_tokens(str(user.id)))
    except UserAlreadyExistsError as err:
        raise HTTPException(status_code=409, detail="Username already taken") from err

@router.post("/login")
async def login(data: SignIn, conn: DbConn):
    try:
        user = await authenticate_user(conn, data.username, data.password)
        return Token(**create_tokens(str(user.id)))
    except (UserNotFoundError, InvalidPasswordError) as err:
        raise HTTPException(status_code=400, detail="Invalid username or passwprd") from err

@router.post("/refresh")
async def refresh(data: RefreshRequest) -> Token:
    try:
        payload = decode_token(data.refresh_token)
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        return Token(**create_tokens(user_id))

    except jwt.ExpiredSignatureError as err:
        raise HTTPException(status_code=401, detail="Token expired") from err
    except jwt.InvalidTokenError as err:
        raise HTTPException(status_code=401, detail="Invalid token") from err