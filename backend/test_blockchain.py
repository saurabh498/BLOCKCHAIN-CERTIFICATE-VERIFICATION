from app.services.blockchain_service import (
    register_certificate_on_blockchain
)


certificate_id = "CERT-2026-0001"

certificate_hash = (
    "67b87f3081e031e454ebca3a357e4550e9eb25942490c230c37c4ada6301859b"
)


result = register_certificate_on_blockchain(
    certificate_id,
    certificate_hash
)


print("\n✅ Certificate registered on blockchain!")
print("Transaction Hash:", result["transaction_hash"])
print("Block Number:", result["block_number"])
print("Contract Address:", result["contract_address"])