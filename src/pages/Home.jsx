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
      backgroundColor: 'var(--bg-deep)',
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
        background: 'linear-gradient(to right, var(--primary), var(--primary-light), var(--warning))',
        zIndex: 1000
      }}></div>

      <div style={{ width: '100%', maxWidth: '450px' }}>
        {/* Logo and Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 1rem',
            backgroundColor: 'white',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-premium)'
          }}>
            <i className="bi bi-building" style={{ fontSize: '2.5rem', color: 'var(--primary)' }}></i>
          </div>
          <h1 className="fw-black" style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
            CivicConnect
          </h1>
          <p className="text-muted fw-bold uppercase tracking-widest" style={{ fontSize: '0.75rem', marginBottom: 0 }}>
            Municipal Governance Portal
          </p>
          <p className="text-light fw-bold uppercase tracking-widest" style={{ fontSize: '0.65rem', marginTop: '0.25rem' }}>
            Government of India
          </p>
        </div>

        {/* Login Card */}
        <div className="card border-0 shadow-premium rounded-4 p-4 p-lg-5 bg-white">
          <h2 className="fw-black text-center mb-2" style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>
            Unified Login Portal
          </h2>
          <p className="text-center text-muted mb-4 extra-small fw-bold uppercase tracking-widest">
            Secure Access • All Roles Supported
          </p>

          {error && (
            <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger fw-bold extra-small rounded-3 d-flex align-items-center mb-4">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label extra-small fw-black text-muted uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0"><i className="bi bi-envelope text-muted"></i></span>
                <input
                  type="email"
                  className="form-control border-0 bg-light fw-bold shadow-none py-3"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label extra-small fw-black text-muted uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0"><i className="bi bi-lock text-muted"></i></span>
                <input
                  type="password"
                  className="form-control border-0 bg-light fw-bold shadow-none py-3"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 rounded-pill py-3 fw-black extra-small uppercase tracking-widest shadow-lg hover-up-small"
              disabled={loading}
              style={{ background: 'var(--primary)', borderColor: 'var(--primary)' }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Authenticating...
                </>
              ) : (
                <>
                  Enter Secure Portal <i className="bi bi-arrow-right ms-2"></i>
                </>
              )}
            </button>
          </form>

          <div style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #F1F5F9'
          }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0, textAlign: 'center' }}>
              New citizen?{" "}
              <Link to="/citizen-register" style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'none' }}>
                REGISTER ACCOUNT
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
          <div className="card border-0 shadow-sm rounded-4 p-3 text-center bg-white hover-up-small">
            <i className="bi bi-shield-check mb-2" style={{ fontSize: '1.5rem', color: 'var(--success)' }}></i>
            <p className="extra-small fw-black text-muted uppercase tracking-widest mb-0">Secure</p>
          </div>
          <div className="card border-0 shadow-sm rounded-4 p-3 text-center bg-white hover-up-small">
            <i className="bi bi-clock-history mb-2" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}></i>
            <p className="extra-small fw-black text-muted uppercase tracking-widest mb-0">24/7 Live</p>
          </div>
          <div className="card border-0 shadow-sm rounded-4 p-3 text-center bg-white hover-up-small">
            <i className="bi bi-people mb-2" style={{ fontSize: '1.5rem', color: 'var(--info)' }}></i>
            <p className="extra-small fw-black text-muted uppercase tracking-widest mb-0">Unified</p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-light)', fontSize: '0.65rem' }}>
          <p className="fw-bold uppercase tracking-widest mb-1">© 2026 CivicConnect • Municipal Governance Portal</p>
          <p className="fw-bold uppercase tracking-widest opacity-50 mb-0">Government of India</p>
        </div>
      </div>
    </div>
  );
}
