import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User, Mail, Phone, Lock, Eye, EyeOff, Building2,
  MapPin, ShieldCheck, ArrowRight, Loader2, CheckCircle2,
  AlertTriangle, RefreshCw
} from 'lucide-react';
import apiService from "../api/apiService";
import { useMasterData } from "../contexts/MasterDataContext";

export default function CitizenRegistration() {
  const { wards, loading: masterLoading, error: masterError } = useMasterData();
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
  const navigate = useNavigate();

  // Effect to handle master data errors if any
  useEffect(() => {
    if (masterError) {
      console.error("Master Data Error:", masterError);
      // Optionally set a local error, but usually we just let the UI show empty/loading
    }
  }, [masterError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.wardNumber) {
      setError("Please select your Ward");
      return;
    }

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
        wardId: parseInt(formData.wardNumber)
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
      backgroundColor: '#F8FAFC',
      backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)',
      backgroundSize: '20px 20px',
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
        background: 'linear-gradient(to right, #244799, #4F46E5, #F59E0B)',
        zIndex: 1000
      }}></div>

      <div style={{ width: '100%', maxWidth: '1000px', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '4rem', alignItems: 'center' }}>

        {/* Left Side: Info & branding */}
        <div className="d-none d-lg-block">
          <div className="mb-5">
            <div className="d-inline-flex align-items-center justify-content-center p-3 rounded-4 bg-white shadow-sm mb-4">
              <Building2 size={32} color="#244799" />
            </div>
            <h1 className="fw-black text-dark mb-2" style={{ fontSize: '3rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Join the <span style={{ color: '#244799' }}>CivicConnect</span> Network
            </h1>
            <p className="text-muted fw-bold h5 lh-base opacity-75">
              Empowering citizens with direct access to municipal governance. Report, track, and resolve civic issues.
            </p>
          </div>

          <div className="d-flex flex-column gap-3">
            {[
              { icon: ShieldCheck, title: "Secure Identity", desc: "Verified citizen accounts protected by government standards." },
              { icon: MapPin, title: "Location Precision", desc: "Ward-specific reporting ensures your issues reach the right officer." },
              { icon: RefreshCw, title: "Real-time Updates", desc: "Track complaint status from submission to resolution." }
            ].map((item, idx) => (
              <div key={idx} className="d-flex align-items-center gap-3 p-3 rounded-4 bg-white bg-opacity-60 border border-white shadow-sm">
                <div className="rounded-circle p-2 bg-light text-primary flex-shrink-0">
                  <item.icon size={20} color="#244799" />
                </div>
                <div>
                  <div className="fw-bold text-dark small uppercase tracking-widest">{item.title}</div>
                  <div className="small text-muted">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="w-100">
          <div className="card border-0 shadow-premium rounded-5 overflow-hidden bg-white">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h2 className="fw-black text-dark mb-1">Create Account</h2>
                <p className="text-muted small fw-bold uppercase tracking-widest">Enter your details to register</p>
              </div>

              {error && (
                <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger fw-bold small rounded-3 d-flex align-items-center mb-4 animate-slideDown">
                  <AlertTriangle size={18} className="me-2" />
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success border-0 bg-success bg-opacity-10 text-success fw-bold small rounded-3 d-flex align-items-center mb-4 animate-slideDown">
                  <CheckCircle2 size={18} className="me-2" />
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Name */}
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted uppercase tracking-widest">Full Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0 ps-3"><User size={18} className="text-primary" /></span>
                    <input
                      type="text"
                      className="form-control bg-light border-0 fw-bold py-3 shadow-none text-dark"
                      placeholder="Your Legal Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Email & Mobile Grid */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted uppercase tracking-widest">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0 ps-3"><Mail size={18} className="text-primary" /></span>
                      <input
                        type="email"
                        className="form-control bg-light border-0 fw-bold py-3 shadow-none text-dark"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted uppercase tracking-widest">Mobile Number</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0 ps-3"><Phone size={18} className="text-primary" /></span>
                      <input
                        type="tel"
                        className="form-control bg-light border-0 fw-bold py-3 shadow-none text-dark"
                        placeholder="10-digit Mobile"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        required
                        maxLength="10"
                      />
                    </div>
                  </div>
                </div>

                {/* Ward Selection - MANDATORY */}
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted uppercase tracking-widest">
                    Residence Ward <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0 ps-3">
                      {masterLoading ? <Loader2 size={18} className="animate-spin text-primary" /> : <MapPin size={18} className="text-primary" />}
                    </span>
                    <select
                      className="form-select bg-light border-0 fw-bold py-3 shadow-none cursor-pointer text-dark"
                      value={formData.wardNumber}
                      onChange={(e) => setFormData({ ...formData, wardNumber: e.target.value })}
                      required
                      disabled={masterLoading || masterError}
                    >
                      <option value="">{masterLoading ? "Loading Wards..." : "Select Your Ward Area"}</option>
                      {wards.map(ward => (
                        <option key={ward.wardId || ward.id} value={ward.wardId || ward.id}>
                          Ward {ward.wardNumber || ward.number || (ward.wardId || ward.id)} - {ward.areaName || ward.wardName}
                        </option>
                      ))}
                    </select>
                  </div>
                  {masterError && (
                    <div className="form-text text-danger small">
                      <AlertTriangle size={12} className="me-1" />
                      Unable to load wards. Please refresh or contact support.
                    </div>
                  )}
                </div>

                {/* Password Grid */}
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted uppercase tracking-widest">Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0 ps-3"><Lock size={18} className="text-primary" /></span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control bg-light border-0 fw-bold py-3 shadow-none text-dark"
                        placeholder="Create Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                      <button type="button" className="btn bg-light border-0" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={18} className="text-primary" /> : <Eye size={18} className="text-primary" />}
                      </button>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted uppercase tracking-widest">Confirm</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0 ps-3"><Lock size={18} className="text-primary" /></span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className="form-control bg-light border-0 fw-bold py-3 shadow-none text-dark"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-3 rounded-pill fw-black uppercase tracking-widest shadow-lg hover-up transition-all d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
                  style={{ background: '#244799', borderColor: '#244799' }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account <ArrowRight size={20} />
                    </>
                  )}
                </button>

                <div className="text-center mt-4 pt-3 border-top">
                  <p className="small text-muted mb-0">
                    Already have an account?{" "}
                    <Link to="/" className="text-decoration-none fw-black" style={{ color: '#244799' }}>
                      LOGIN HERE
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-4">
            <p className="small text-muted opacity-50 fw-bold uppercase tracking-widest mb-0">© 2026 CivicConnect • Government of India</p>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
            .animate-slideDown { animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
            @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            .animate-spin { animation: spin 1s linear infinite; }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            .shadow-premium { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
            .hover-up:hover { transform: translateY(-4px); box-shadow: 0 25px 30px -5px rgba(0, 0, 0, 0.15); }
            .transition-all { transition: all 0.3s ease; }
            .cursor-pointer { cursor: pointer; }
        `
      }} />
    </div>
  );
}
