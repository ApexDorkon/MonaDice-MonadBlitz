import uuid
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    wallet_address: str = Field(..., min_length=1)
    email: Optional[EmailStr] = None


class UserCreate(UserBase):
    pass


class UserRead(BaseModel):
    id: uuid.UUID
    wallet_address: str
    email: Optional[EmailStr] = None

    class Config:
        orm_mode = True


