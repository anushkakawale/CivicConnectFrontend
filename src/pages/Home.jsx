import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Home() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Use unified authentication endpoint
      // FIXED: Path was /api/api/auth/login due to baseURL already having /api
      const response = await api.post("/auth/login", formData);

      if (response && response.data) {
        // Current backend returns: { token, role }
        const { token, role } = response.data;

        // Store authentication data
        localStorage.setItem("token", token);
        localStorage.setItem("email", formData.email);
        localStorage.setItem("role", role); // FIXED: Match axios.js expected key

        // Determine redirect based on role
        let redirectPath = "/";
        switch (role) {
          case "CITIZEN":
            redirectPath = "/citizen";
            break;
          case "ADMIN":
            redirectPath = "/admin";
            break;
          case "WARD_OFFICER":
            redirectPath = "/ward-officer";
            break;
          case "DEPARTMENT_OFFICER":
            redirectPath = "/department-officer";
            break;
          default:
            redirectPath = "/";
        }

        // Redirect to appropriate dashboard
        navigate(redirectPath);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--gov-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      {/* Government Header Strip */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(to right, var(--gov-primary), var(--gov-secondary), var(--gov-accent))',
        zIndex: 1000
      }}></div>

      <div style={{ width: '100%', maxWidth: '450px' }}>
        {/* Logo and Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 1rem',
            backgroundColor: 'var(--gov-primary)',
            borderRadius: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <i className="bi bi-building" style={{ fontSize: '2.5rem', color: 'white' }}></i>
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--gov-primary)' }}>
            CivicConnect
          </h1>
          <p style={{ color: 'var(--gov-text-light)', marginBottom: 0 }}>
            Municipal Governance Portal
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--gov-text-muted)', marginTop: '0.25rem' }}>
            Government of India
          </p>
        </div>

        {/* Login Card */}
        <div className="gov-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
            Unified Login Portal
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--gov-text-light)', marginBottom: '2rem', fontSize: '0.875rem' }}>
            Login with your credentials - all roles supported
          </p>

          {error && (
            <div className="gov-alert gov-alert-danger" style={{ marginBottom: '1.5rem' }}>
              <i className="bi bi-exclamation-triangle me-2"></i>
              <strong>{error}</strong>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="gov-form-group">
              <label className="gov-label">
                <i className="bi bi-envelope me-2"></i>
                Email Address
              </label>
              <input
                type="email"
                className="gov-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="gov-form-group">
              <label className="gov-label">
                <i className="bi bi-lock me-2"></i>
                Password
              </label>
              <input
                type="password"
                className="gov-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className="gov-btn gov-btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Authenticating...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Login
                </>
              )}
            </button>
          </form>

          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--gov-border)'
          }}>
            {/* Supported Roles Info */}
            <div className="gov-alert gov-alert-info" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
              <strong>Supported Roles:</strong>
              <ul style={{ marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.25rem' }}>
                <li>Citizen</li>
                <li>Admin</li>
                <li>Ward Officer</li>
                <li>Department Officer</li>
              </ul>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--gov-text-light)', marginBottom: 0, textAlign: 'center' }}>
              New citizen?{" "}
              <Link to="/citizen-register" style={{ color: 'var(--gov-primary)', fontWeight: 600, textDecoration: 'none' }}>
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* Information Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginTop: '2rem'
        }}>
          <div className="gov-card" style={{ padding: '1rem', textAlign: 'center' }}>
            <i className="bi bi-shield-check" style={{ fontSize: '2rem', color: 'var(--gov-secondary)' }}></i>
            <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: 0, fontWeight: 600 }}>Secure</p>
          </div>
          <div className="gov-card" style={{ padding: '1rem', textAlign: 'center' }}>
            <i className="bi bi-clock-history" style={{ fontSize: '2rem', color: 'var(--gov-primary)' }}></i>
            <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: 0, fontWeight: 600 }}>24/7 Access</p>
          </div>
          <div className="gov-card" style={{ padding: '1rem', textAlign: 'center' }}>
            <i className="bi bi-people" style={{ fontSize: '2rem', color: 'var(--gov-accent)' }}></i>
            <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: 0, fontWeight: 600 }}>All Roles</p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--gov-text-muted)', fontSize: '0.75rem' }}>
          <p style={{ marginBottom: '0.25rem' }}>© 2026 CivicConnect - Municipal Governance Portal</p>
          <p style={{ marginBottom: 0 }}>Government of India</p>
        </div>
      </div>
    </div>
  );
}
