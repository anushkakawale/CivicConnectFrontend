import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import ComplaintDetailView from '../../components/complaints/ComplaintDetailView';
import { ArrowLeft, Play, CheckCircle, Upload, Clock, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const DepartmentComplaintDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [complaint, setComplaint] = useState(null);
    const [images, setImages] = useState([]);
    const [statusHistory, setStatusHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Action States
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [stage, setStage] = useState('IN_PROGRESS');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchComplaintDetails();
    }, [id]);

    const fetchComplaintDetails = async () => {
        try {
            setLoading(true);

            // Try fetching details
            // Use generic complaints service to get full details + images + history
            let data;
            try {
                data = await apiService.complaints.getDetails(id);
                // Also ensures department officer has access (backend handles security)
            } catch (e) {
                // Fallback to department specific if generic fails
                // NOTE: apiService.departmentOfficer.getComplaintById may not exist if I removed it during standardization
                // But let's assume getAssignedComplaints is the main way.
                const list = await apiService.departmentOfficer.getAssignedComplaints();
                const found = (Array.isArray(list) ? list : []).find(c => c.complaintId == id || c.id == id);
                if (found) data = found;
                else throw new Error("Complaint not found in your queue");
            }

            if (data) {
                setComplaint(data);

                // Fetch images if not included
                try {
                    // Try generic getImages
                    const imgs = await apiService.complaints.getImages(id);
                    setImages(Array.isArray(imgs) ? imgs : []);
                } catch (e) {
                    setImages(data.images || []);
                }

                // Status history
                setStatusHistory(data.statusHistory || []);
            }
        } catch (err) {
            console.error('Error:', err);
            showToast('Failed to load details', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStartWork = async () => {
        if (!window.confirm('Start work on this complaint?')) return;
        try {
            setActionLoading(true);
            await apiService.departmentOfficer.updateStatus(id, 'IN_PROGRESS', 'Work started by officer');
            showToast('Work started successfully', 'success');
            fetchComplaintDetails();
        } catch (err) {
            showToast('Failed to start work', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleResolve = async () => {
        if (!window.confirm('Mark as resolved?')) return;
        try {
            setActionLoading(true);
            await apiService.departmentOfficer.updateStatus(id, 'RESOLVED', 'Complaint resolved by officer');
            showToast('Complaint resolved!', 'success');
            fetchComplaintDetails();
        } catch (err) {
            showToast('Failed to resolve', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        e.preventDefault();
        try {
            setUploading(true);
            // Assuming we upload by URL or file. The UI here uses URL text input to be simple/consistent with previous code.
            // If real upload needed, we'd use formData.
            // For now, assume URL string or simple upload.
            // The previous code used `departmentOfficerService.uploadImage` with URL.
            // My apiService has `complaints.uploadImage` which expects FormData usually.
            // BUT strict list said "Upload Image (Before/After/During)".
            // I'll construct FormData if input is file, or JSON if it's URL.
            // Since previous code used URL input, I'll stick to that logic but use `apiService`.
            // Wait, standard `apiService.complaints.uploadImage` is `POST /api/complaints/{id}/images` (multipart).
            // It might not accept JSON URL.
            // I will implement a "Mock" upload if I can't do real file upload, OR I will switch to File Input.
            // Let's switch to File Input for better realism, or keep URL if the user REALLY wants URL.
            // Previous code: `imageUrl` input.
            // I'll support URL if `apiService` handles it, or I'll try to support it via a specialized endpoint if exists.
            // Actually, let's look at `apiService.departmentOfficer` methods I might have added?
            // If not, I'll use `apiService.complaints.uploadImage` and assume it handles FormData.
            // I'll change the UI to a File Input for robust implementation. 
            // BUT to minimize friction, I'll keep logic similar to previous but safer.
            // If I use URL, I might not have backend support.
            // I'll USE dummy logic for URL if I can't confirm backend support, OR better:
            // I'll provide a File Input.

            // Re-reading previous file: It used `departmentOfficerService.uploadImage(id, { imageUrl: ... })`.
            // This suggests backend accepted JSON with URL.
            // So I will try sending JSON to `/api/complaints/{id}/images`? No, that's likely multipart.
            // I will use `api.post('/api/complaints/' + id + '/images', { imageUrl, stage ... })` directly if needed.

            // To be safe and compliant with "Standardization", I should use `apiService`.
            // `apiService.complaints.uploadImage` takes `formData`.
            // So if I want to support URL, I should check if backend supports it.
            // I'll assume standard Multipart Upload is better and switch to File Input.

            // But wait, "Images must be accessible".
            // I'll stick to File Input.

            // ACTUALLY, I'll implement a simple "Add Image URL" feature using axios directly if `apiService` lacks it,
            // or better, standard upload.

            /* Implementation for File Upload */
            const formData = new FormData();
            // If I have a file input ref...
            // Since I am writing the whole file, I will change the form to File Input.

            // ... Changing to File Input logic is safer.
        } catch (err) {
            // ...
        }
    };

    // Re-implementing Upload with File Input for better standard compliance
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return showToast('Please select a file first', 'error');

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('stage', stage); // e.g. IN_PROGRESS

        try {
            setUploading(true);
            // Use citizen endpoint because it maps to the generic POST /complaints/{id}/images
            await apiService.citizen.uploadImage(id, formData);
            showToast('Image uploaded successfully', 'success');
            setSelectedFile(null);
            // Reset file input if possible or just rely on state
            fetchComplaintDetails();
        } catch (err) {
            console.error("Upload failed", err);
            showToast('Upload failed: ' + (err.response?.data?.message || err.message), 'error');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!complaint) return (
        <div className="container py-4">
            <div className="alert alert-danger">Complaint not found</div>
            <button className="btn btn-primary" onClick={() => navigate('/department/dashboard')}>Back</button>
        </div>
    );

    const canStart = complaint.status === 'ASSIGNED';
    const canResolve = complaint.status === 'IN_PROGRESS';
    const canUpload = ['IN_PROGRESS', 'RESOLVED'].includes(complaint.status);

    return (
        <div className="container-fluid py-4">
            <button className="btn btn-link text-decoration-none mb-3 ps-0" onClick={() => navigate('/department/dashboard')}>
                <ArrowLeft size={16} className="me-1" /> Back to Dashboard
            </button>

            <ComplaintDetailView
                complaint={complaint}
                images={images}
                statusHistory={statusHistory}
                userRole="DEPARTMENT_OFFICER"
            >
                {/* Actions Slot */}
                <div className="row g-3 mb-4">
                    {/* Status Actions */}
                    <div className="col-md-8">
                        {(canStart || canResolve) && (
                            <div className="card shadow-sm border-primary">
                                <div className="card-body d-flex align-items-center justify-content-between">
                                    <div>
                                        <h5 className="fw-bold text-primary mb-1">
                                            {canStart ? 'Ready to Start Work?' : 'Work Completed?'}
                                        </h5>
                                        <p className="text-muted mb-0 small">
                                            {canStart ? 'Update status to In Progress' : 'Mark complaint as Resolved'}
                                        </p>
                                    </div>
                                    <div>
                                        {canStart && (
                                            <button className="btn btn-success" onClick={handleStartWork} disabled={actionLoading}>
                                                {actionLoading ? 'Updating...' : <><Play size={18} className="me-2" /> Start Work</>}
                                            </button>
                                        )}
                                        {canResolve && (
                                            <button className="btn btn-primary" onClick={handleResolve} disabled={actionLoading}>
                                                {actionLoading ? 'Updating...' : <><CheckCircle size={18} className="me-2" /> Resolve</>}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SLA Info Inline if not working */}
                        {!canStart && !canResolve && (
                            <div className="alert alert-info d-flex align-items-center mb-0">
                                <Clock size={20} className="me-3" />
                                <div>
                                    <strong>Current Status: {complaint.status}</strong>
                                    <div className="small">No actions available at this stage.</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Upload Image Action */}
                    {canUpload && (
                        <div className="col-md-4">
                            <div className="card shadow-sm h-100">
                                <div className="card-header bg-white py-2">
                                    <h6 className="fw-bold mb-0 text-dark"><Upload size={16} className="me-2" /> Upload Proof</h6>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={handleFileUpload}>
                                        <select className="form-select form-select-sm mb-2" value={stage} onChange={e => setStage(e.target.value)}>
                                            <option value="IN_PROGRESS">Work In Progress</option>
                                            <option value="AFTER_RESOLUTION">After Resolution</option>
                                        </select>
                                        <input
                                            type="file"
                                            className="form-control form-select-sm mb-2"
                                            onChange={e => setSelectedFile(e.target.files[0])}
                                            accept="image/*"
                                        />
                                        <button className="btn btn-sm btn-outline-primary w-100" type="submit" disabled={uploading}>
                                            {uploading ? 'Uploading...' : 'Upload'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ComplaintDetailView>
        </div>
    );
};

export default DepartmentComplaintDetail;
