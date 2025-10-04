from pathlib import Path
import json

CONTRACTS_DIR = Path(__file__).parent

factory_abi_path = CONTRACTS_DIR / "factory_abi.json"
campaign_abi_path = CONTRACTS_DIR / "campaign_abi.json"

try:
    with factory_abi_path.open("r", encoding="utf-8") as f:
        factory_abi = json.load(f)
except FileNotFoundError:
    factory_abi = []

try:
    with campaign_abi_path.open("r", encoding="utf-8") as f:
        campaign_abi = json.load(f)
except FileNotFoundError:
    campaign_abi = []


