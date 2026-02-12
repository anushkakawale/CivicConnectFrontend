import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

/**
 * Tactical Alert Component for Ward/Admin Detail Views
 * Highlights missing personnel and provides direct triage paths.
 */
const OfficerAssignmentAlert = ({ complaint }) => {
    const navigate = useNavigate();

    if (!complaint) return null;

    const missingWardOfficer = !complaint.wardOfficerName;
    const missingAssignedOfficer = !complaint.assignedOfficerName;

    // Show Alert ONLY for newly SUBMITTED complaints that are missing initial personnel.
    // If it's already ASSIGNED or IN_PROGRESS, or if anyone is already assigned, skip.
    const isInitialGap = complaint.status === 'SUBMITTED' && missingWardOfficer && missingAssignedOfficer;

    if (!isInitialGap) return null;

    return (
        <div className="card border-0 shadow-premium rounded-4 bg-white mb-4 overflow-hidden border-start border-4 animate-fadeIn" style={{ borderColor: '#EF4444' }}>
            <div className="card-body p-4 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-danger bg-opacity-10 p-2 text-danger">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h6 className="fw-black text-dark mb-0 uppercase tracking-tight">Deployment Gap Detected</h6>
                        <p className="extra-small text-muted fw-bold mb-0 opacity-60">
                            {missingWardOfficer
                                ? 'No Ward Commander assigned to Sector. Authority node required.'
                                : 'Field operative not yet dispatched to incident. Immediate triage required.'}
                        </p>
                    </div>
                </div>
                <div className="d-flex gap-2">
                    {missingWardOfficer ? (
                        <button
                            onClick={() => navigate('/admin/register-officer', { state: { role: 'WARD_OFFICER', wardId: complaint.wardId } })}
                            className="btn btn-dark btn-sm rounded-pill px-3 fw-black extra-small tracking-widest"
                        >
                            APPOINT COMMANDER
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate(`/admin/officer-directory`)}
                            className="btn btn-outline-dark btn-sm rounded-pill px-3 fw-black extra-small tracking-widest"
                        >
                            DISPATCH UNIT
                        </button>
                    )}
                </div>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.65rem; }
                .uppercase { text-transform: uppercase; }
                .tracking-tight { letter-spacing: -0.025em; }
                .tracking-widest { letter-spacing: 0.1em; }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
                .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}} />
        </div>
    );
};

export default OfficerAssignmentAlert;
