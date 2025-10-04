import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.campaigns import Campaign
from app.models.tickets import Ticket
from app.schemas.ticket import TicketCreate, TicketRead
from app.services.ticket_service import record_ticket as record_ticket_service


router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.post("/", response_model=TicketRead, status_code=status.HTTP_201_CREATED)
def create_ticket(payload: TicketCreate, db: Session = Depends(get_db)) -> Ticket:
    # Verify campaign exists
    campaign = db.query(Campaign).filter(Campaign.id == payload.campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid campaign_id")

    ticket = Ticket(
        campaign_id=payload.campaign_id,
        user_id=payload.user_id,
        nft_id=payload.nft_id,
        side=payload.side,
        stake=payload.stake,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


@router.get("/{ticket_id}", response_model=TicketRead)
def get_ticket(ticket_id: uuid.UUID, db: Session = Depends(get_db)) -> Ticket:
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    return ticket


@router.get("/campaign/{campaign_id}", response_model=List[TicketRead])
def list_tickets_for_campaign(campaign_id: uuid.UUID, db: Session = Depends(get_db)) -> List[Ticket]:
    return db.query(Ticket).filter(Ticket.campaign_id == campaign_id).order_by(Ticket.created_at.desc()).all()


@router.post("/record", response_model=TicketRead)
def record_ticket_from_frontend(data: TicketCreate, db: Session = Depends(get_db)):
    try:
        ticket = record_ticket_service(
            db=db,
            campaign_id=data.campaign_id,
            user_id=data.user_id,
            nft_id=data.nft_id,
            side=data.side,
            stake=data.stake,
        )
        return ticket
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


