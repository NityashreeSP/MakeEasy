import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
    const [token, setToken] = useState(
        localStorage.getItem("token")
    );

    useEffect(() => {
        // Update navbar when login/logout happens
        const handleAuthChange = () => {
            setToken(
                localStorage.getItem("token")
            );
        };

        window.addEventListener(
            "authChange",
            handleAuthChange
        );

        window.addEventListener(
            "storage",
            handleAuthChange
        );

        return () => {
            window.removeEventListener(
                "authChange",
                handleAuthChange
            );

            window.removeEventListener(
                "storage",
                handleAuthChange
            );
        };
    }, []);

    return (
        <nav className="navbar">

            {/* =========================
                LOGO
            ========================= */}
            <div className="navbar-brand">
                <Link
                    to="/"
                    className="navbar-logo-link"
                >
                    <h2 className="navbar-logo">
                        MAKE EASY
                    </h2>
                </Link>
            </div>


            {/* =========================
                NAVIGATION
            ========================= */}
            <div className="navbar-links">

                <Link
                    to="/"
                    className="nav-link"
                >
                    Home
                </Link>


                {/* =====================
                    LOGGED IN USER
                ===================== */}
                {token ? (
                    <>
                        <span className="nav-divider">
                            |
                        </span>

                        <Link
                            to="/dashboard"
                            className="nav-link"
                        >
                            Dashboard
                        </Link>

                        <span className="nav-divider">
                            |
                        </span>

                        <Link
                            to="/saved"
                            className="nav-link nav-link-special"
                        >
                            ❤️ Saved Places
                        </Link>

                        <span className="nav-divider">
                            |
                        </span>

                        <Link
                            to="/my-trips"
                            className="nav-link nav-link-special"
                        >
                            🧳 My Trips
                        </Link>
                    </>
                ) : (
                    <>
                        {/* =====================
                            NOT LOGGED IN
                        ===================== */}

                        <span className="nav-divider">
                            |
                        </span>

                        <Link
                            to="/login"
                            className="nav-link nav-link-btn"
                        >
                            Login
                        </Link>

                        <span className="nav-divider">
                            |
                        </span>

                        <Link
                            to="/register"
                            className="nav-link nav-link-primary"
                        >
                            Register
                        </Link>
                    </>
                )}

            </div>
        </nav>
    );
}

export default Navbar;