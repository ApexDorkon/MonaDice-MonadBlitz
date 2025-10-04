import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Numeric, String, BigInteger, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    nft_id = Column(BigInteger, nullable=False)
    side = Column(Boolean, nullable=False)
    stake = Column(Numeric(precision=38, scale=18), nullable=False)
    claimed = Column(Boolean, nullable=False, server_default=text("false"))
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)

    campaign = relationship("Campaign", backref="tickets")
    user = relationship("User", backref="tickets")


