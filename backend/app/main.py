from fastapi import (
    FastAPI,
    Depends,
    UploadFile,
    File,
    Form,
    HTTPException
)
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import engine, Base, get_db
from app.models.certificate import Certificate
from app.services.hash_service import calculate_file_hash
from app.schemas.certificate import CertificateCreate
from datetime import date
from app.services.blockchain_service import (
    register_certificate_on_blockchain,
    get_certificate_from_blockchain,
    revoke_certificate_on_blockchain
)
from app.services.qr_service import generate_certificate_qr
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.schemas.auth import AdminLoginRequest, TokenResponse
from app.services.auth_service import (
    authenticate_admin,
    create_access_token,
    verify_admin_token
)

import os
import shutil
import uuid


# ============================================================
# CONFIGURATION
# ============================================================

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)

# Maximum allowed upload size: 10 MB
MAX_FILE_SIZE = 10 * 1024 * 1024


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Blockchain Certificate Verification System",
    description="API for issuing and verifying certificates using blockchain",
    version="1.0.0"
)


# ============================================================
# STATIC FILES
# ============================================================

app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_DIR),
    name="uploads"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://10.186.118.226:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# DATABASE
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# HELPER FUNCTIONS
# ============================================================

async def save_upload_file(
    file: UploadFile,
    destination_path: str
):
    """
    Safely save an uploaded file while enforcing
    the maximum file size.
    """

    total_size = 0

    try:
        with open(destination_path, "wb") as buffer:

            while True:

                chunk = await file.read(1024 * 1024)

                if not chunk:
                    break

                total_size += len(chunk)

                if total_size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="File size exceeds the 10 MB limit"
                    )

                buffer.write(chunk)

    except HTTPException:
        # Remove partially written file
        if os.path.exists(destination_path):
            os.remove(destination_path)

        raise

    except Exception:
        # Remove partially written file if something fails
        if os.path.exists(destination_path):
            os.remove(destination_path)

        raise

    finally:
        await file.close()

    return total_size


def generate_safe_filename(extension=".pdf"):
    """
    Generate a server-side filename.

    The original filename supplied by the user is never
    used as a filesystem path.
    """

    return f"{uuid.uuid4().hex}{extension}"


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "Blockchain Certificate Verification API is running",
        "status": "success"
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


# ============================================================
# DATABASE TEST
# ============================================================

@app.get("/db-test")
def database_test(db: Session = Depends(get_db)):

    result = db.execute(text("SELECT 1"))
    value = result.scalar()

    return {
        "database": "connected",
        "test_result": value
    }


# ============================================================
# GENERAL CERTIFICATE UPLOAD
# ============================================================

@app.post("/upload-certificate")
async def upload_certificate(
    file: UploadFile = File(...)
):

    # Validate MIME type
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    # Generate safe server-side filename
    safe_filename = generate_safe_filename()

    file_path = os.path.join(
        UPLOAD_DIR,
        safe_filename
    )

    file_size = await save_upload_file(
        file,
        file_path
    )

    certificate_hash = calculate_file_hash(
        file_path
    )

    return {
        "message": "Certificate uploaded successfully",
        "filename": safe_filename,
        "file_size": file_size,
        "file_path": file_path,
        "sha256_hash": certificate_hash
    }


# ============================================================
# REGISTER CERTIFICATE
# ADMIN ONLY
# ============================================================

@app.post("/register-certificate")
async def register_certificate(

    current_admin: str = Depends(
        verify_admin_token
    ),

    certificate_id: str = Form(...),
    student_name: str = Form(...),
    student_id: str = Form(...),
    course: str = Form(...),
    institute: str = Form(...),
    issue_date: date = Form(...),

    file: UploadFile = File(...),

    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # PDF validation
    # --------------------------------------------------------

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )


    # --------------------------------------------------------
    # Certificate ID duplicate check
    # --------------------------------------------------------

    existing_certificate = db.query(
        Certificate
    ).filter(
        Certificate.certificate_id == certificate_id
    ).first()

    if existing_certificate:
        raise HTTPException(
            status_code=400,
            detail="Certificate ID already exists"
        )


    # --------------------------------------------------------
    # SAFE FILE STORAGE
    # --------------------------------------------------------

    safe_filename = generate_safe_filename()

    file_path = os.path.join(
        UPLOAD_DIR,
        safe_filename
    )

    await save_upload_file(
        file,
        file_path
    )


    # --------------------------------------------------------
    # SHA-256 HASH
    # --------------------------------------------------------

    certificate_hash = calculate_file_hash(
        file_path
    )


    # --------------------------------------------------------
    # BLOCKCHAIN REGISTRATION
    # --------------------------------------------------------

    blockchain_result = (
        register_certificate_on_blockchain(
            certificate_id,
            certificate_hash
        )
    )


    # --------------------------------------------------------
    # DATABASE RECORD
    # --------------------------------------------------------

    new_certificate = Certificate(

        certificate_id=certificate_id,

        student_name=student_name,

        student_id=student_id,

        course=course,

        institute=institute,

        issue_date=issue_date,

        file_path=file_path,

        certificate_hash=certificate_hash,

        blockchain_tx_hash=
            blockchain_result["transaction_hash"],

        status="ACTIVE"
    )

    db.add(new_certificate)

    db.commit()

    db.refresh(new_certificate)


    # --------------------------------------------------------
    # QR CODE
    # --------------------------------------------------------

    qr_path = generate_certificate_qr(
        new_certificate.certificate_id
    )


    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {

        "message":
            "Certificate registered successfully",

        "certificate_id":
            new_certificate.certificate_id,

        "student_name":
            new_certificate.student_name,

        "student_id":
            new_certificate.student_id,

        "course":
            new_certificate.course,

        "institute":
            new_certificate.institute,

        "issue_date":
            new_certificate.issue_date,

        "sha256_hash":
            new_certificate.certificate_hash,

        "blockchain_tx_hash":
            new_certificate.blockchain_tx_hash,

        "status":
            new_certificate.status,

        "qr_file_path":
            qr_path
    }


# ============================================================
# GET CERTIFICATE
# PUBLIC
# ============================================================

@app.get("/certificates/{certificate_id}")
def get_certificate(

    certificate_id: str,

    db: Session = Depends(get_db)
):

    certificate = db.query(
        Certificate
    ).filter(
        Certificate.certificate_id == certificate_id
    ).first()


    if not certificate:
        raise HTTPException(
            status_code=404,
            detail="Certificate not found"
        )


    return {

        "certificate_id":
            certificate.certificate_id,

        "student_name":
            certificate.student_name,

        "student_id":
            certificate.student_id,

        "course":
            certificate.course,

        "institute":
            certificate.institute,

        "issue_date":
            certificate.issue_date,

        "sha256_hash":
            certificate.certificate_hash,

        "blockchain_tx_hash":
            certificate.blockchain_tx_hash,

        "status":
            certificate.status,

        "created_at":
            certificate.created_at
    }


# ============================================================
# VERIFY CERTIFICATE
# PUBLIC
# ============================================================

@app.post("/verify-certificate")
async def verify_certificate(

    certificate_id: str,

    file: UploadFile = File(...),

    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # PDF validation
    # --------------------------------------------------------

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )


    # --------------------------------------------------------
    # Certificate lookup
    # --------------------------------------------------------

    certificate = db.query(
        Certificate
    ).filter(
        Certificate.certificate_id == certificate_id
    ).first()


    if not certificate:
        raise HTTPException(
            status_code=404,
            detail="Certificate not found"
        )


    # --------------------------------------------------------
    # SAFE TEMPORARY VERIFICATION FILE
    # --------------------------------------------------------

    safe_filename = (
        f"verify_{uuid.uuid4().hex}.pdf"
    )

    verify_path = os.path.join(
        UPLOAD_DIR,
        safe_filename
    )


    try:

        # ----------------------------------------------------
        # Save uploaded verification PDF
        # ----------------------------------------------------

        await save_upload_file(
            file,
            verify_path
        )


        # ----------------------------------------------------
        # Calculate uploaded PDF hash
        # ----------------------------------------------------

        uploaded_hash = calculate_file_hash(
            verify_path
        )


        # ----------------------------------------------------
        # Get blockchain record
        # ----------------------------------------------------

        blockchain_certificate = (
            get_certificate_from_blockchain(
                certificate_id
            )
        )


        blockchain_hash = (
            blockchain_certificate[
                "certificate_hash"
            ]
        )


        # ----------------------------------------------------
        # Compare hashes
        # ----------------------------------------------------

        hash_matches = (
            uploaded_hash == blockchain_hash
        )


        # ----------------------------------------------------
        # Determine verification status
        # ----------------------------------------------------

        if blockchain_certificate["revoked"]:

            verification_status = "REVOKED"

        elif hash_matches:

            verification_status = "VALID"

        else:

            verification_status = "INVALID"


        # ----------------------------------------------------
        # Response
        # ----------------------------------------------------

        return {

            "certificate_id":
                certificate.certificate_id,

            "student_name":
                certificate.student_name,

            "student_id":
                certificate.student_id,

            "course":
                certificate.course,

            "institute":
                certificate.institute,

            "issue_date":
                certificate.issue_date,

            "uploaded_file_hash":
                uploaded_hash,

            "blockchain_hash":
                blockchain_hash,

            "hash_matches":
                hash_matches,

            "revoked":
                blockchain_certificate["revoked"],

            "status":
                verification_status,

            "issuer":
                blockchain_certificate["issuer"],

            "blockchain_timestamp":
                blockchain_certificate["timestamp"],
        }


    finally:

        # ----------------------------------------------------
        # Delete temporary verification file
        # ----------------------------------------------------

        if os.path.exists(verify_path):

            os.remove(verify_path)


# ============================================================
# REVOKE CERTIFICATE
# ADMIN ONLY
# ============================================================

@app.post("/revoke-certificate/{certificate_id}")
def revoke_certificate(

    certificate_id: str,

    current_admin: str = Depends(
        verify_admin_token
    ),

    db: Session = Depends(get_db)
):

    certificate = db.query(
        Certificate
    ).filter(
        Certificate.certificate_id == certificate_id
    ).first()


    if not certificate:
        raise HTTPException(
            status_code=404,
            detail="Certificate not found"
        )


    blockchain_certificate = (
        get_certificate_from_blockchain(
            certificate_id
        )
    )


    if blockchain_certificate["revoked"]:

        raise HTTPException(
            status_code=400,
            detail="Certificate is already revoked"
        )


    blockchain_result = (
        revoke_certificate_on_blockchain(
            certificate_id
        )
    )


    certificate.status = "REVOKED"

    db.commit()

    db.refresh(certificate)


    return {

        "message":
            "Certificate revoked successfully",

        "certificate_id":
            certificate_id,

        "status":
            "REVOKED",

        "blockchain_tx_hash":
            blockchain_result[
                "transaction_hash"
            ],

        "block_number":
            blockchain_result[
                "block_number"
            ]
    }


# ============================================================
# ADMIN LOGIN
# ============================================================

@app.post(
    "/admin/login",
    response_model=TokenResponse
)
def admin_login(
    credentials: AdminLoginRequest
):

    if not authenticate_admin(
        credentials.username,
        credentials.password
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )


    access_token = create_access_token(
        credentials.username
    )


    return {

        "access_token":
            access_token,

        "token_type":
            "bearer"
    }