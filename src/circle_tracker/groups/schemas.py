import datetime
from uuid import UUID

from pydantic import BaseModel


class GroupCreate(BaseModel):
    name: str


class GroupUpdate(BaseModel):
    name: str


class Group(BaseModel):
    id: int
    name: str
    owner_id: UUID
    created_at: datetime.datetime


class GroupMember(BaseModel):
    user_id: UUID
    group_id: int
    joined_at: datetime.datetime


class InviteCreate(BaseModel):
    username: str


class Invite(BaseModel):
    id: int
    group_id: int
    inviter_id: UUID
    invitee_id: UUID
    status: str
    created_at: datetime.datetime