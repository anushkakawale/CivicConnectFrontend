import { useState } from "react";
import Navbar from "../components/Navbar";
import apiClient from "../api/apiClient";

function WardOfficerRegister() {
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
      await apiClient.post("/api/admin/register/ward-officer", {
        ...form,
        wardId: Number(form.wardId)
      });
      alert("Ward Officer registered successfully");
    } catch (err) {
      alert(err.response?.data || "Registration failed");
    }
  };

  return (
    <>
      <Navbar />

      <div className="container page-container">
        <div className="page-header text-center">
          <h2>Ward Officer Registration</h2>
          <p className="text-muted">
            Admin Panel · PMC Governance
          </p>
        </div>

        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card form-card">
              <div className="card-body">
                <input className="form-control mb-3" name="name" placeholder="Officer Name" onChange={handleChange} />
                <input className="form-control mb-3" name="email" placeholder="Official Email" onChange={handleChange} />
                <input className="form-control mb-3" name="mobile" placeholder="Mobile Number" onChange={handleChange} />
                <input className="form-control mb-3" type="password" name="password" placeholder="Temporary Password" onChange={handleChange} />
                <input className="form-control mb-4" name="wardId" placeholder="Ward ID" onChange={handleChange} />

                <button className="btn btn-primary w-100" onClick={submit}>
                  Create Ward Officer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default WardOfficerRegister;
