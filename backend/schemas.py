from pydantic import BaseModel, EmailStr
from typing import List, Optional
from .models import Role, Status

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    role: Role

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

# Attachment schemas
class AttachmentBase(BaseModel):
    file_name: str

class AttachmentCreate(AttachmentBase):
    pass

class Attachment(AttachmentBase):
    id: int
    task_id: int
    file_path: str

    class Config:
        from_attributes = True

# Task schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: int
    status: Status

class TaskCreate(TaskBase):
    assignee_id: int

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[int] = None
    status: Optional[Status] = None
    assignee_id: Optional[int] = None

class Task(TaskBase):
    id: int
    creator_id: int
    assignee_id: int
    attachments: List[Attachment] = []

    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None