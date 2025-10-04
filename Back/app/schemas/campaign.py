import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CampaignBase(BaseModel):
    creator_wallet: str
    contract_address: str
    title: str
    symbol: str
    end_time: datetime
    fee_bps: int = Field(..., ge=0, le=10_000)
    creation_stake: str


class CampaignCreate(CampaignBase):
    pass


class CampaignRead(BaseModel):
    id: uuid.UUID
    creator_wallet: str
    contract_address: str
    title: str
    symbol: str
    end_time: datetime
    fee_bps: int
    creation_stake: str
    status: str
    outcome: Optional[bool] = None
    created_at: datetime

    class Config:
        orm_mode = True


