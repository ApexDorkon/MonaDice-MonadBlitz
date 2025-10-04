from sqlalchemy.orm import Session
from app.models.tickets import Ticket


def record_ticket(
    db: Session,
    campaign_id,
    user_id,
    nft_id: int,
    side: bool,
    stake: str,
):
    ticket = Ticket(
        campaign_id=campaign_id,
        user_id=user_id,
        nft_id=nft_id,
        side=side,
        stake=stake,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


