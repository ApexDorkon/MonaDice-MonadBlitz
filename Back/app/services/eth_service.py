from typing import Any, Dict

from web3 import Web3
from app.config import get_settings
from eth_account import Account
import json
from pathlib import Path


class EthService:
    def __init__(self):
        self.settings = get_settings()
        self.web3 = Web3(Web3.HTTPProvider(self.settings.WEB3_PROVIDER_URL))
        self.oracle_account = Account.from_key(self.settings.ORACLE_PRIVATE_KEY)

    def get_contract(self, address: str, abi: list):
        return self.web3.eth.contract(address=self.web3.to_checksum_address(address), abi=abi)

    def sign_and_send(self, tx):
        signed = self.oracle_account.sign_transaction(tx)
        tx_hash = self.web3.eth.send_raw_transaction(signed.rawTransaction)
        receipt = self.web3.eth.wait_for_transaction_receipt(tx_hash)
        return tx_hash.hex(), receipt


eth_service = EthService()


