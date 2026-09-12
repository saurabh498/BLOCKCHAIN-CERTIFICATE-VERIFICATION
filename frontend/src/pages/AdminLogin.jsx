import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
    const navigate = useNavigate();

    const [username, setUsername] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState("");

    const handleSubmit = (event) => {
        event.preventDefault();

        setError("");

        /*
         * Demo authentication
         *
         * These credentials are for the
         * college project demonstration.
         */

        if (
            username === "admin" &&
            password === "admin123"
        ) {
            sessionStorage.setItem(
                "adminAuthenticated",
                "true"
            );

            navigate("/admin/dashboard");
        } else {
            setError(
                "Invalid username or password."
            );
        }
    };

    return (
        <div className="page-container">

            <div className="form-card admin-login">

                <div className="admin-login-header">

                    <div className="admin-icon">
                        🔐
                    </div>

                    <h1>
                        Admin Login
                    </h1>

                    <p className="form-description">
                        Authorized access for certificate
                        management.
                    </p>

                </div>

                {error && (
                    <div className="admin-error">
                        ✕ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <label>
                        Username
                    </label>

                    <input
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={(event) =>
                            setUsername(
                                event.target.value
                            )
                        }
                        required
                    />

                    <label>
                        Password
                    </label>

                    <input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(event) =>
                            setPassword(
                                event.target.value
                            )
                        }
                        required
                    />

                    <button
                        type="submit"
                        className="primary-btn"
                    >
                        Login
                    </button>

                </form>

            </div>

        </div>
    );
}

export default AdminLogin;
