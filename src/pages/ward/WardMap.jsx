import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService'; // Using Centralized API
import { COMPLAINT_STATUS, DEPARTMENTS } from '../../constants';
import { Map as MapIcon, Filter } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker colors based on status
const getMarkerIcon = (status) => {
    const colors = {
        'PENDING': '#dc3545',
        'ASSIGNED': '#0dcaf0',
        'IN_PROGRESS': '#ffc107',
        'RESOLVED': '#198754',
        'APPROVED': '#198754',
        'CLOSED': '#6c757d'
    };

    const color = colors[status] || '#6c757d';

    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
        iconSize: [25, 25],
        iconAnchor: [12, 12],
    });
};

const WardMap = () => {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [center, setCenter] = useState([18.5204, 73.8567]); // Pune coordinates as default

    useEffect(() => {
        fetchMapComplaints();
    }, []);

    const fetchMapComplaints = async () => {
        try {
            setLoading(true);
            // Fetch all ward complaints
            const response = await apiService.wardOfficer.getComplaints();
            let complaintsData = Array.isArray(response) ? response : (response?.data || response?.content || []);

            // Filter for only those with location data
            const validComplaints = complaintsData.filter(c => c.latitude && c.longitude);
            setComplaints(validComplaints);

            // Set center to first complaint location if available
            if (validComplaints.length > 0) {
                setCenter([validComplaints[0].latitude, validComplaints[0].longitude]);
            }
        } catch (err) {
            setError('Failed to load map data');
            console.error(err);
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    const getDepartmentInfo = (departmentId) => {
        const deptId = Number(departmentId);
        const dept = DEPARTMENTS.find(d => d.department_id === deptId);
        return dept || { name: 'General', icon: '📋', color: 'secondary' };
    };

    const getStatusBadge = (status) => {
        const statusInfo = COMPLAINT_STATUS[status] || { label: status, color: 'secondary' };
        return statusInfo;
    };

    const filteredComplaints = filterStatus === 'ALL'
        ? complaints
        : complaints.filter(c => c.status === filterStatus);

    if (loading) {
        return (
            <div className="container-fluid py-5">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted fw-semibold">Loading map...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <h2 className="fw-bold mb-1">
                        <MapIcon size={28} className="me-2 text-primary" />
                        Ward Map View
                    </h2>
                    <p className="text-muted mb-0">Geographic overview of all complaints in your ward</p>
                </div>
            </div>

            {error && (
                <div className="alert alert-warning mb-4">
                    {error}
                </div>
            )}

            {/* Filter Bar */}
            <div className="card shadow-sm border-0 mb-3">
                <div className="card-body">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <Filter size={18} className="text-muted" />
                        <span className="fw-semibold me-2">Filter by Status:</span>
                        <div className="btn-group" role="group">
                            <button
                                className={`btn btn-sm ${filterStatus === 'ALL' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setFilterStatus('ALL')}
                            >
                                All ({complaints.length})
                            </button>
                            <button
                                className={`btn btn-sm ${filterStatus === 'PENDING' ? 'btn-danger' : 'btn-outline-danger'}`}
                                onClick={() => setFilterStatus('PENDING')}
                            >
                                Pending
                            </button>
                            <button
                                className={`btn btn-sm ${filterStatus === 'IN_PROGRESS' ? 'btn-warning' : 'btn-outline-warning'}`}
                                onClick={() => setFilterStatus('IN_PROGRESS')}
                            >
                                In Progress
                            </button>
                            <button
                                className={`btn btn-sm ${filterStatus === 'RESOLVED' ? 'btn-success' : 'btn-outline-success'}`}
                                onClick={() => setFilterStatus('RESOLVED')}
                            >
                                Resolved
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="row">
                <div className="col-12">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-0">
                            <div style={{ height: '600px', width: '100%' }}>
                                <MapContainer
                                    center={center}
                                    zoom={13}
                                    style={{ height: '100%', width: '100%' }}
                                    scrollWheelZoom={true}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    {filteredComplaints.length > 0 ? filteredComplaints.map((complaint) => {
                                        const dept = getDepartmentInfo(complaint.departmentId);
                                        const statusInfo = getStatusBadge(complaint.status);

                                        return (
                                            <Marker
                                                key={complaint.id || complaint.complaintId}
                                                position={[complaint.latitude, complaint.longitude]}
                                                icon={getMarkerIcon(complaint.status)}
                                            >
                                                <Popup>
                                                    <div style={{ minWidth: '200px' }}>
                                                        <h6 className="fw-bold mb-2">#{complaint.id || complaint.complaintId} - {complaint.title}</h6>
                                                        <div className="mb-2">
                                                            <small className="text-muted">Department:</small>
                                                            <div>{dept.icon} {dept.name}</div>
                                                        </div>
                                                        <div className="mb-2">
                                                            <small className="text-muted">Status:</small>
                                                            <div>
                                                                <span className={`badge bg-${statusInfo.color}`}>
                                                                    {statusInfo.icon} {statusInfo.label}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            className="btn btn-sm btn-primary w-100 mt-2"
                                                            onClick={() => navigate(`/ward-officer/complaints/${complaint.id || complaint.complaintId}`)}
                                                        >
                                                            View Details
                                                        </button>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        );
                                    }) : null}
                                </MapContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WardMap;
