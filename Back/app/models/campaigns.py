import enum
import uuid

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, Numeric, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class CampaignStatus(str, enum.Enum):
    open = "open"
    resolved = "resolved"
    canceled = "canceled"


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    creator_wallet = Column(String(255), ForeignKey("users.wallet_address"), nullable=False)
    contract_address = Column(String(255), unique=True, nullable=False)
    title = Column(String(255), nullable=False)
    symbol = Column(String(64), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    fee_bps = Column(Integer, nullable=False)
    creation_stake = Column(Numeric(precision=38, scale=18), nullable=False)
    status = Column(Enum(CampaignStatus, name="campaign_status"), nullable=False, default=CampaignStatus.open)
    outcome = Column(Boolean, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)

    creator = relationship("User", backref="campaigns", primaryjoin="Campaign.creator_wallet==User.wallet_address")


