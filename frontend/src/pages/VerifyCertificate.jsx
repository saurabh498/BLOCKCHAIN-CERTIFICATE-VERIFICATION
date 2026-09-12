import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL ||
    "http://127.0.0.1:8000";

function VerifyCertificate() {
    const { certificateId: qrCertificateId } =
        useParams();

    const [certificateId, setCertificateId] =
        useState(qrCertificateId || "");

    const [file, setFile] = useState(null);

    const [verificationResult, setVerificationResult] =
        useState(null);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (qrCertificateId) {
            setCertificateId(qrCertificateId);
        }
    }, [qrCertificateId]);


    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!certificateId.trim()) {
            alert("Please enter Certificate ID.");
            return;
        }

        if (!file) {
            alert("Please select a PDF certificate.");
            return;
        }

        if (file.type !== "application/pdf") {
            alert("Only PDF certificate files are allowed.");
            return;
        }

        setLoading(true);
        setVerificationResult(null);

        const data = new FormData();

        data.append(
            "certificate_id",
            certificateId.trim()
        );

        data.append(
            "file",
            file
        );

        try {
            const response = await fetch(
                `${BACKEND_URL}/verify-certificate?certificate_id=${encodeURIComponent(
                    certificateId.trim()
                )}`,
                {
                    method: "POST",
                    body: data,
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.detail ||
                    "Certificate verification failed"
                );
            }

            setVerificationResult(result);

        } catch (error) {
            console.error(
                "Verification error:",
                error
            );

            alert(
                `Verification failed:\n${error.message}`
            );

        } finally {
            setLoading(false);
        }
    };


    const getStatusClass = () => {
        if (!verificationResult) {
            return "";
        }

        if (
            verificationResult.status === "VALID"
        ) {
            return "verification-valid";
        }

        if (
            verificationResult.status === "REVOKED"
        ) {
            return "verification-revoked";
        }

        return "verification-invalid";
    };


    const getStatusTitle = () => {
        if (
            verificationResult?.status === "VALID"
        ) {
            return "Certificate Verified";
        }

        if (
            verificationResult?.status === "REVOKED"
        ) {
            return "Certificate Revoked";
        }

        return "Certificate Invalid";
    };


    const getStatusMessage = () => {
        if (
            verificationResult?.status === "VALID"
        ) {
            return "This certificate is authentic and matches the record stored on the blockchain.";
        }

        if (
            verificationResult?.status === "REVOKED"
        ) {
            return "This certificate was previously registered but has been revoked by the issuer.";
        }

        return "This certificate does not match the certificate record stored on the blockchain.";
    };


    return (
        <div className="page-container">

            <div className="form-card verify-page">

                {/* HEADER */}

                <div className="verify-header">

                    <div className="verify-badge">
                        🔐
                    </div>

                    <h1>
                        Verify Certificate
                    </h1>

                    <p className="form-description">
                        Verify the authenticity of a
                        certificate using blockchain
                        technology.
                    </p>

                </div>


                {/* FORM */}

                <form
                    onSubmit={handleSubmit}
                    className="verification-form"
                >

                    <label>
                        Certificate ID
                    </label>

                    <input
                        type="text"
                        placeholder="CERT-2026-0008"
                        value={certificateId}
                        onChange={(event) =>
                            setCertificateId(
                                event.target.value
                            )
                        }
                        required
                    />


                    {qrCertificateId && (

                        <small className="qr-loaded">
                            ✓ Certificate ID loaded
                            from QR code
                        </small>

                    )}


                    <label>
                        Certificate PDF
                    </label>

                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={(event) => {

                            setFile(
                                event.target.files[0] || null
                            );

                            setVerificationResult(
                                null
                            );

                        }}
                        required
                    />


                    {file && (

                        <small className="file-selected">
                            ✓ {file.name}
                        </small>

                    )}


                    <button
                        type="submit"
                        className="primary-btn"
                        disabled={loading}
                    >

                        {loading
                            ? "Verifying..."
                            : "Verify Certificate"}

                    </button>

                </form>


                {/* VERIFICATION RESULT */}

                {verificationResult && (

                    <div
                        className={`verification-card ${getStatusClass()}`}
                    >

                        {/* STATUS SUMMARY */}

                        <div className="verification-summary">

                            <div className="verification-icon">

                                {
                                    verificationResult.status ===
                                    "VALID"
                                        ? "✓"
                                        : verificationResult.status ===
                                          "REVOKED"
                                        ? "!"
                                        : "✕"
                                }

                            </div>


                            <div>

                                <div className="verification-label">
                                    BLOCKCHAIN VERIFICATION
                                </div>

                                <h2>
                                    {getStatusTitle()}
                                </h2>

                                <p>
                                    {getStatusMessage()}
                                </p>

                            </div>

                        </div>


                        {/* CERTIFICATE DETAILS */}

                        <div className="certificate-details">

                            <h3>
                                Certificate Details
                            </h3>

                            <div className="details-grid">

                                <div className="detail-item">

                                    <span>
                                        Certificate ID
                                    </span>

                                    <strong>
                                        {
                                            verificationResult.certificate_id
                                        }
                                    </strong>

                                </div>


                                <div className="detail-item">

                                    <span>
                                        Student Name
                                    </span>

                                    <strong>
                                        {
                                            verificationResult.student_name
                                        }
                                    </strong>

                                </div>


                                <div className="detail-item">

                                    <span>
                                        Student ID
                                    </span>

                                    <strong>
                                        {
                                            verificationResult.student_id
                                        }
                                    </strong>

                                </div>


                                <div className="detail-item">

                                    <span>
                                        Course
                                    </span>

                                    <strong>
                                        {
                                            verificationResult.course
                                        }
                                    </strong>

                                </div>


                                <div className="detail-item">

                                    <span>
                                        Institute
                                    </span>

                                    <strong>
                                        {
                                            verificationResult.institute
                                        }
                                    </strong>

                                </div>


                                <div className="detail-item">

                                    <span>
                                        Issue Date
                                    </span>

                                    <strong>
                                        {
                                            verificationResult.issue_date
                                        }
                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* BLOCKCHAIN DETAILS */}

                        <div className="blockchain-details">

                            <h3>
                                Blockchain Verification
                            </h3>


                            <div className="result-row">

                                <strong>
                                    Verification Status
                                </strong>

                                <span className="verification-status">
                                    {
                                        verificationResult.status
                                    }
                                </span>

                            </div>


                            <div className="result-row">

                                <strong>
                                    Hash Match
                                </strong>

                                <span>
                                    {
                                        verificationResult.hash_matches
                                            ? "Yes ✓"
                                            : "No ✕"
                                    }
                                </span>

                            </div>


                            <div className="result-row">

                                <strong>
                                    Revocation Status
                                </strong>

                                <span>
                                    {
                                        verificationResult.revoked
                                            ? "Revoked"
                                            : "Not Revoked"
                                    }
                                </span>

                            </div>


                            <div className="result-row">

                                <strong>
                                    Issuer
                                </strong>

                                <span className="hash">
                                    {
                                        verificationResult.issuer
                                    }
                                </span>

                            </div>


                            <div className="result-row">

                                <strong>
                                    Uploaded SHA-256
                                </strong>

                                <span className="hash">
                                    {
                                        verificationResult.uploaded_file_hash
                                    }
                                </span>

                            </div>


                            <div className="result-row">

                                <strong>
                                    Blockchain SHA-256
                                </strong>

                                <span className="hash">
                                    {
                                        verificationResult.blockchain_hash
                                    }
                                </span>

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </div>
    );
}

export default VerifyCertificate;