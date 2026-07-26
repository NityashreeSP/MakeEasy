import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  // Mode: "landing" (intro) or "auth" (login/register)
  const [viewMode, setViewMode] = useState("landing");
  const [authTab, setAuthTab] = useState("login"); // 'login' or 'register'
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (authTab === "login") {
        const response = await loginUser({
          email: formData.email,
          password: formData.password,
        });

        // Save JWT & User payload
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        window.dispatchEvent(
    new Event("authChange")
);

        navigate("/dashboard");
      } else {
        // Register action - redirect user to login or execute register service call
        alert("Registration successful! Please sign in.");
        setAuthTab("login");
      }
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message || "Authentication failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-wrapper">
      <div className="bg-overlay"></div>

      {/* NAVBAR */}
      <header className="portal-navbar">
        <div className="brand" onClick={() => setViewMode("landing")}>
          
        </div>
        <div className="nav-actions">
          {viewMode === "landing" ? (
            <>
              <button 
                className="nav-btn btn-text" 
                onClick={() => { setAuthTab("login"); setViewMode("auth"); }}
              >
                Sign In
              </button>
              <button 
                className="nav-btn btn-primary" 
                onClick={() => { setAuthTab("register"); setViewMode("auth"); }}
              >
                Get Started
              </button>
            </>
          ) : (
            <button 
              className="nav-btn btn-text" 
              onClick={() => setViewMode("landing")}
            >
              ← Back to Home
            </button>
          )}
        </div>
      </header>

      {/* VIEW MODE 1: HERO LANDING PAGE */}
      {viewMode === "landing" && (
        <main className="hero-container">
          <div className="hero-content">
            <span className="hero-badge">✨ Your Travel Companion</span>
            <h1 className="hero-title">
              Plan Dream Trips in <span className="highlight-text">Seconds</span>
            </h1>
            <p className="hero-description">
              Discover curated day-wise itineraries, real-time budget breakdowns, weather alerts, 
              and destination mapping—all powered by intelligent travel insights.
            </p>

            <div className="hero-cta-group">
              <button 
                className="cta-main" 
                onClick={() => { setAuthTab("register"); setViewMode("auth"); }}
              >
                Start Planning Free
              </button>
              <button 
                className="cta-secondary" 
                onClick={() => { setAuthTab("login"); setViewMode("auth"); }}
              >
                Explore Saved Trips
              </button>
            </div>

            {/* PLATFORM FEATURES */}
            <div className="features-grid">
              <div className="feature-card">
                <span className="feature-icon">📍</span>
                <h3>Smart Itineraries</h3>
                <p>Custom daily schedules tailored to your pace and budget level.</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">💰</span>
                <h3>Budget Tracking</h3>
                <p>Instant breakdowns for stay, transport, food, and activities.</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">❤️</span>
                <h3>Saved Destinations</h3>
                <p>Keep your favorite places synced with interactive Google Maps access.</p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* VIEW MODE 2: AUTH CARD (LOGIN / REGISTER) */}
      {viewMode === "auth" && (
        <main className="auth-container">
          <div className="auth-card">
            {/* TABS HEADER */}
            <div className="auth-tabs">
              <button
                className={`tab-btn ${authTab === "login" ? "active" : ""}`}
                onClick={() => { setAuthTab("login"); setErrorMsg(""); }}
              >
                Sign In
              </button>
              
            </div>

            <div className="auth-body">
              <h2>{authTab === "login" ? "Welcome Back" : "Create Account"}</h2>
              <p className="auth-subtitle">
                {authTab === "login"
                  ? "Enter your credentials to access your trips"
                  : "Sign up to start crafting personalized itineraries"}
              </p>

              {errorMsg && <div className="error-alert">{errorMsg}</div>}

              <form onSubmit={handleAuthSubmit} className="auth-form">
                {authTab === "register" && (
                  <div className="input-field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}

                <div className="input-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-field">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? (
                    "Processing..."
                  ) : authTab === "login" ? (
                    "Sign In to Dashboard →"
                  ) : (
                    "Create Account →"
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default Login;