import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Filter, Eye, RefreshCw, Map as MapIcon, Activity, AlertTriangle, CheckCircle, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import StatusBadge from '../../components/ui/StatusBadge';
import DashboardHeader from '../../components/layout/DashboardHeader';
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
        html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10]
    });
};

const RecenterMap = ({ items }) => {
    const map = useMap();
    useEffect(() => {
        if (items && items.length > 0) {
            const bounds = L.latLngBounds(items.map(c => [c.latitude, c.longitude]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        }
    }, [items, map]);
    return null;
};

// Heatmap Layer Component
const HeatmapLayer = ({ points }) => {
    const map = useMap();
    useEffect(() => {
        if (!points || points.length === 0) return;

        const loadHeatmap = async () => {
            if (!L.heatLayer) {
                const script = document.createElement('script');
                script.src = "https://leaflet.github.io/Leaflet.heat/dist/leaflet-heat.js";
                script.async = true;
                document.head.appendChild(script);

                await new Promise(resolve => {
                    script.onload = resolve;
                });
            }

            if (L.heatLayer) {
                const heat = L.heatLayer(
                    points.map(p => [p.latitude, p.longitude, 0.5]),
                    { radius: 25, blur: 15, maxZoom: 17, gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' } }
                ).addTo(map);

                return () => map.removeLayer(heat);
            }
        };

        loadHeatmap();
    }, [map, points]);

    return null;
};

const AdminMap = () => {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [allComplaints, setAllComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [viewMode, setViewMode] = useState('markers'); // markers, heatmap, boundaries
    const [filters, setFilters] = useState({
        departmentId: '',
        status: '',
        startDate: '',
        endDate: ''
    });

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        slaBreach: 0,
        resolvedToday: 0
    });

    useEffect(() => {
        loadDepartments();
        fetchMapData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, allComplaints]);

    const loadDepartments = async () => {
        try {
            const res = await apiService.common.getDepartments();
            setDepartments(res.data || res || []);
        } catch (error) {
            console.error('Failed to load departments', error);
        }
    };

    const fetchMapData = async () => {
        try {
            setLoading(true);
            const response = await apiService.map.getComplaints({});
            const rawData = response.data || response;
            const rawList = Array.isArray(rawData) ? rawData : (rawData.complaints || []);

            const validList = rawList.map(c => ({
                ...c,
                latitude: c.latitude ? parseFloat(c.latitude) : null,
                longitude: c.longitude ? parseFloat(c.longitude) : null
            })).filter(c => c.latitude && c.longitude);

            setAllComplaints(validList);
            setComplaints(validList);

            // Calculate stats
            const today = new Date().toDateString();
            setStats({
                total: validList.length,
                active: validList.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED' || c.status === 'SUBMITTED').length,
                slaBreach: validList.filter(c => c.slaBreached === true).length,
                resolvedToday: validList.filter(c => {
                    const resolvedDate = c.resolvedAt ? new Date(c.resolvedAt).toDateString() : null;
                    return resolvedDate === today;
                }).length
            });
        } catch (error) {
            console.error('Admin map sync failure:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...allComplaints];

        if (filters.departmentId) {
            filtered = filtered.filter(c => String(c.departmentId) === String(filters.departmentId));
        }
        if (filters.status) {
            filtered = filtered.filter(c => c.status === filters.status);
        }
        if (filters.startDate) {
            filtered = filtered.filter(c => new Date(c.createdAt) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
            filtered = filtered.filter(c => new Date(c.createdAt) <= new Date(filters.endDate));
        }

        setComplaints(filtered);
    };

    const defaultCenter = [18.5204, 73.8567];

    return (
        <div className="min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="Admin Control Center"
                userName={localStorage.getItem('name') || "Administrator"}
                title="City-Wide Complaint Map"
                subtitle="Smart City Dashboard - Real-time Monitoring"
                icon={MapIcon}
                actions={
                    <button onClick={fetchMapData} className="btn btn-white bg-white rounded-pill px-4 py-2 border shadow-sm d-flex align-items-center gap-2">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                }
            />

            {/* Top Stats Bar */}
            <div className="container-fluid px-3 px-lg-4" style={{ marginTop: '-20px' }}>
                <div className="row g-3 mb-3">
                    <div className="col-lg-3 col-md-6">
                        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="small text-muted mb-1">Total Complaints</p>
                                    <h3 className="fw-bold mb-0">{stats.total}</h3>
                                </div>
                                <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                                    <Activity size={24} className="text-primary" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="small text-muted mb-1">Active Complaints</p>
                                    <h3 className="fw-bold mb-0 text-warning">{stats.active}</h3>
                                </div>
                                <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                                    <MapPin size={24} className="text-warning" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="small text-muted mb-1">SLA Breaches</p>
                                    <h3 className="fw-bold mb-0 text-danger">{stats.slaBreach}</h3>
                                </div>
                                <div className="bg-danger bg-opacity-10 rounded-circle p-3">
                                    <AlertTriangle size={24} className="text-danger" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="small text-muted mb-1">Resolved Today</p>
                                    <h3 className="fw-bold mb-0 text-success">{stats.resolvedToday}</h3>
                                </div>
                                <div className="bg-success bg-opacity-10 rounded-circle p-3">
                                    <CheckCircle size={24} className="text-success" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-3">
                    {/* Filter Panel */}
                    <div className="col-lg-3">
                        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                <Filter size={18} /> Analytics Filters
                            </h6>

                            <div className="vstack gap-3">
                                {/* View Mode Toggle */}
                                <div>
                                    <label className="form-label small fw-bold text-muted mb-2">View Mode</label>
                                    <div className="btn-group w-100" role="group">
                                        <button
                                            type="button"
                                            className={`btn btn-sm ${viewMode === 'markers' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => setViewMode('markers')}
                                        >
                                            Markers
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn btn-sm ${viewMode === 'heatmap' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => setViewMode('heatmap')}
                                        >
                                            Heatmap
                                        </button>
                                    </div>
                                </div>

                                {/* Department Filter */}
                                <div>
                                    <label className="form-label small fw-bold text-muted mb-2">Department</label>
                                    <select
                                        className="form-select rounded-3"
                                        value={filters.departmentId}
                                        onChange={e => setFilters({ ...filters, departmentId: e.target.value })}
                                    >
                                        <option value="">All Departments</option>
                                        {departments.map(d => (
                                            <option key={d.departmentId} value={d.departmentId}>
                                                {d.departmentName || d.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status Filter */}
                                <div>
                                    <label className="form-label small fw-bold text-muted mb-2">Status</label>
                                    <select
                                        className="form-select rounded-3"
                                        value={filters.status}
                                        onChange={e => setFilters({ ...filters, status: e.target.value })}
                                    >
                                        <option value="">All Status</option>
                                        <option value="SUBMITTED">🔴 New</option>
                                        <option value="IN_PROGRESS">🟡 In Progress</option>
                                        <option value="RESOLVED">🟢 Resolved</option>
                                        <option value="REJECTED">⚫ Rejected</option>
                                    </select>
                                </div>

                                {/* Date Range */}
                                <div>
                                    <label className="form-label small fw-bold text-muted mb-2">Date Range</label>
                                    <input
                                        type="date"
                                        className="form-control rounded-3 mb-2"
                                        value={filters.startDate}
                                        onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                                    />
                                    <input
                                        type="date"
                                        className="form-control rounded-3"
                                        value={filters.endDate}
                                        onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                                    />
                                </div>

                                {/* Filtered Results */}
                                <div className="mt-3 pt-3 border-top">
                                    <p className="small fw-bold text-muted mb-2">Filtered Results</p>
                                    <div className="d-flex justify-content-between">
                                        <span className="small">Showing</span>
                                        <span className="badge bg-primary">{complaints.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map - Large */}
                    <div className="col-lg-9">
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ height: '75vh' }}>
                            <MapContainer
                                center={defaultCenter}
                                zoom={12}
                                style={{ height: '100%', width: '100%' }}
                                zoomControl={true}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {complaints.length > 0 && <RecenterMap items={complaints} />}

                                {viewMode === 'markers' && complaints.map((c) => (
                                    <Marker
                                        key={c.id || c.complaintId}
                                        position={[c.latitude, c.longitude]}
                                        icon={createMarkerIcon(c.status)}
                                    >
                                        <Popup className="custom-popup">
                                            <div style={{ minWidth: '200px' }}>
                                                <h6 className="fw-bold mb-2">#{c.complaintId || c.id}</h6>
                                                <p className="small mb-2">{c.title}</p>
                                                <div className="mb-2">
                                                    <StatusBadge status={c.status} size="sm" />
                                                </div>
                                                <div className="small text-muted mb-2">
                                                    <div>Ward: {c.wardName || 'N/A'}</div>
                                                    <div>Dept: {c.departmentName || 'Unassigned'}</div>
                                                    {c.slaBreached && (
                                                        <div className="text-danger fw-bold mt-1">
                                                            <AlertTriangle size={12} /> SLA Breached
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => navigate(`/admin/complaints/${c.id || c.complaintId}`)}
                                                    className="btn btn-primary btn-sm w-100 rounded-pill"
                                                >
                                                    <Eye size={14} className="me-1" /> View Details
                                                </button>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}

                                {viewMode === 'heatmap' && <HeatmapLayer points={complaints} />}
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

export default AdminMap;
