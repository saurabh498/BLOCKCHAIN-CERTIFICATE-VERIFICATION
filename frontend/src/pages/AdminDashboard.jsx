import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL ||
    "http://127.0.0.1:8000";


function AdminDashboard() {

    const navigate = useNavigate();

    const [certificateId, setCertificateId] =
        useState("");

    const [certificate, setCertificate] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");


    const handleLogout = () => {

        sessionStorage.removeItem(
            "adminAuthenticated"
        );

        navigate("/admin");
    };


    const searchCertificate = async () => {

        if (!certificateId.trim()) {
            setError(
                "Please enter Certificate ID."
            );

            return;
        }

        setLoading(true);
        setCertificate(null);
        setMessage("");
        setError("");


        try {

            const response = await fetch(
                `${BACKEND_URL}/certificates/${encodeURIComponent(
                    certificateId.trim()
                )}`
            );

            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.detail ||
                    "Certificate not found"
                );
            }


            setCertificate(result);

        } catch (error) {

            setError(
                error.message
            );

        } finally {

            setLoading(false);
        }
    };


    const revokeCertificate = async () => {

        if (!certificate) {
            return;
        }


        const confirmed =
            window.confirm(
                `Are you sure you want to revoke certificate ${certificate.certificate_id}?`
            );


        if (!confirmed) {
            return;
        }


        setLoading(true);
        setMessage("");
        setError("");


        try {

            const response =
                await fetch(
                    `${BACKEND_URL}/revoke-certificate/${encodeURIComponent(
                        certificate.certificate_id
                    )}`,
                    {
                        method: "POST",
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.detail ||
                    "Certificate revocation failed"
                );
            }


            setMessage(
                "Certificate revoked successfully on the blockchain."
            );


            setCertificate({
                ...certificate,
                status: "REVOKED",
            });


        } catch (error) {

            setError(
                error.message
            );

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="page-container">

            <div className="form-card admin-page">


                <div className="admin-header">

                    <div className="admin-header-top">

                        <div>

                            <div className="admin-icon">
                                🔐
                            </div>

                            <h1>
                                Admin Dashboard
                            </h1>

                            <p className="form-description">
                                Manage certificate records
                                and revoke certificates
                                when required.
                            </p>

                        </div>


                        <button
                            type="button"
                            className="logout-btn"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </div>

                </div>


                <div className="admin-search">

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
                    />


                    <button
                        type="button"
                        className="primary-btn"
                        onClick={searchCertificate}
                        disabled={loading}
                    >
                        {loading
                            ? "Searching..."
                            : "Find Certificate"}
                    </button>

                </div>


                {message && (

                    <div className="admin-success">
                        ✓ {message}
                    </div>

                )}


                {error && (

                    <div className="admin-error">
                        ✕ {error}
                    </div>

                )}


                {certificate && (

                    <div className="admin-certificate">


                        <div className="admin-certificate-header">

                            <div>

                                <span>
                                    CERTIFICATE
                                </span>

                                <h2>
                                    {
                                        certificate.certificate_id
                                    }
                                </h2>

                            </div>


                            <div
                                className={
                                    certificate.status ===
                                    "REVOKED"
                                        ? "admin-status revoked"
                                        : "admin-status active"
                                }
                            >
                                {
                                    certificate.status ||
                                    "ACTIVE"
                                }
                            </div>

                        </div>


                        <div className="admin-details">


                            <div>

                                <span>
                                    Student Name
                                </span>

                                <strong>
                                    {
                                        certificate.student_name
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Student ID
                                </span>

                                <strong>
                                    {
                                        certificate.student_id
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Course
                                </span>

                                <strong>
                                    {
                                        certificate.course
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Institute
                                </span>

                                <strong>
                                    {
                                        certificate.institute
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Issue Date
                                </span>

                                <strong>
                                    {
                                        certificate.issue_date
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Certificate Hash
                                </span>

                                <strong className="admin-hash">
                                    {
                                        certificate.certificate_hash
                                    }
                                </strong>

                            </div>


                        </div>


                        {certificate.status !==
                            "REVOKED" && (

                            <button
                                type="button"
                                className="revoke-btn"
                                onClick={
                                    revokeCertificate
                                }
                                disabled={loading}
                            >
                                {loading
                                    ? "Revoking..."
                                    : "Revoke Certificate"}
                            </button>

                        )}


                        {certificate.status ===
                            "REVOKED" && (

                            <div className="already-revoked">

                                This certificate has
                                already been revoked.

                            </div>

                        )}

                    </div>

                )}

            </div>

        </div>
    );
}


export default AdminDashboard;