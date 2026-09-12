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

import os
import shutil


UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


app = FastAPI(
    title="Blockchain Certificate Verification System",
    description="API for issuing and verifying certificates using blockchain",
    version="1.0.0"
)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

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

Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {
        "message": "Blockchain Certificate Verification API is running",
        "status": "success"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.get("/db-test")
def database_test(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT 1"))
    value = result.scalar()

    return {
        "database": "connected",
        "test_result": value
    }


@app.post("/upload-certificate")
async def upload_certificate(file: UploadFile = File(...)):

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    certificate_hash = calculate_file_hash(file_path)

    return {
        "message": "Certificate uploaded successfully",
        "filename": file.filename,
        "file_path": file_path,
        "sha256_hash": certificate_hash
    }

@app.post("/register-certificate")
async def register_certificate(
    certificate_id: str = Form(...),
    student_name: str = Form(...),
    student_id: str = Form(...),
    course: str = Form(...),
    institute: str = Form(...),
    issue_date: date = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    existing_certificate = db.query(Certificate).filter(
        Certificate.certificate_id == certificate_id
    ).first()

    if existing_certificate:
        raise HTTPException(
            status_code=400,
            detail="Certificate ID already exists"
        )

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    certificate_hash = calculate_file_hash(file_path)

    blockchain_result = register_certificate_on_blockchain(
    certificate_id,
    certificate_hash
)

    new_certificate = Certificate(
        certificate_id=certificate_id,
        student_name=student_name,
        student_id=student_id,
        course=course,
        institute=institute,
        issue_date=issue_date,
        file_path=file_path,
        certificate_hash=certificate_hash,
        blockchain_tx_hash=blockchain_result["transaction_hash"],
        status="ACTIVE"
    )

    db.add(new_certificate)
    db.commit()
    db.refresh(new_certificate)

    qr_path = generate_certificate_qr(
    new_certificate.certificate_id
    )

    return {
        "message": "Certificate registered successfully",
        "certificate_id": new_certificate.certificate_id,
        "student_name": new_certificate.student_name,
        "student_id": new_certificate.student_id,
        "course": new_certificate.course,
        "institute": new_certificate.institute,
        "issue_date": new_certificate.issue_date,
        "sha256_hash": new_certificate.certificate_hash,
        "blockchain_tx_hash": new_certificate.blockchain_tx_hash,
        "status": new_certificate.status,
        "qr_file_path": qr_path
    }

@app.get("/certificates/{certificate_id}")
def get_certificate(
    certificate_id: str,
    db: Session = Depends(get_db)
):
    certificate = db.query(Certificate).filter(
        Certificate.certificate_id == certificate_id
    ).first()

    if not certificate:
        raise HTTPException(
            status_code=404,
            detail="Certificate not found"
        )

    return {
        "certificate_id": certificate.certificate_id,
        "student_name": certificate.student_name,
        "student_id": certificate.student_id,
        "course": certificate.course,
        "institute": certificate.institute,
        "issue_date": certificate.issue_date,
        "sha256_hash": certificate.certificate_hash,
        "blockchain_tx_hash": certificate.blockchain_tx_hash,
        "status": certificate.status,
        "created_at": certificate.created_at
    }    

@app.post("/verify-certificate")
async def verify_certificate(
    certificate_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    certificate = db.query(Certificate).filter(
        Certificate.certificate_id == certificate_id
    ).first()

    if not certificate:
        raise HTTPException(
            status_code=404,
            detail="Certificate not found"
        )

    verify_filename = f"verify_{file.filename}"

    verify_path = os.path.join(
        UPLOAD_DIR,
        verify_filename
    )

    with open(verify_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    uploaded_hash = calculate_file_hash(
        verify_path
    )

    blockchain_certificate = get_certificate_from_blockchain(
        certificate_id
    )

    blockchain_hash = blockchain_certificate[
        "certificate_hash"
    ]

    hash_matches = (
        uploaded_hash == blockchain_hash
    )

    if blockchain_certificate["revoked"]:
        verification_status = "REVOKED"

    elif hash_matches:
        verification_status = "VALID"

    else:
        verification_status = "INVALID"

    return {
        "certificate_id": certificate.certificate_id,

        "student_name": certificate.student_name,

        "student_id": certificate.student_id,

        "course": certificate.course,

        "institute": certificate.institute,

        "issue_date": certificate.issue_date,

        "uploaded_file_hash": uploaded_hash,

        "blockchain_hash": blockchain_hash,

        "hash_matches": hash_matches,

        "revoked": blockchain_certificate["revoked"],

        "status": verification_status,

        "issuer": blockchain_certificate["issuer"],

        "blockchain_timestamp": blockchain_certificate["timestamp"],
    }

@app.post("/revoke-certificate/{certificate_id}")
def revoke_certificate(
    certificate_id: str,
    db: Session = Depends(get_db)
):
    certificate = db.query(Certificate).filter(
        Certificate.certificate_id == certificate_id
    ).first()

    if not certificate:
        raise HTTPException(
            status_code=404,
            detail="Certificate not found"
        )

    blockchain_certificate = get_certificate_from_blockchain(
        certificate_id
    )

    if blockchain_certificate["revoked"]:
        raise HTTPException(
            status_code=400,
            detail="Certificate is already revoked"
        )

    blockchain_result = revoke_certificate_on_blockchain(
        certificate_id
    )

    certificate.status = "REVOKED"
    db.commit()
    db.refresh(certificate)

    return {
        "message": "Certificate revoked successfully",
        "certificate_id": certificate_id,
        "status": "REVOKED",
        "blockchain_tx_hash": blockchain_result[
            "transaction_hash"
        ],
        "block_number": blockchain_result[
            "block_number"
        ]
    }