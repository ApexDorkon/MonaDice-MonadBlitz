import uuid
from datetime import datetime

from pydantic import BaseModel


class TicketBase(BaseModel):
    campaign_id: uuid.UUID
    user_id: uuid.UUID
    nft_id: int
    side: bool
    stake: str


class TicketCreate(TicketBase):
    pass


class TicketRead(BaseModel):
    id: uuid.UUID
    campaign_id: uuid.UUID
    user_id: uuid.UUID
    nft_id: int
    side: bool
    stake: str
    claimed: bool
    created_at: datetime

    class Config:
        orm_mode = True


