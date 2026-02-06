from typing import TYPE_CHECKING

from fastapi import APIRouter, HTTPException

from circle_tracker.auth.service import get_user_by_username
from circle_tracker.dependencies import CurrentUser, DbConn


router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me")
async def get_me(user: CurrentUser):
    return user

@router.get("/{username}")
async def get_user(username: str, conn: DbConn):
    user = await get_user_by_username(conn, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user