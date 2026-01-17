import "../styles/gov.css";

export default function CitizenDashboard() {
  return (
    <div className="home">
      <h2>Citizen Dashboard</h2>
      <div className="tiles">
        <a href="/citizen/complaints/new">Register Complaint</a>
        <a href="/citizen/complaints">My Complaints</a>
      </div>
    </div>
  );
}
