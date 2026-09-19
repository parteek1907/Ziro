from typing import List, Dict, Optional
import uuid
from app.models.wallet import Wallet, WalletCreate
from app.services.blockchain.service import BlockchainService

blockchain_service = BlockchainService()

class WalletService:
    def __init__(self):
        self._wallets: Dict[str, Wallet] = {}

    def create_wallet(self, user_id: str, data: WalletCreate) -> Wallet:
        # Validate address using blockchain adapter
        adapter = blockchain_service.get_adapter(data.chain)
        if not adapter.validate_address(data.public_address):
            raise ValueError(f"Invalid {data.chain} address format")

        wallet_id = str(uuid.uuid4())
        wallet = Wallet(
            id=wallet_id,
            user_id=user_id,
            chain=data.chain.lower(),
            public_address=data.public_address,
            wallet_type=data.wallet_type,
            is_verified=True # Auto-verify in simulation
        )
        
        self._wallets[wallet_id] = wallet
        return wallet

    def get_wallets_for_user(self, user_id: str) -> List[Wallet]:
        return [w for w in self._wallets.values() if w.user_id == user_id]

    def get_wallet(self, wallet_id: str, user_id: str) -> Optional[Wallet]:
        wallet = self._wallets.get(wallet_id)
        if wallet and wallet.user_id == user_id:
            return wallet
        return None

wallet_service = WalletService()
