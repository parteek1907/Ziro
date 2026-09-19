from typing import Dict, Optional
from app.services.blockchain.adapter import ChainAdapter
from app.services.blockchain.simulation import SimulationAdapter
from app.services.blockchain.stellar import StellarAdapter
from app.services.blockchain.polygon import PolygonAdapter

class BlockchainService:
    def __init__(self):
        self._adapters: Dict[str, ChainAdapter] = {
            "simulation": SimulationAdapter(),
            "stellar": StellarAdapter(),
            "polygon": PolygonAdapter()
        }

    def get_adapter(self, chain: str) -> ChainAdapter:
        adapter = self._adapters.get(chain.lower())
        if not adapter:
            raise ValueError(f"Unsupported blockchain: {chain}")
        return adapter
