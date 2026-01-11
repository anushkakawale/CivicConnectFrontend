import Navbar from "../components/Navbar";

function Dashboard() {
  return (
    <>
      <Navbar />

      <div className="container page-container">
        <div className="page-header">
          <h2>PMC Dashboard</h2>
          <p className="text-muted">
            Civic Connect · Administrative Overview
          </p>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="card stat-card">
              <h4>Citizens</h4>
              <p className="text-muted">Registered Users</p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card stat-card">
              <h4>Ward Officers</h4>
              <p className="text-muted">Active Officers</p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card stat-card">
              <h4>Departments</h4>
              <p className="text-muted">Operational Units</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
