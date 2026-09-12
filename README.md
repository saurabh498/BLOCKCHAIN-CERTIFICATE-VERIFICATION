# 🔐 CertChain — Blockchain-Based Certificate Verification System

A secure and tamper-resistant certificate verification system that uses **Blockchain, SHA-256 hashing, PostgreSQL, FastAPI, React.js, and QR codes** to verify the authenticity and integrity of digital certificates.

---

## 📌 Project Overview

CertChain is a blockchain-based certificate verification system designed to prevent certificate tampering and simplify certificate authenticity verification.

Traditional certificate verification often depends on manual checking or centralized databases. If a certificate PDF is modified after issuance, detecting the modification can be difficult.

CertChain solves this problem by generating a unique **SHA-256 hash** of every issued certificate and storing that hash on a blockchain through a Solidity smart contract.

During verification, the uploaded certificate is hashed again and compared with the hash stored on the blockchain.

If both hashes match, the certificate is considered authentic and unchanged.

---

## ❗ Problem Statement

Educational institutions issue a large number of digital certificates. Traditional verification methods may have several limitations:

* Manual verification can be time-consuming.
* Digital certificates can be modified after issuance.
* Centralized databases can become a single point of failure.
* Verifiers may have difficulty determining whether a PDF is genuine.
* Certificate revocation may not be easily visible to external verifiers.

CertChain provides a decentralized and tamper-evident verification mechanism.

---

## 💡 Proposed Solution

The system combines **off-chain certificate storage** with **on-chain certificate integrity verification**.

### Certificate Issuance

1. The issuer enters certificate details.
2. The certificate PDF is uploaded.
3. The backend calculates its SHA-256 hash.
4. Certificate metadata is stored in PostgreSQL.
5. The certificate ID and SHA-256 hash are registered on the blockchain.
6. A QR code containing the verification URL is generated.

### Certificate Verification

1. The verifier scans the QR code or enters the certificate ID.
2. The verifier uploads the certificate PDF.
3. The backend calculates the SHA-256 hash of the uploaded file.
4. The original hash is retrieved from the blockchain.
5. Both hashes are compared.
6. The system returns one of three results:

| Status     | Meaning                                                              |
| ---------- | -------------------------------------------------------------------- |
| ✅ VALID    | Certificate exists, is not revoked, and the hashes match             |
| ❌ INVALID  | Certificate exists but the uploaded file has been modified           |
| 🚫 REVOKED | Certificate was previously issued but has been revoked by the issuer |

---

## ✨ Key Features

* 🔐 SHA-256 certificate hashing
* ⛓️ Blockchain-based hash storage
* 📄 PDF certificate verification
* 🗃️ PostgreSQL certificate metadata storage
* 📱 QR-code based verification
* 🚫 Certificate revocation
* 🛡️ Tamper detection
* ⚡ FastAPI REST backend
* ⚛️ React.js frontend
* 🔑 Backend-controlled blockchain transactions
* 📊 Admin dashboard
* 📱 LAN/mobile verification support
* 💰 Zero-cost local development using Ganache

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      React.js       │
                    │     Frontend        │
                    └──────────┬──────────┘
                               │
                               │ HTTP / REST API
                               ▼
                    ┌─────────────────────┐
                    │      FastAPI        │
                    │      Backend        │
                    └───────┬─────┬───────┘
                            │     │
                 ┌──────────┘     └──────────┐
                 ▼                           ▼
        ┌─────────────────┐        ┌──────────────────┐
        │   PostgreSQL    │        │  SHA-256 Hashing │
        │ Certificate Data│        │   & Verification │
        └─────────────────┘        └────────┬─────────┘
                                            │
                                            ▼
                                  ┌──────────────────┐
                                  │     Ganache      │
                                  │ Local Blockchain │
                                  └────────┬─────────┘
                                           │
                                           ▼
                                  ┌──────────────────┐
                                  │ Solidity Smart   │
                                  │    Contract      │
                                  └──────────────────┘
```

---

## 🔄 Certificate Issuance Workflow

```text
Issuer
  │
  ▼
Enter Certificate Details
  │
  ▼
Upload Certificate PDF
  │
  ▼
Calculate SHA-256 Hash
  │
  ├──────────────► PostgreSQL
  │                 Metadata
  │
  ▼
Register Hash on Blockchain
  │
  ▼
Generate QR Code
  │
  ▼
Certificate Issued
```

---

## 🔎 Certificate Verification Workflow

```text
Verifier
   │
   ▼
Scan QR / Enter Certificate ID
   │
   ▼
Upload Certificate PDF
   │
   ▼
Calculate SHA-256 Hash
   │
   ▼
Retrieve Original Hash
from Blockchain
   │
   ▼
Compare Hashes
   │
   ├──── Match + Active ─────► ✅ VALID
   │
   ├──── Hash Mismatch ──────► ❌ INVALID
   │
   └──── Certificate Revoked ► 🚫 REVOKED
```

---

## 🔐 Why SHA-256?

SHA-256 is a cryptographic hashing algorithm that converts a file into a fixed-length 256-bit hash.

Even a very small modification to a certificate produces a completely different hash.

For example:

```text
Original Certificate
        │
        ▼
    SHA-256
        │
        ▼
c0a865b5c2a19f7d...
```

If the certificate is modified:

```text
Modified Certificate
        │
        ▼
    SHA-256
        │
        ▼
35d13a2dc04c66ed...
```

Since the hashes are different, the system detects that the certificate has been altered.

---

## ⛓️ Why Blockchain?

The certificate file itself is **not stored on the blockchain**.

Instead, the system stores:

* Certificate ID
* Certificate hash
* Issuer blockchain address
* Timestamp
* Revocation status

The blockchain provides a tamper-resistant record of the certificate's original hash.

This makes it possible to verify whether the certificate being presented is the same file that was originally issued.

---

## 🗃️ Why PostgreSQL + Blockchain?

The system uses both technologies for different purposes.

### PostgreSQL

Stores application-level information such as:

* Student name
* Student ID
* Course
* Institute
* Issue date
* Certificate file path
* Certificate hash
* Blockchain transaction hash
* Certificate status

### Blockchain

Stores the integrity-related information that needs a tamper-resistant record:

* Certificate ID
* SHA-256 hash
* Issuer
* Timestamp
* Revocation status

This separation keeps large application data off-chain while using blockchain where it provides the most value.

---

## 📱 QR Code Verification

Each certificate receives a QR code containing its verification URL.

Example:

```text
/verify/CERT-2026-0010
```

When scanned, the verifier is taken directly to the verification page with the certificate ID pre-filled.

The verifier then uploads the certificate PDF and the system performs hash verification.

---

## 🚫 Certificate Revocation

The issuer can revoke a previously issued certificate.

The smart contract verifies that only the original issuer can revoke the certificate.

After revocation:

```text
Certificate
     │
     ▼
Blockchain
     │
     ▼
Revoked = TRUE
     │
     ▼
Verification Result
     │
     ▼
🚫 REVOKED
```

A revoked certificate cannot become valid simply because its PDF hash matches.

---

## 🛠️ Technology Stack

| Layer              | Technology        |
| ------------------ | ----------------- |
| Frontend           | React.js          |
| Build Tool         | Vite              |
| Backend            | Python + FastAPI  |
| Database           | PostgreSQL        |
| Blockchain         | Ganache           |
| Smart Contract     | Solidity          |
| Blockchain Library | Web3.py           |
| Hashing            | SHA-256           |
| QR Generation      | Python `qrcode`   |
| API Testing        | Swagger / OpenAPI |
| Version Control    | Git + GitHub      |

---

## 📁 Project Structure

```text
BLOCKCHAIN-CERTIFICATE-VERIFICATION/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── App.css
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routes/
│   │   ├── services/
│   │   └── database.py
│   │
│   ├── uploads/
│   └── requirements.txt
│
├── blockchain/
│   ├── contracts/
│   │   └── CertificateRegistry.sol
│   │
│   └── scripts/
│       ├── compile.js
│       ├── deploy.js
│       └── CertificateRegistryABI.json
│
├── certificates/
├── docs/
│   ├── architecture/
│   ├── report/
│   └── ppt/
│
├── .env
├── .gitignore
└── README.md
```

> Runtime-generated certificate files and QR codes are intentionally excluded from GitHub through `.gitignore`.

---

## ⚙️ Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/saurabh498/BLOCKCHAIN-CERTIFICATE-VERIFICATION.git
cd BLOCKCHAIN-CERTIFICATE-VERIFICATION
```

### 2. Create Python Virtual Environment

```powershell
python -m venv venv
```

Activate it:

```powershell
.\venv\Scripts\Activate.ps1
```

### 3. Install Backend Dependencies

```powershell
cd backend
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the project root.

Example structure:

```env
DATABASE_URL=your_postgresql_connection_string
GANACHE_URL=http://127.0.0.1:7545
CONTRACT_ADDRESS=your_deployed_contract_address
BLOCKCHAIN_PRIVATE_KEY=your_ganache_private_key

FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
```

> Never commit `.env` or private blockchain keys to GitHub.

---

## ⛓️ Start Ganache

Start Ganache and make sure the local blockchain is running.

Default RPC endpoint:

```text
http://127.0.0.1:7545
```

The deployed smart contract address must be configured in `.env`.

---

## 🚀 Start Backend

From the `backend` directory:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend:

```text
http://localhost:8000
```

Swagger API documentation:

```text
http://localhost:8000/docs
```

---

## ⚛️ Start Frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🔌 API Endpoints

| Method | Endpoint                               | Purpose                          |
| ------ | -------------------------------------- | -------------------------------- |
| GET    | `/`                                    | API information                  |
| GET    | `/health`                              | Health check                     |
| GET    | `/db-test`                             | Database connectivity test       |
| POST   | `/upload-certificate`                  | Upload certificate PDF           |
| POST   | `/register-certificate`                | Register certificate             |
| GET    | `/certificates/{certificate_id}`       | Retrieve certificate information |
| POST   | `/verify-certificate`                  | Verify certificate PDF           |
| POST   | `/revoke-certificate/{certificate_id}` | Revoke certificate               |

Interactive API documentation is available through FastAPI Swagger.

---

## 🧪 Testing

The system was tested using multiple verification scenarios.

### Test 1 — Genuine Certificate

```text
Certificate ID: CERT-2026-0007

Original PDF Hash:
c0a865b5c2a19f7dff89fd2585cf115cdd2051e49763de757dc61d288010bf8d

Result:
✅ VALID
```

The uploaded certificate hash matched the blockchain hash.

---

### Test 2 — Tampered Certificate

The original certificate PDF was modified.

```text
Uploaded Hash:
35d13a2dc04c66ed7dcbb86f0a3b17725ce42db72087363fd3f2185c7889ddb4

Blockchain Hash:
c0a865b5c2a19f7dff89fd2585cf115cdd2051e49763de757dc61d288010bf8d

Result:
❌ INVALID
```

The system successfully detected the modification.

---

### Test 3 — Revoked Certificate

A previously registered certificate was revoked by its issuer.

```text
Result:
🚫 REVOKED
```

The certificate hash may still match, but the blockchain revocation status takes precedence.

---

### Test 4 — Mobile Verification

The system was also tested over a local Wi-Fi network using a mobile device.

The mobile device successfully accessed:

```text
Frontend
http://<host-ip>:5173
```

and:

```text
Backend Swagger
http://<host-ip>:8000/docs
```

Mobile certificate verification successfully returned:

```text
VALID
```

with matching SHA-256 hashes.

---

## 🔒 Security Considerations

The project follows several security principles:

* Private blockchain keys are stored in environment variables.
* `.env` is excluded from Git.
* Certificate files are not committed to the repository.
* SHA-256 is used for file integrity verification.
* Blockchain records provide a tamper-resistant integrity reference.
* Smart contract authorization prevents unauthorized certificate revocation.
* Certificate PDFs are kept off-chain rather than storing large files directly on the blockchain.

---

## ⚠️ Current Limitations

This project is currently designed as an academic/local prototype.

Current limitations include:

* Ganache is used as a local blockchain.
* The system does not currently use a public production blockchain.
* Authentication is simplified for demonstration purposes.
* Certificate storage is local.
* Production deployment would require stronger access control and infrastructure.
* Large-scale deployment would require cloud storage and production blockchain infrastructure.

---

## 🔮 Future Scope

Possible improvements include:

* 🌐 Deployment on a public blockchain or Layer-2 network
* ☁️ Cloud-based certificate storage
* 🔑 Role-based authentication and authorization
* 🏫 Multi-institution support
* 📱 Dedicated mobile verification application
* 📊 Advanced admin analytics
* 🔔 Certificate expiry and notification system
* 🧾 Batch certificate issuance
* 🔗 IPFS-based decentralized certificate storage
* 🛡️ Stronger production-grade security
* 📈 Scalable cloud deployment

---

## 🎯 Project Objectives

The primary objectives of CertChain are:

1. To provide a secure digital certificate verification mechanism.
2. To detect unauthorized certificate modifications.
3. To use blockchain for tamper-resistant certificate integrity records.
4. To simplify certificate verification using QR codes.
5. To provide certificate revocation functionality.
6. To reduce dependency on manual verification.
7. To demonstrate practical integration of blockchain with a modern web application.

---

## 📚 Academic Relevance

This project demonstrates the practical integration of:

* Blockchain technology
* Smart contracts
* Cryptographic hashing
* Database management
* REST APIs
* Full-stack web development
* QR-based verification
* Access control
* Digital document integrity

It can be used as an academic prototype for demonstrating how blockchain can improve trust and transparency in digital certificate verification.

---

## 👨‍💻 Author

**Saurabh Kumar**

Student — Computer Engineering

GitHub: `saurabh498`

---

## ⭐ Project

If you find this project useful or interesting, consider giving the repository a star!

**CertChain — Verify certificates with trust and confidence.**
