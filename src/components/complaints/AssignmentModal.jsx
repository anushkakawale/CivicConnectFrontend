import React, { useState, useEffect } from 'react';
import { X, Search, CheckCircle, User, Briefcase, Building2, AlertTriangle, ShieldCheck } from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';

/**
 * Assignment Modal
 * Allows Ward Officers/Admins to manually assign a complaint to a Department Officer.
 * Filters available officers by the complaint's department.
 */
const AssignmentModal = ({ complaint, onClose, onAssignSuccess }) => {
    const { showToast } = useToast();
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOfficer, setSelectedOfficer] = useState(null);
    const [assigning, setAssigning] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOfficers();
    }, []);

    const fetchOfficers = async () => {
        try {
            setLoading(true);
            // Fetch all department officers in this ward
            // Ideally, we should filter by the complaint's department ID if possible
            const response = await apiService.wardOfficer.getDepartmentOfficers();
            const allOfficers = response.data || response;

            // Filter officers belonging to the complaint's department
            // Note: Adjust 'departmentId' or 'department.id' based on your API response structure
            const relevantOfficers = Array.isArray(allOfficers) ? allOfficers.filter(officer => {
                const officerDeptId = officer.departmentId || officer.department?.id;
                const complaintDeptId = complaint.departmentId || complaint.department?.id;
                return String(officerDeptId) === String(complaintDeptId);
            }) : [];

            setOfficers(relevantOfficers);

            if (relevantOfficers.length === 0) {
                setError("No officers found for this department in your ward.");
            }
        } catch (err) {
            console.error("Failed to load officers:", err);
            setError("Failed to load officer list.");
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedOfficer) return;

        try {
            setAssigning(true);
            // Call the assign API
            await apiService.wardOfficer.assignComplaint(complaint.complaintId || complaint.id, { officerId: selectedOfficer.userId || selectedOfficer.id });

            showToast('Complaint assigned successfully!', 'success');
            if (onAssignSuccess) onAssignSuccess();
            onClose();
        } catch (err) {
            console.error("Assignment failed:", err);
            showToast(err.response?.data?.message || 'Failed to assign complaint.', 'error');
        } finally {
            setAssigning(false);
        }
    };

    const filteredOfficers = officers.filter(officer =>
        officer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        officer.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                    <div className="modal-header border-bottom p-4 bg-light">
                        <div className="d-flex align-items-center gap-3">
                            <div className="rounded-circle bg-primary bg-opacity-10 p-3 text-primary">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h5 className="modal-title fw-black text-dark mb-1">Assign Officer</h5>
                                <p className="mb-0 text-muted small">Complaint #{complaint.complaintId || complaint.id} • {complaint.departmentName || 'General Dept'}</p>
                            </div>
                        </div>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-0">
                        {/* Complaint Summary */}
                        <div className="p-4 bg-light border-bottom">
                            <h6 className="fw-bold text-dark mb-2">{complaint.title}</h6>
                            <p className="text-muted small mb-0 line-clamp-2">{complaint.description}</p>
                        </div>

                        {/* Search & List */}
                        <div className="p-4">
                            <div className="input-group border rounded-3 overflow-hidden mb-4 shadow-sm">
                                <span className="input-group-text bg-white border-0 ps-3"><Search size={18} className="text-muted" /></span>
                                <input
                                    type="text"
                                    className="form-control border-0 py-2 shadow-none"
                                    placeholder="Search officers by name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary mb-3" role="status"></div>
                                    <p className="text-muted small">Loading officers...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-5">
                                    <AlertTriangle size={32} className="text-warning mb-3" />
                                    <p className="text-muted fw-bold">{error}</p>
                                    <p className="small text-muted">Please ensure you have registered officers for this department.</p>
                                </div>
                            ) : filteredOfficers.length === 0 ? (
                                <div className="text-center py-5">
                                    <User size={32} className="text-muted opacity-25 mb-3" />
                                    <p className="text-muted small">No matching officers found.</p>
                                </div>
                            ) : (
                                <div className="list-group list-group-flush border rounded-3 overflow-hidden" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {filteredOfficers.map(officer => {
                                        const officerId = officer.userId || officer.id;
                                        const isSelected = (selectedOfficer?.userId || selectedOfficer?.id) === officerId;

                                        return (
                                            <button
                                                key={officerId}
                                                className={`list-group-item list-group-item-action p-3 d-flex align-items-center gap-3 transition-all ${isSelected ? 'list-group-item-primary border-primary' : 'bg-white'}`}
                                                onClick={() => setSelectedOfficer(officer)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${isSelected ? 'bg-primary text-white' : 'bg-light text-muted'}`} style={{ width: '40px', height: '40px' }}>
                                                    <User size={18} />
                                                </div>
                                                <div className="flex-grow-1 text-start">
                                                    <h6 className="mb-0 fw-bold text-dark">{officer.name}</h6>
                                                    <div className="d-flex align-items-center gap-2 mt-1">
                                                        <span className="badge bg-light text-dark border fw-normal extra-small">{officer.email}</span>
                                                    </div>
                                                </div>
                                                {isSelected && <CheckCircle className="text-primary" size={20} />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="modal-footer border-top p-3 bg-light">
                        <button type="button" className="btn btn-light fw-bold" onClick={onClose}>Cancel</button>
                        <button
                            type="button"
                            className="btn btn-primary fw-bold px-4 shadow-sm"
                            disabled={!selectedOfficer || assigning}
                            onClick={handleAssign}
                        >
                            {assigning ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Assigning...
                                </>
                            ) : 'Confirm Assignment'}
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default AssignmentModal;
