import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.campaigns import Campaign, CampaignStatus
from app.schemas.campaign import CampaignCreate, CampaignRead
from app.services.campaign_service import record_campaign as record_campaign_service


router = APIRouter(prefix="/campaigns", tags=["campaigns"])


@router.post("/", response_model=CampaignRead, status_code=status.HTTP_201_CREATED)
def create_campaign(payload: CampaignCreate, db: Session = Depends(get_db)) -> Campaign:
    existing = db.query(Campaign).filter(Campaign.contract_address == payload.contract_address).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Contract already registered")

    campaign = Campaign(
        creator_id=payload.creator_id,
        contract_address=payload.contract_address,
        title=payload.title,
        symbol=payload.symbol,
        end_time=payload.end_time,
        fee_bps=payload.fee_bps,
        creation_stake=payload.creation_stake,
        status=CampaignStatus.open,
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign


@router.get("/{campaign_id}", response_model=CampaignRead)
def get_campaign(campaign_id: uuid.UUID, db: Session = Depends(get_db)) -> Campaign:
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    return campaign


@router.get("/", response_model=List[CampaignRead])
def list_campaigns(db: Session = Depends(get_db)) -> List[Campaign]:
    return db.query(Campaign).order_by(Campaign.created_at.desc()).all()


@router.post("/create", response_model=CampaignRead)
def create_campaign(data: CampaignCreate, db: Session = Depends(get_db)):
    try:
        # deprecated; kept for compatibility if needed
        campaign = db.query(Campaign).filter(Campaign.contract_address == data.contract_address).first()
        if campaign:
            return campaign
        campaign = record_campaign_service(
            db=db,
            creator_wallet=data.creator_wallet,
            contract_address=data.contract_address,
            name=data.title,
            symbol=data.symbol,
            end_time_unix=int(data.end_time.timestamp()),
            fee_bps=data.fee_bps,
            creation_stake=int(data.creation_stake),
        )
        return campaign
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/record", response_model=CampaignRead)
def record_campaign_from_frontend(data: CampaignCreate, db: Session = Depends(get_db)):
    try:
        campaign = record_campaign_service(
            db=db,
            creator_wallet=data.creator_wallet,
            contract_address=data.contract_address,
            name=data.title,
            symbol=data.symbol,
            end_time_unix=int(data.end_time.timestamp()),
            fee_bps=data.fee_bps,
            creation_stake=int(data.creation_stake),
        )
        return campaign
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


