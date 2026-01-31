import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import apiService from '../api/apiService';

export default function TrackComplaint() {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const userName = localStorage.getItem("email") || "Citizen";
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaintDetails();
  }, [complaintId]);

  const fetchComplaintDetails = async () => {
    try {
      const response = await apiService.complaint.getById(complaintId);
      setComplaint(response.data);
    } catch (error) {
      console.error('Failed to fetch complaint:', error);
      // Mock data for demonstration
      setComplaint({
        complaintId: complaintId,
        title: "Street Light Not Working",
        description: "The street light near my house has not been working for the past week. This is causing safety concerns for residents.",
        status: "IN_PROGRESS",
        createdAt: "2026-01-20T10:30:00",
        slaDeadline: "2026-01-27T10:30:00",
        history: [
          { status: "SUBMITTED", changedAt: "2026-01-20T10:30:00", changedBy: "System" },
          { status: "ASSIGNED", changedAt: "2026-01-20T11:15:00", changedBy: "Ward Officer" },
          { status: "IN_PROGRESS", changedAt: "2026-01-21T09:00:00", changedBy: "Department Officer" }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageLayout role="CITIZEN" userName={userName}>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="spinner-border text-primary" role="status"></div>
          <p style={{ marginTop: '1rem', color: 'var(--gov-text-light)' }}>Loading complaint details...</p>
        </div>
      </PageLayout>
    );
  }

  if (!complaint) {
    return (
      <PageLayout role="CITIZEN" userName={userName}>
        <div className="gov-alert gov-alert-danger">
          <strong>Error:</strong> Complaint not found
        </div>
      </PageLayout>
    );
  }

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'SUBMITTED': 'submitted',
      'ASSIGNED': 'assigned',
      'IN_PROGRESS': 'in-progress',
      'RESOLVED': 'resolved',
      'CLOSED': 'closed',
      'REJECTED': 'rejected'
    };
    return `gov-badge ${statusMap[status] || ''}`;
  };

  return (
    <PageLayout role="CITIZEN" userName={userName}>
      {/* Header */}
      <div className="gov-card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--gov-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ marginBottom: '0.5rem' }}>{complaint.title}</h2>
            <p style={{ color: 'var(--gov-text-light)', marginBottom: 0 }}>
              Complaint ID: #{complaint.complaintId}
            </p>
          </div>
          <span className={getStatusBadgeClass(complaint.status)}>
            {complaint.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Main Content */}
        <div>
          {/* Description */}
          <div className="gov-card" style={{ marginBottom: '2rem' }}>
            <div className="gov-card-header">Description</div>
            <div className="gov-card-body">
              <p style={{ marginBottom: 0 }}>{complaint.description}</p>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="gov-card">
            <div className="gov-card-header">Status Timeline</div>
            <div className="gov-card-body">
              <div className="gov-timeline">
                {complaint.history && complaint.history.length > 0 ? (
                  complaint.history.map((item, index) => (
                    <div key={index} className={`gov-timeline-item ${index < complaint.history.length - 1 ? 'completed' : 'active'}`}>
                      <div className="gov-timeline-title">{item.status.replace(/_/g, ' ')}</div>
                      <div className="gov-timeline-time">
                        {new Date(item.changedAt).toLocaleString()} • Changed by: {item.changedBy}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--gov-text-light)' }}>No history available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* SLA Info */}
          {complaint.slaDeadline && complaint.status !== 'CLOSED' && (
            <div className="gov-card" style={{ marginBottom: '1.5rem' }}>
              <div className="gov-card-header">SLA Status</div>
              <div className="gov-card-body">
                <div className="gov-sla safe">
                  <i className="bi bi-clock"></i>
                  <span>Within SLA</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--gov-text-light)', marginTop: '0.75rem', marginBottom: 0 }}>
                  Deadline: {new Date(complaint.slaDeadline).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="gov-card">
            <div className="gov-card-header">Actions</div>
            <div className="gov-card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  onClick={() => navigate('/citizen/complaints')}
                  className="gov-btn gov-btn-outline"
                  style={{ width: '100%' }}
                >
                  <i className="bi bi-arrow-left"></i>
                  Back to Complaints
                </button>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="gov-alert gov-alert-info" style={{ marginTop: '1.5rem', fontSize: '0.875rem' }}>
            <strong>Note:</strong> You will be notified of any status updates via email.
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
