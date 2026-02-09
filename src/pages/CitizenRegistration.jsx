import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiService from "../api/apiService";

export default function CitizenRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    wardNumber: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [wards, setWards] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWards();
  }, []);

  const fetchWards = async () => {
    try {
      const response = await apiService.masterData.getWards();
      setWards(response.data || response || []);
    } catch (err) {
      console.error("Failed to fetch wards:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.mobile)) {
      setError("Mobile number must be 10 digits");
      return;
    }

    setLoading(true);

    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        wardId: formData.wardNumber ? parseInt(formData.wardNumber) : null
      };

      const response = await apiService.auth.register(registrationData);

      // Current backend returns: { userId, name, message }
      if (response.data) {
        setSuccess(
          response.data.message ||
          "Registration successful! Redirecting to login..."
        );

        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (err) {
      // Handle error response from backend
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed. Please try again.";
      setError(errorMessage);
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

      <div style={{ width: '100%', maxWidth: '600px' }}>
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
            Citizen Registration Portal
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--gov-text-muted)', marginTop: '0.25rem' }}>
            Government of India
          </p>
        </div>

        {/* Registration Card */}
        <div className="gov-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
            Create Citizen Account
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--gov-text-light)', marginBottom: '2rem', fontSize: '0.875rem' }}>
            Register to submit and track complaints
          </p>

          {error && (
            <div className="gov-alert gov-alert-danger" style={{ marginBottom: '1.5rem' }}>
              <i className="bi bi-exclamation-triangle me-2"></i>
              <strong>{error}</strong>
            </div>
          )}

          {success && (
            <div className="gov-alert gov-alert-success" style={{ marginBottom: '1.5rem' }}>
              <i className="bi bi-check-circle me-2"></i>
              <strong>{success}</strong>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="gov-form-group">
              <label className="gov-label">
                <i className="bi bi-person me-2"></i>
                Full Name
              </label>
              <input
                type="text"
                className="gov-input"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* Email */}
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

            {/* Mobile Number */}
            <div className="gov-form-group">
              <label className="gov-label">
                <i className="bi bi-phone me-2"></i>
                Mobile Number
              </label>
              <input
                type="tel"
                className="gov-input"
                placeholder="Enter 10-digit mobile number"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                required
                maxLength="10"
              />
            </div>

            {/* Ward Number (Optional) */}
            <div className="gov-form-group">
              <label className="gov-label">
                <i className="bi bi-geo-alt me-2"></i>
                Ward Number <span style={{ color: 'var(--gov-text-muted)', fontWeight: 'normal' }}>(Optional)</span>
              </label>
              <select
                className="gov-select"
                value={formData.wardNumber}
                onChange={(e) => setFormData({ ...formData, wardNumber: e.target.value })}
              >
                <option value="">Select your ward (optional)</option>
                {wards.map(ward => (
                  <option key={ward.wardId} value={ward.wardId}>
                    Ward {ward.wardNumber || ward.number} - {ward.areaName || ward.wardName}
                  </option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div className="gov-form-group">
              <label className="gov-label">
                <i className="bi bi-lock me-2"></i>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="gov-input"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--gov-text-light)',
                    padding: '0.25rem'
                  }}
                >
                  <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="gov-form-group">
              <label className="gov-label">
                <i className="bi bi-lock me-2"></i>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="gov-input"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--gov-text-light)',
                    padding: '0.25rem'
                  }}
                >
                  <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="gov-alert gov-alert-info" style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <strong>Password Requirements:</strong>
              <ul style={{ marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.25rem' }}>
                <li>At least 6 characters long</li>
                <li>Contains uppercase and lowercase letters</li>
                <li>Contains at least one number</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="gov-btn gov-btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus me-2"></i>
                  Create Account
                </>
              )}
            </button>
          </form>

          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--gov-border)',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--gov-text-light)', marginBottom: 0 }}>
              Already have an account?{" "}
              <Link to="/" style={{ color: 'var(--gov-primary)', fontWeight: 600, textDecoration: 'none' }}>
                Login here
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
            <i className="bi bi-lightning-charge" style={{ fontSize: '2rem', color: 'var(--gov-primary)' }}></i>
            <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: 0, fontWeight: 600 }}>Quick Setup</p>
          </div>
          <div className="gov-card" style={{ padding: '1rem', textAlign: 'center' }}>
            <i className="bi bi-check-circle" style={{ fontSize: '2rem', color: 'var(--gov-accent)' }}></i>
            <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: 0, fontWeight: 600 }}>Verified</p>
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
