import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match. Please check again.");
      return;
    }

    try {
      setLoading(true);

      const response = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      setSuccessMsg(response.message || "Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      setErrorMsg(
        error.response?.data?.message || "Registration failed. Please try again."
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
        <div className="brand" onClick={() => navigate("/")}>
          <span className="brand-icon">🌐</span>
          <span className="brand-name">WanderPulse</span>
        </div>
        <div className="nav-actions">
          <button 
            className="nav-btn btn-text" 
            onClick={() => navigate("/login")}
          >
            Already have an account? Sign In
          </button>
        </div>
      </header>

      {/* REGISTRATION CONTAINER */}
      <main className="auth-container">
        <div className="auth-card">
          <div className="auth-tabs">
            <button className="tab-btn" onClick={() => navigate("/login")}>
              Sign In
            </button>
            <button className="tab-btn active">
              Register
            </button>
          </div>

          <div className="auth-body">
            <h2>Create Account</h2>
            <p className="auth-subtitle">Sign up to start crafting personalized itineraries</p>

            {errorMsg && <div className="error-alert">{errorMsg}</div>}
            {successMsg && <div className="success-alert">{successMsg}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
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

              <div className="input-field">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account →"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Register;