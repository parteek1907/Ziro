from typing import List, Dict, Optional
import uuid
from app.models.wallet import Wallet, WalletCreate
from app.services.blockchain.service import BlockchainService

blockchain_service = BlockchainService()

class WalletService:
    def __init__(self):
        self._wallets: Dict[str, Wallet] = {}

    def create_wallet(self, user_id: str, data: WalletCreate) -> Wallet:
        adapter = blockchain_service.get_adapter(data.chain)
        
        public_address = data.public_address
        private_key = None
        
        if not public_address:
            # Auto-generate a real Web3 wallet if not provided
            from eth_account import Account
            import secrets
            # Create random entropy
            priv = secrets.token_hex(32)
            acct = Account.from_key("0x" + priv)
            public_address = acct.address
            private_key = "0x" + priv
            
        if not adapter.validate_address(public_address):
            raise ValueError(f"Invalid {data.chain} address format")

        wallet_id = str(uuid.uuid4())
        wallet = Wallet(
            id=wallet_id,
            user_id=user_id,
            chain=data.chain.lower(),
            public_address=public_address,
            private_key=private_key,
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
