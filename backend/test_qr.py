from app.services.qr_service import generate_certificate_qr


qr_path = generate_certificate_qr(
    "CERT-2026-0001"
)

print("✅ QR Code generated!")
print("QR Path:", qr_path)