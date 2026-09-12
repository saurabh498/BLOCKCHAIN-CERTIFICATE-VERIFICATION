import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL ||
    "http://127.0.0.1:8000";

function AdminLogin() {
    const navigate = useNavigate();

    const [username, setUsername] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                `${BACKEND_URL}/admin/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    "Invalid username or password."
                );
            }

            sessionStorage.setItem(
                "adminAuthenticated",
                "true"
            );

            sessionStorage.setItem(
                "adminToken",
                data.access_token
            );

            navigate("/admin/dashboard");

        } catch (error) {
            setError(
                error.message ||
                "Unable to connect to the server."
            );
        } finally {
            setLoading(false);
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
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default AdminLogin;