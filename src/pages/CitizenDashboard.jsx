import { useNavigate } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("email") || "Citizen";

  const quickActions = [
    {
      path: "/citizen/complaints/new",
      icon: "plus-circle",
      label: "Register Complaint",
      description: "Submit a new complaint",
      color: "var(--gov-primary)"
    },
    {
      path: "/citizen/complaints",
      icon: "list-ul",
      label: "My Complaints",
      description: "View and track your complaints",
      color: "var(--gov-secondary)"
    },
    {
      path: "/citizen/ward-complaints",
      icon: "geo-alt",
      label: "Ward Complaints",
      description: "View complaints in your area",
      color: "var(--gov-accent)"
    },
    {
      path: "/citizen/profile",
      icon: "person-circle",
      label: "My Profile",
      description: "Update your information",
      color: "var(--gov-text-light)"
    },
  ];

  return (
    <PageLayout role="CITIZEN" userName={userName}>
      {/* Welcome Section */}
      <div className="gov-card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--gov-primary)' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Welcome to CivicConnect</h2>
        <p style={{ color: 'var(--gov-text-light)', marginBottom: 0 }}>
          Your voice matters. Report issues and track their resolution.
        </p>
      </div>

      {/* Quick Actions */}
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Quick Actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {quickActions.map((action, index) => (
          <div
            key={index}
            className="gov-card"
            onClick={() => navigate(action.path)}
            style={{
              cursor: 'pointer',
              borderLeft: `4px solid ${action.color}`,
              transition: 'box-shadow 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
              <i className={`bi bi-${action.icon}`} style={{ fontSize: '2rem', color: action.color, marginRight: '1rem' }}></i>
              <div>
                <h4 style={{ marginBottom: '0.25rem', fontSize: '1.125rem' }}>{action.label}</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--gov-text-light)', marginBottom: 0 }}>
                  {action.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Information Section */}
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>How It Works</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="gov-card">
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '0',
              backgroundColor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '1rem',
              flexShrink: 0
            }}>
              <i className="bi bi-lightning-charge" style={{ fontSize: '1.5rem', color: 'var(--gov-primary)' }}></i>
            </div>
            <div>
              <h5 style={{ marginBottom: '0.5rem' }}>Quick Response</h5>
              <p style={{ fontSize: '0.875rem', color: 'var(--gov-text-light)', marginBottom: 0 }}>
                Get your issues resolved within SLA timelines
              </p>
            </div>
          </div>
        </div>

        <div className="gov-card">
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '0',
              backgroundColor: '#F0FDF4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '1rem',
              flexShrink: 0
            }}>
              <i className="bi bi-eye" style={{ fontSize: '1.5rem', color: 'var(--gov-secondary)' }}></i>
            </div>
            <div>
              <h5 style={{ marginBottom: '0.5rem' }}>Full Transparency</h5>
              <p style={{ fontSize: '0.875rem', color: 'var(--gov-text-light)', marginBottom: 0 }}>
                Track every step of complaint resolution
              </p>
            </div>
          </div>
        </div>

        <div className="gov-card">
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '0',
              backgroundColor: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '1rem',
              flexShrink: 0
            }}>
              <i className="bi bi-shield-check" style={{ fontSize: '1.5rem', color: 'var(--gov-accent)' }}></i>
            </div>
            <div>
              <h5 style={{ marginBottom: '0.5rem' }}>Secure & Safe</h5>
              <p style={{ fontSize: '0.875rem', color: 'var(--gov-text-light)', marginBottom: 0 }}>
                Your data is protected and confidential
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="gov-alert gov-alert-info" style={{ marginTop: '2rem' }}>
        <strong>Important:</strong> All complaints are reviewed within 24 hours. You will receive notifications on status updates.
      </div>
    </PageLayout>
  );
}
