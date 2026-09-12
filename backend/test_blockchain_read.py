from app.services.blockchain_service import (
    get_certificate_from_blockchain
)

certificate_id = "CERT-2026-0001"

result = get_certificate_from_blockchain(
    certificate_id
)

print("\n✅ Certificate found on blockchain!")
print("Certificate ID:", result["certificate_id"])
print("Certificate Hash:", result["certificate_hash"])
print("Issuer:", result["issuer"])
print("Timestamp:", result["timestamp"])
print("Revoked:", result["revoked"])