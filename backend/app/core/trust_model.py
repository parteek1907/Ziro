"""
ZiroTrust Alternative Credit Scoring Configuration and Trust Model.

TRUST MODEL:
| Party                 | Learns                                                               | Trusted for                                                           |
|-----------------------|----------------------------------------------------------------------|-----------------------------------------------------------------------|
| Borrower device       | Everything about the borrower                                        | Holding the secret key; generating the proof locally                  |
| Ziro scoring oracle   | Borrower's scored data, score, identity commitment                   | Computing the score correctly and signing it. Ziro is NOT blind to it.|
| Lender                | Only: score >= threshold, model version, pool-scoped nullifier       | Nothing about the borrower's data                                     |
| Verifier contract     | Public inputs and proof                                              | Enforcing the on-chain checks                                         |
| Peers                 | Their own stakes and the borrower's vouch status                     | Honoring their stakes                                                 |

Note: Oracle compromise, oracle collusion, and oracle data access are residual risks. 
Ziro is NOT blind to the data. 
"""

# Hard Constraints & Parameters [ASSUMPTION] (Defaults for MVP)
MODEL_VERSION = "v0"
SCALE = 1_000_000  # Fixed point integer math scale 10^6

# V1 Parameters
V1_WEIGHT = int(0.35 * SCALE)
V1_ALPHA = int(0.5 * SCALE)
MIN_REMITTANCE_INTERVALS = 3
X_TARGET_USD = int(500 * SCALE)  # Target monthly inflow in USD

# V2 Parameters
V2_WEIGHT = int(0.35 * SCALE)
STREAK_TARGET = 6

# V3 Parameters
V3_WEIGHT = int(0.20 * SCALE)
STAKE_TARGET_USD = int(100 * SCALE)
MAX_STAKE_DURATION_DAYS = 90

# V4 Parameters
V4_WEIGHT = int(0.10 * SCALE)

# Cap for thin files missing data
THIN_FILE_CAP = 650

# Borrower Protection
MAX_APR_POLICY = 24.0  # Lenders cannot exceed 24% APR in Ziro ecosystem
