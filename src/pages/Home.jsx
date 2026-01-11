import Navbar from "../components/Navbar";

function Home() {
  return (
    <>
      <Navbar />

      <div className="container">
        <div
          className="row justify-content-center align-items-center"
          style={{ minHeight: "85vh" }}
        >
          {/* HERO SECTION */}
          <div className="col-12 text-center mb-5">
            <h1 className="fw-bold civic-title">
              Welcome to Civic Connect
            </h1>
            <p className="text-muted civic-subtitle">
              Pune Municipal Corporation · Smart City Governance Portal
            </p>
          </div>

          {/* CARDS SECTION */}
          <div className="col-12">
            <div className="row justify-content-center g-4">

              {/* Citizen */}
              <div className="col-12 col-md-4">
                <div className="card civic-card h-100">
                  <div className="card-body text-center">
                    <div className="civic-icon">👤</div>
                    <h5 className="fw-semibold mt-3">Citizen</h5>
                    <p className="text-muted small">
                      Register to raise and track civic complaints
                    </p>
                    <a href="/citizen" className="btn btn-primary w-100 mt-3">
                      Register Citizen
                    </a>
                  </div>
                </div>
              </div>

              {/* Ward Officer */}
              <div className="col-12 col-md-4">
                <div className="card civic-card h-100">
                  <div className="card-body text-center">
                    <div className="civic-icon">🏢</div>
                    <h5 className="fw-semibold mt-3">Ward Officer</h5>
                    <p className="text-muted small">
                      Admin creates ward-level officers
                    </p>
                    <a
                      href="/admin/ward-officer"
                      className="btn btn-primary w-100 mt-3"
                    >
                      Register Ward Officer
                    </a>
                  </div>
                </div>
              </div>

              {/* Department Officer */}
              <div className="col-12 col-md-4">
                <div className="card civic-card h-100">
                  <div className="card-body text-center">
                    <div className="civic-icon">🛠️</div>
                    <h5 className="fw-semibold mt-3">Department Officer</h5>
                    <p className="text-muted small">
                      Ward officer creates department officers
                    </p>
                    <a
                      href="/ward/department-officer"
                      className="btn btn-primary w-100 mt-3"
                    >
                      Register Department Officer
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default Home;
