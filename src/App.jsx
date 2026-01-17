import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";

// Public pages
import Home from "./pages/Home";
import CitizenRegistration from "./pages/CitizenRegistration";
import WardOfficerRegistration from "./pages/WardOfficerRegistration";
import DepartmentOfficerRegistration from "./pages/DepartmentOfficerRegistration";

// Citizen pages
import CitizenDashboard from "./pages/CitizenDashboard";
import RegisterComplaint from "./pages/RegisterComplaint";
import MyComplaints from "./pages/MyComplaints";
import TrackComplaint from "./pages/TrackComplaint";

export default function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        {/* PUBLIC / REGISTRATION */}
        <Route path="/" element={<Home />} />
        <Route path="/citizen-register" element={<CitizenRegistration />} />
        <Route path="/ward-officer-register" element={<WardOfficerRegistration />} />
        <Route path="/department-officer-register" element={<DepartmentOfficerRegistration />} />

        {/* CITIZEN MODULE */}
        <Route path="/citizen" element={<CitizenDashboard />} />
        <Route path="/citizen/complaints/new" element={<RegisterComplaint />} />
        <Route path="/citizen/complaints" element={<MyComplaints />} />
        <Route
          path="/citizen/complaints/:citizenUserId/:complaintId"
          element={<TrackComplaint />}
        />
      </Routes>
    </BrowserRouter>
  );
}
