import { useState } from "react";

const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL ||
    "http://127.0.0.1:8000";


function IssueCertificate() {

    const [formData, setFormData] = useState({
        certificate_id: "",
        student_name: "",
        student_id: "",
        course: "",
        institute: "",
        issue_date: "",
    });

    const [file, setFile] = useState(null);

    const [loading, setLoading] = useState(false);

    const [result, setResult] = useState(null);

    const [error, setError] = useState("");


    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
    };


    const handleFileChange = (event) => {

        const selectedFile =
            event.target.files[0];

        setFile(selectedFile || null);

        setError("");
    };


    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setResult(null);


        if (!file) {

            setError(
                "Please upload the certificate PDF."
            );

            return;
        }


        if (file.type !== "application/pdf") {

            setError(
                "Only PDF certificate files are allowed."
            );

            return;
        }


        const token =
            sessionStorage.getItem("adminToken");


        if (!token) {

            setError(
                "Admin session expired. Please login again."
            );

            window.location.href = "/admin";

            return;
        }


        setLoading(true);


        const data = new FormData();

        data.append(
            "certificate_id",
            formData.certificate_id.trim()
        );

        data.append(
            "student_name",
            formData.student_name.trim()
        );

        data.append(
            "student_id",
            formData.student_id.trim()
        );

        data.append(
            "course",
            formData.course.trim()
        );

        data.append(
            "institute",
            formData.institute.trim()
        );

        data.append(
            "issue_date",
            formData.issue_date
        );

        data.append("file", file);


        try {

            const response = await fetch(
                `${BACKEND_URL}/register-certificate`,
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },

                    body: data,
                }
            );


            const responseData =
                await response.json();


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                sessionStorage.removeItem(
                    "adminAuthenticated"
                );

                sessionStorage.removeItem(
                    "adminToken"
                );

                window.location.href = "/admin";

                return;
            }


            if (!response.ok) {

                throw new Error(
                    responseData.detail ||
                    "Certificate registration failed."
                );
            }


            setResult(responseData);


        } catch (error) {

            console.error(
                "Certificate issue error:",
                error
            );

            setError(
                error.message ||
                "Something went wrong while issuing the certificate."
            );

        } finally {

            setLoading(false);
        }
    };


    const handleReset = () => {

        setFormData({
            certificate_id: "",
            student_name: "",
            student_id: "",
            course: "",
            institute: "",
            issue_date: "",
        });

        setFile(null);

        setResult(null);

        setError("");


        const fileInput =
            document.getElementById(
                "certificate-file"
            );


        if (fileInput) {
            fileInput.value = "";
        }
    };


    const getQrUrl = () => {

        if (!result?.qr_file_path) {
            return null;
        }


        const normalizedPath =
            result.qr_file_path
                .replaceAll("\\", "/")
                .replace(/^\/+/, "");


        return `${BACKEND_URL}/${normalizedPath}`;
    };


    const downloadQr = async () => {

        const qrUrl = getQrUrl();


        if (!qrUrl) {
            return;
        }


        try {

            const response =
                await fetch(qrUrl);


            if (!response.ok) {

                throw new Error(
                    "QR code could not be downloaded."
                );
            }


            const blob =
                await response.blob();


            const url =
                window.URL.createObjectURL(blob);


            const link =
                document.createElement("a");


            link.href = url;


            link.download =
                `${formData.certificate_id}-QR.png`;


            document.body.appendChild(link);

            link.click();

            link.remove();


            window.URL.revokeObjectURL(url);


        } catch (error) {

            console.error(
                "QR download error:",
                error
            );


            window.open(
                qrUrl,
                "_blank"
            );
        }
    };


    return (

        <div className="page-container">

            <div className="form-card issue-page">

                {/* HEADER */}

                <div className="issue-header">

                    <div className="issue-icon">
                        📜
                    </div>

                    <div>

                        <div className="issue-label">
                            CERTIFICATE ISSUANCE
                        </div>

                        <h1>
                            Issue Certificate
                        </h1>

                        <p className="form-description">
                            Register a digital certificate
                            securely on the blockchain and
                            generate a QR code for verification.
                        </p>

                    </div>

                </div>


                {/* SUCCESS RESULT */}

                {result && (

                    <div className="issue-success">

                        <div className="issue-success-icon">
                            ✓
                        </div>

                        <div className="issue-success-content">

                            <div className="success-label">
                                BLOCKCHAIN REGISTRATION COMPLETE
                            </div>

                            <h2>
                                Certificate Issued Successfully
                            </h2>

                            <p>
                                The certificate has been registered
                                and its SHA-256 hash has been securely
                                recorded on the blockchain.
                            </p>

                        </div>

                    </div>
                )}


                {/* ERROR */}

                {error && (

                    <div className="issue-error">

                        <span>
                            ✕
                        </span>

                        <div>

                            <strong>
                                Certificate issuance failed
                            </strong>

                            <p>
                                {error}
                            </p>

                        </div>

                    </div>
                )}


                {/* FORM */}

                {!result && (

                    <form
                        onSubmit={handleSubmit}
                        className="issue-form"
                    >

                        {/* CERTIFICATE INFORMATION */}

                        <div className="form-section">

                            <div className="form-section-heading">

                                <span className="section-number">
                                    01
                                </span>

                                <div>

                                    <h3>
                                        Certificate Information
                                    </h3>

                                    <p>
                                        Enter the details that will
                                        be associated with the certificate.
                                    </p>

                                </div>

                            </div>


                            <div className="form-grid">

                                <div className="form-field">

                                    <label>
                                        Certificate ID
                                    </label>

                                    <input
                                        type="text"
                                        name="certificate_id"
                                        placeholder="CERT-2026-0010"
                                        value={
                                            formData.certificate_id
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                    <small>
                                        Use a unique certificate ID.
                                    </small>

                                </div>


                                <div className="form-field">

                                    <label>
                                        Issue Date
                                    </label>

                                    <input
                                        type="date"
                                        name="issue_date"
                                        value={
                                            formData.issue_date
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                <div className="form-field">

                                    <label>
                                        Student Name
                                    </label>

                                    <input
                                        type="text"
                                        name="student_name"
                                        placeholder="Enter student name"
                                        value={
                                            formData.student_name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                <div className="form-field">

                                    <label>
                                        Student ID
                                    </label>

                                    <input
                                        type="text"
                                        name="student_id"
                                        placeholder="Enter student ID"
                                        value={
                                            formData.student_id
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                <div className="form-field">

                                    <label>
                                        Course
                                    </label>

                                    <input
                                        type="text"
                                        name="course"
                                        placeholder="e.g. Computer Engineering"
                                        value={
                                            formData.course
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                <div className="form-field">

                                    <label>
                                        Institute
                                    </label>

                                    <input
                                        type="text"
                                        name="institute"
                                        placeholder="Enter institute name"
                                        value={
                                            formData.institute
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>

                            </div>

                        </div>


                        {/* FILE UPLOAD */}

                        <div className="form-section">

                            <div className="form-section-heading">

                                <span className="section-number">
                                    02
                                </span>

                                <div>

                                    <h3>
                                        Certificate PDF
                                    </h3>

                                    <p>
                                        Upload the original certificate
                                        that will be hashed and registered.
                                    </p>

                                </div>

                            </div>


                            <label
                                htmlFor="certificate-file"
                                className={`upload-area ${
                                    file
                                        ? "upload-selected"
                                        : ""
                                }`}
                            >

                                <div className="upload-icon">
                                    {file ? "✓" : "↑"}
                                </div>


                                {file ? (

                                    <>
                                        <strong>
                                            {file.name}
                                        </strong>

                                        <span>
                                            PDF selected successfully
                                        </span>
                                    </>

                                ) : (

                                    <>
                                        <strong>
                                            Upload certificate PDF
                                        </strong>

                                        <span>
                                            Click here to select the
                                            original certificate file
                                        </span>
                                    </>

                                )}


                                <input
                                    id="certificate-file"
                                    type="file"
                                    accept="application/pdf"
                                    onChange={
                                        handleFileChange
                                    }
                                    required
                                />

                            </label>

                        </div>


                        {/* SECURITY NOTE */}

                        <div className="issue-security-note">

                            <div className="security-note-icon">
                                🔐
                            </div>

                            <div>

                                <strong>
                                    Blockchain Security
                                </strong>

                                <p>
                                    A SHA-256 hash of the uploaded
                                    certificate will be generated.
                                    The hash and Certificate ID will
                                    then be recorded on the blockchain.
                                </p>

                            </div>

                        </div>


                        {/* SUBMIT */}

                        <button
                            type="submit"
                            className="primary-btn issue-submit"
                            disabled={loading}
                        >

                            {loading ? (

                                <>
                                    <span className="button-spinner"></span>
                                    Registering on Blockchain...
                                </>

                            ) : (

                                <>
                                    🔗 Issue & Register Certificate
                                </>

                            )}

                        </button>

                    </form>
                )}


                {/* SUCCESS DETAILS */}

                {result && (

                    <div className="issue-result">

                        <div className="result-summary">

                            <div>

                                <span>
                                    CERTIFICATE ID
                                </span>

                                <strong>
                                    {
                                        result.certificate_id ||
                                        formData.certificate_id
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    STATUS
                                </span>

                                <strong className="registered-status">
                                    REGISTERED
                                </strong>

                            </div>

                        </div>


                        {/* QR */}

                        {getQrUrl() && (

                            <div className="qr-section">

                                <div className="qr-content">

                                    <div>

                                        <div className="result-label">
                                            VERIFICATION QR CODE
                                        </div>

                                        <h3>
                                            Certificate QR
                                        </h3>

                                        <p>
                                            Scan this QR code to open
                                            the certificate verification
                                            page directly.
                                        </p>

                                        <button
                                            type="button"
                                            className="secondary-btn qr-download-btn"
                                            onClick={
                                                downloadQr
                                            }
                                        >
                                            ↓ Download QR Code
                                        </button>

                                    </div>


                                    <div className="qr-image-wrapper">

                                        <img
                                            src={getQrUrl()}
                                            alt="Certificate verification QR code"
                                            className="qr-image"
                                        />

                                    </div>

                                </div>

                            </div>
                        )}


                        {/* BLOCKCHAIN INFORMATION */}

                        <div className="blockchain-result">

                            <div className="result-label">
                                BLOCKCHAIN RECORD
                            </div>

                            <h3>
                                Registration Details
                            </h3>


                            <div className="result-grid">

                                <div className="result-item">

                                    <span>
                                        Certificate ID
                                    </span>

                                    <strong>
                                        {
                                            result.certificate_id ||
                                            formData.certificate_id
                                        }
                                    </strong>

                                </div>


                                <div className="result-item">

                                    <span>
                                        Transaction Hash
                                    </span>

                                    <strong className="result-hash">
                                        {
                                            result.transaction_hash ||
                                            result.blockchain_tx_hash ||
                                            "Available on blockchain"
                                        }
                                    </strong>

                                </div>


                                <div className="result-item">

                                    <span>
                                        Block Number
                                    </span>

                                    <strong>
                                        {
                                            result.block_number ??
                                            "Confirmed"
                                        }
                                    </strong>

                                </div>


                                <div className="result-item">

                                    <span>
                                        Contract Address
                                    </span>

                                    <strong className="result-hash">
                                        {
                                            result.contract_address ||
                                            "Configured blockchain contract"
                                        }
                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* ACTIONS */}

                        <div className="issue-actions">

                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={handleReset}
                            >
                                + Issue Another Certificate
                            </button>

                        </div>

                    </div>
                )}

            </div>

        </div>
    );
}


export default IssueCertificate;