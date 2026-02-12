import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Filter, Eye, RefreshCw, Map as MapIcon, CheckCircle, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import StatusBadge from '../../components/ui/StatusBadge';
import DashboardHeader from '../../components/layout/DashboardHeader';
import { useToast } from '../../hooks/useToast';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
if (typeof window !== 'undefined') {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

const STATUS_COLORS = {
    // Initial States
    'NEW': '#64748B',
    'SUBMITTED': '#64748B',
    'RECEIVED': '#64748B',

    // Assignment States
    'ASSIGNED': '#3B82F6',
    'DISPATCHED': '#3B82F6',

    // Work States
    'IN_PROGRESS': '#F59E0B',
    'WORKING': '#F59E0B',
    'ON_HOLD': '#8B5CF6',

    // Resolution States
    'RESOLVED': '#10B981',
    'FIXED': '#10B981',

    // Approval States
    'PENDING_APPROVAL': '#6366F1',
    'APPROVED': '#059669',
    'VERIFIED': '#059669',

    // Final States
    'CLOSED': '#1E293B', // Dark gray/black

    // Negative States
    'REJECTED': '#EF4444', // Red
    'RETURNED': '#EF4444',
    'INVALID': '#DC2626',

    // Special States
    'REOPENED': '#EC4899', // Pink
    'ESCALATED': '#B91C1C' // Dark red
};

const createMarkerIcon = (status) => {
    const color = STATUS_COLORS[status] || '#6366F1';
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
    });
};

const RecenterMap = ({ items }) => {
    const map = useMap();
    useEffect(() => {
        if (items && items.length > 0) {
            const bounds = L.latLngBounds(items.map(c => [c.latitude, c.longitude]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }, [items, map]);
    return null;
};

const DepartmentMap = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        priority: ''
    });

    useEffect(() => {
        fetchMapData();
    }, []);

    useEffect(() => {
        fetchMapData();
    }, [filters]);

    const fetchMapData = async () => {
        try {
            setLoading(true);
            const response = await apiService.departmentOfficer.getAssignedComplaints();
            const rawData = response.data || response;
            const rawList = Array.isArray(rawData) ? rawData : (rawData.complaints || rawData.content || []);

            let validList = rawList.map(c => ({
                ...c,
                latitude: c.latitude ? parseFloat(c.latitude) : null,
                longitude: c.longitude ? parseFloat(c.longitude) : null
            })).filter(c => c.latitude && c.longitude);

            // Apply filters
            if (filters.status) {
                validList = validList.filter(c => c.status === filters.status);
            }
            if (filters.priority) {
                validList = validList.filter(c => c.priority === filters.priority);
            }

            setComplaints(validList);
        } catch (error) {
            console.error('Department map sync failure:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkInProgress = async (complaint) => {
        try {
            await apiService.departmentOfficer.updateComplaintStatus(
                complaint.id || complaint.complaintId,
                'IN_PROGRESS'
            );
            showToast('Complaint marked as In Progress', 'success');
            fetchMapData();
        } catch (error) {
            console.error('Failed to update status:', error);
            showToast('Failed to update status', 'error');
        }
    };

    const handleMarkResolved = (complaint) => {
        navigate(`/department-officer/complaints/${complaint.id || complaint.complaintId}`);
    };

    const defaultCenter = [18.5204, 73.8567];

    return (
        <div className="min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="Department Officer"
                userName={localStorage.getItem('name') || "Officer"}
                title="My Assigned Tasks"
                subtitle="Manage and resolve assigned complaints"
                icon={MapIcon}
                actions={
                    <button onClick={fetchMapData} className="btn btn-white bg-white rounded-pill px-4 py-2 border shadow-sm d-flex align-items-center gap-2">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                }
            />

            <div className="container-fluid px-3 px-lg-4" style={{ marginTop: '-20px' }}>
                <div className="row g-3">
                    {/* Filter Box - Small */}
                    <div className="col-lg-3">
                        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                <Filter size={18} /> Task Filters
                            </h6>

                            <div className="vstack gap-3">
                                {/* Status Filter */}
                                <div>
                                    <label className="form-label small fw-bold text-muted mb-2">Status</label>
                                    <select
                                        className="form-select rounded-3"
                                        value={filters.status}
                                        onChange={e => setFilters({ ...filters, status: e.target.value })}
                                    >
                                        <option value="">All Status</option>
                                        <option value="ASSIGNED">🔴 Assigned</option>
                                        <option value="IN_PROGRESS">🟡 In Progress</option>
                                        <option value="RESOLVED">🟢 Resolved</option>
                                    </select>
                                </div>

                                {/* Priority Filter */}
                                <div>
                                    <label className="form-label small fw-bold text-muted mb-2">Priority</label>
                                    <select
                                        className="form-select rounded-3"
                                        value={filters.priority}
                                        onChange={e => setFilters({ ...filters, priority: e.target.value })}
                                    >
                                        <option value="">All Priorities</option>
                                        <option value="HIGH">🔴 High</option>
                                        <option value="MEDIUM">🟡 Medium</option>
                                        <option value="LOW">🟢 Low</option>
                                    </select>
                                </div>

                                {/* Stats */}
                                <div className="mt-3 pt-3 border-top">
                                    <p className="small fw-bold text-muted mb-2">My Tasks</p>
                                    <div className="vstack gap-2">
                                        <div className="d-flex justify-content-between">
                                            <span className="small">Total Assigned</span>
                                            <span className="badge bg-primary">{complaints.length}</span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span className="small">In Progress</span>
                                            <span className="badge bg-warning">
                                                {complaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'WORKING').length}
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span className="small">Resolved</span>
                                            <span className="badge bg-success">
                                                {complaints.filter(c => c.status === 'RESOLVED' || c.status === 'APPROVED').length}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Legend */}
                                <div className="mt-3 pt-3 border-top">
                                    <p className="small fw-bold text-muted mb-2">Legend</p>
                                    <div className="vstack gap-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#EF4444' }}></div>
                                            <span className="small">New/Assigned</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#F59E0B' }}></div>
                                            <span className="small">In Progress</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
                                            <span className="small">Resolved</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map - Large */}
                    <div className="col-lg-9">
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ height: '85vh' }}>
                            <MapContainer
                                center={defaultCenter}
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                                zoomControl={true}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {complaints.length > 0 && <RecenterMap items={complaints} />}

                                {complaints.map((c) => (
                                    <Marker
                                        key={c.id || c.complaintId}
                                        position={[c.latitude, c.longitude]}
                                        icon={createMarkerIcon(c.status)}
                                    >
                                        <Popup className="custom-popup">
                                            <div style={{ minWidth: '220px' }}>
                                                <h6 className="fw-bold mb-2">{c.title}</h6>
                                                <div className="mb-2">
                                                    <StatusBadge status={c.status} size="sm" />
                                                </div>
                                                <div className="small text-muted mb-3">
                                                    <div>Assigned: {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}</div>
                                                    {c.priority && (
                                                        <div className="mt-1">
                                                            Priority: <span className={`badge ${c.priority === 'HIGH' ? 'bg-danger' : c.priority === 'MEDIUM' ? 'bg-warning' : 'bg-success'}`}>
                                                                {c.priority}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="d-grid gap-2">
                                                    {(c.status === 'ASSIGNED' || c.status === 'SUBMITTED') && (
                                                        <button
                                                            onClick={() => handleMarkInProgress(c)}
                                                            className="btn btn-warning btn-sm rounded-pill text-white"
                                                        >
                                                            <PlayCircle size={14} className="me-1" /> Mark In Progress
                                                        </button>
                                                    )}
                                                    {(c.status === 'IN_PROGRESS' || c.status === 'WORKING') && (
                                                        <button
                                                            onClick={() => handleMarkResolved(c)}
                                                            className="btn btn-success btn-sm rounded-pill"
                                                        >
                                                            <CheckCircle size={14} className="me-1" /> Mark Resolved
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => navigate(`/department-officer/complaints/${c.id || c.complaintId}`)}
                                                        className="btn btn-outline-secondary btn-sm rounded-pill"
                                                    >
                                                        <Eye size={14} className="me-1" /> View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-popup .leaflet-popup-content-wrapper {
                    border-radius: 12px;
                    padding: 8px;
                }
                .custom-popup .leaflet-popup-content {
                    margin: 8px;
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}} />
        </div>
    );
};

export default DepartmentMap;
