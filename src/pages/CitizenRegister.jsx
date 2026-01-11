import { useState } from "react";
import Navbar from "../components/Navbar";
import apiClient from "../api/apiClient";

function CitizenRegister() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    wardId: ""
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    try {
      await apiClient.post("/api/citizens/register", {
        ...form,
        wardId: form.wardId ? Number(form.wardId) : null
      });
      alert("Citizen registered successfully");
    } catch (err) {
      alert(err.response?.data || "Registration failed");
    }
  };

  return (
    <>
      <Navbar />

      <div className="container page-container">
        <div className="page-header text-center">
          <h2>Citizen Registration</h2>
          <p className="text-muted">
            Pune Municipal Corporation · Citizen Onboarding
          </p>
        </div>

        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card form-card">
              <div className="card-body">
                <input className="form-control mb-3" name="name" placeholder="Full Name" onChange={handleChange} />
                <input className="form-control mb-3" name="email" placeholder="Email Address" onChange={handleChange} />
                <input className="form-control mb-3" name="mobile" placeholder="Mobile Number" onChange={handleChange} />
                <input className="form-control mb-3" type="password" name="password" placeholder="Password" onChange={handleChange} />
                <input className="form-control mb-4" name="wardId" placeholder="Ward ID (optional)" onChange={handleChange} />

                <button className="btn btn-primary w-100" onClick={submit}>
                  Register Citizen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CitizenRegister;
