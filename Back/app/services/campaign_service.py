from datetime import datetime
from sqlalchemy.orm import Session
from app.models.campaigns import Campaign


def record_campaign(
    db: Session,
    creator_wallet: str,
    contract_address: str,
    name: str,
    symbol: str,
    end_time_unix: int,
    fee_bps: int,
    creation_stake: int,
):
    end_time = datetime.fromtimestamp(end_time_unix)

    new_campaign = Campaign(
        creator_wallet=creator_wallet,
        contract_address=contract_address,
        title=name,
        symbol=symbol,
        end_time=end_time,
        fee_bps=fee_bps,
        creation_stake=str(creation_stake),
    )

    db.add(new_campaign)
    db.commit()
    db.refresh(new_campaign)
    return new_campaign


