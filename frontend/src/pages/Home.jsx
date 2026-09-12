import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="home-page">

            {/* ================================
                HERO SECTION
            ================================= */}

            <section className="hero">

                <div className="hero-content">

                    <div className="tagline">
                        BLOCKCHAIN-POWERED CERTIFICATE VERIFICATION
                    </div>

                    <h1>
                        Verify certificates with
                        <span> trust and confidence.</span>
                    </h1>

                    <p className="description">
                        CertChain is a blockchain-based certificate
                        verification system that helps institutions
                        issue, secure, and verify digital certificates
                        while protecting them against tampering and
                        unauthorized modification.
                    </p>

                    <div className="buttons">

                        <Link
                            to="/verify"
                            className="primary-btn home-btn"
                        >
                            Verify Certificate
                        </Link>

                        <Link
                            to="/issue"
                            className="secondary-btn home-btn"
                        >
                            Issue Certificate
                        </Link>

                    </div>

                </div>


                <div className="hero-card">

                    <div className="shield">
                        ✓
                    </div>

                    <h2>
                        Blockchain Secured
                    </h2>

                    <p>
                        Certificate hashes are securely recorded
                        on the blockchain for reliable verification.
                    </p>

                    <div className="status">
                        <span></span>
                        Verification System Active
                    </div>

                </div>

            </section>


            {/* ================================
                FEATURES
            ================================= */}

            <section className="features-section">

                <div className="section-heading">

                    <span>
                        WHY CERTCHAIN
                    </span>

                    <h2>
                        Secure certificates.
                        <br />
                        Simple verification.
                    </h2>

                    <p>
                        A complete digital certificate verification
                        workflow designed to detect tampering and
                        provide trustworthy verification results.
                    </p>

                </div>


                <div className="features">

                    <div className="feature-card">

                        <div className="feature-icon">
                            🔐
                        </div>

                        <h3>
                            Blockchain Security
                        </h3>

                        <p>
                            Certificate hashes are stored on the
                            blockchain, creating a tamper-resistant
                            verification record.
                        </p>

                    </div>


                    <div className="feature-card">

                        <div className="feature-icon">
                            🛡️
                        </div>

                        <h3>
                            Tamper Detection
                        </h3>

                        <p>
                            SHA-256 hashing detects even small changes
                            made to a certificate after issuance.
                        </p>

                    </div>


                    <div className="feature-card">

                        <div className="feature-icon">
                            📱
                        </div>

                        <h3>
                            QR Verification
                        </h3>

                        <p>
                            Scan a certificate QR code to quickly open
                            its verification page and check authenticity.
                        </p>

                    </div>


                    <div className="feature-card">

                        <div className="feature-icon">
                            ⚡
                        </div>

                        <h3>
                            Fast Verification
                        </h3>

                        <p>
                            Upload a certificate and receive a clear
                            verification result within seconds.
                        </p>

                    </div>


                    <div className="feature-card">

                        <div className="feature-icon">
                            ⛓️
                        </div>

                        <h3>
                            Immutable Records
                        </h3>

                        <p>
                            Blockchain records provide a reliable
                            source of truth for certificate verification.
                        </p>

                    </div>


                    <div className="feature-card">

                        <div className="feature-icon">
                            🚫
                        </div>

                        <h3>
                            Revocation Support
                        </h3>

                        <p>
                            Authorized administrators can revoke
                            certificates when they are no longer valid.
                        </p>

                    </div>

                </div>

            </section>


            {/* ================================
                HOW IT WORKS
            ================================= */}

            <section className="how-section">

                <div className="section-heading">

                    <span>
                        HOW IT WORKS
                    </span>

                    <h2>
                        From issuance to verification.
                    </h2>

                    <p>
                        CertChain connects certificate issuance,
                        cryptographic hashing, blockchain storage,
                        and verification into one workflow.
                    </p>

                </div>


                <div className="steps">

                    <div className="step">

                        <div className="step-number">
                            01
                        </div>

                        <h3>
                            Issue Certificate
                        </h3>

                        <p>
                            The institution enters certificate
                            information and uploads the original
                            certificate PDF.
                        </p>

                    </div>


                    <div className="step">

                        <div className="step-number">
                            02
                        </div>

                        <h3>
                            Generate Hash
                        </h3>

                        <p>
                            The system calculates a unique SHA-256
                            hash from the certificate PDF.
                        </p>

                    </div>


                    <div className="step">

                        <div className="step-number">
                            03
                        </div>

                        <h3>
                            Store on Blockchain
                        </h3>

                        <p>
                            The certificate ID and hash are recorded
                            on the blockchain as a trusted reference.
                        </p>

                    </div>


                    <div className="step">

                        <div className="step-number">
                            04
                        </div>

                        <h3>
                            Verify Certificate
                        </h3>

                        <p>
                            The uploaded certificate hash is compared
                            with the blockchain record to determine
                            its authenticity.
                        </p>

                    </div>

                </div>

            </section>


            {/* ================================
                VERIFICATION STATES
            ================================= */}

            <section className="verification-states">

                <div className="section-heading">

                    <span>
                        VERIFICATION RESULTS
                    </span>

                    <h2>
                        Clear results. No confusion.
                    </h2>

                    <p>
                        Every verification ends with a clear status
                        based on the certificate hash and blockchain
                        revocation state.
                    </p>

                </div>


                <div className="states-grid">

                    <div className="state-card valid-state">

                        <div className="state-icon">
                            ✓
                        </div>

                        <h3>
                            VALID
                        </h3>

                        <p>
                            The uploaded certificate hash matches
                            the blockchain record and the certificate
                            has not been revoked.
                        </p>

                    </div>


                    <div className="state-card invalid-state">

                        <div className="state-icon">
                            ✕
                        </div>

                        <h3>
                            INVALID
                        </h3>

                        <p>
                            The uploaded certificate does not match
                            the original certificate hash stored on
                            the blockchain.
                        </p>

                    </div>


                    <div className="state-card revoked-state">

                        <div className="state-icon">
                            !
                        </div>

                        <h3>
                            REVOKED
                        </h3>

                        <p>
                            The certificate matches its original
                            record but has been revoked by the
                            authorized issuer.
                        </p>

                    </div>

                </div>

            </section>


            {/* ================================
                CTA
            ================================= */}

            <section className="cta-section">

                <div className="cta-content">

                    <div className="cta-icon">
                        🔗
                    </div>

                    <h2>
                        Ready to verify a certificate?
                    </h2>

                    <p>
                        Check the authenticity of a certificate
                        using its Certificate ID and original PDF.
                    </p>

                    <Link
                        to="/verify"
                        className="primary-btn home-btn"
                    >
                        Verify Certificate
                    </Link>

                </div>

            </section>


            {/* ================================
                FOOTER
            ================================= */}

            <footer className="home-footer">

                <div>
                    <strong>
                        CertChain
                    </strong>

                    <span>
                        Blockchain-Based Certificate
                        Verification System
                    </span>
                </div>

                <div>
                    © 2026 CertChain
                </div>

            </footer>

        </div>
    );
}

export default Home;