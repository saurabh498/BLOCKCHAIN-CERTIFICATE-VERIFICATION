import os
import qrcode
from dotenv import load_dotenv

load_dotenv()

QR_DIR = "uploads/qr_codes"

os.makedirs(QR_DIR, exist_ok=True)

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
)

def generate_certificate_qr(certificate_id: str) -> str:
    verification_url = (
        f"{FRONTEND_URL}/verify/{certificate_id}"
    )

    qr = qrcode.QRCode(
        version=1,
        box_size=10,
        border=4
    )

    qr.add_data(verification_url)
    qr.make(fit=True)

    qr_image = qr.make_image()

    filename = f"{certificate_id}.png"

    file_path = os.path.join(
        QR_DIR,
        filename
    )

    qr_image.save(file_path)

    return file_path