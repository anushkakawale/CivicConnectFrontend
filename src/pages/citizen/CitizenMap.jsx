import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Filter, AlertCircle, Loader, Map as MapIcon, Layers, Building2, Calendar, Eye, Activity, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import { StatusBadge } from '../../components/common';
import DashboardHeader from '../../components/layout/DashboardHeader';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconRetinaUrl: iconRetina,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const RecenterMap = ({ items }) => {
    const map = useMap();
    useEffect(() => {
        if (items && items.length > 0) {
            const validItems = items.filter(i => i.latitude && i.longitude);
            if (validItems.length > 0) {
                const bounds = L.latLngBounds(validItems.map(c => [c.latitude, c.longitude]));
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
        }
    }, [items, map]);
    return null;
};

const CitizenMap = () => {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        fetchMapData();
    }, [filterDepartment, filterStatus]);

    const fetchDepartments = async () => {
        try {
            const response = await apiService.masterData.getDepartments();
            setDepartments(response.data || []);
        } catch (error) {
            console.error('Failed to load departments', error);
        }
    };

    const fetchMapData = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filterDepartment) params.departmentId = filterDepartment;
            if (filterStatus) params.status = filterStatus;

            const [complaintsRes, statsRes] = await Promise.allSettled([
                apiService.citizen.getMapData(),
                apiService.map.getStatistics(params)
            ]);

            if (complaintsRes.status === 'fulfilled') {
                const complaintData = complaintsRes.value.data?.complaints || complaintsRes.value.data || [];
                // Handle various response structures
                const validComplaints = (Array.isArray(complaintData) ? complaintData : [])
                    .filter(c => c.latitude && c.longitude);
                setComplaints(validComplaints);
            }

            if (statsRes.status === 'fulfilled') {
                setStats(statsRes.value.data || statsRes.value);
            }
        } catch (error) {
            console.error('Map data error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Create custom marker icons based on status
    const createCustomIcon = (status) => {
        let color = '#1254AF'; // Default Blue
        if (status === 'IN_PROGRESS') color = '#F59E0B'; // Amber
        if (status === 'RESOLVED') color = '#10B981'; // Green
        if (status === 'CLOSED') color = '#6B7280'; // Gray
        if (status === 'PENDING' || status === 'SUBMITTED') color = '#EF4444'; // Red

        return L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.1);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
    };

    const defaultCenter = [18.5204, 73.8567]; // Pune coordinates

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="PMC Citizen Portal"
                title="Issue map"
                subtitle="Visualize and track reported municipal issues in your area."
                icon={MapIcon}
                showProfileInitials={true}
            />

            <div className="container-fluid px-3 px-lg-5" style={{ marginTop: '-40px' }}>
                <div className="card border-0 shadow-premium rounded-4 bg-white p-4 mb-5 overflow-hidden">
                    <div className="row g-4 align-items-center">
                        <div className="col-lg-4">
                            <div className="d-flex align-items-center gap-3">
                                <div className="p-2 bg-primary bg-opacity-10 text-primary rounded-3">
                                    <Filter size={20} />
                                </div>
                                <h6 className="fw-bold mb-0 text-dark uppercase-tracking">Filter Dashboard</h6>
                            </div>
                        </div>
                        <div className="col-lg-8">
                            <div className="d-flex flex-wrap gap-3 justify-content-lg-end">
                                <div className="p-3 bg-light rounded-pill border d-flex align-items-center gap-2 px-4 shadow-sm transition-all hover-up-small">
                                    <Building2 size={16} className="text-primary" />
                                    <select
                                        className="form-select bg-transparent border-0 fw-black extra-small text-uppercase tracking-widest shadow-none p-0 pe-4 cursor-pointer"
                                        style={{ width: 'auto', minWidth: '180px' }}
                                        value={filterDepartment}
                                        onChange={(e) => setFilterDepartment(e.target.value)}
                                    >
                                        <option value="">UNIT: ALL DEPTS</option>
                                        {departments.map(dept => (
                                            <option key={dept.departmentId} value={dept.departmentId}>
                                                {dept.name || dept.departmentName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="p-3 bg-light rounded-pill border d-flex align-items-center gap-2 px-4 shadow-sm transition-all hover-up-small">
                                    <Activity size={16} className="text-primary" />
                                    <select
                                        className="form-select bg-transparent border-0 fw-black extra-small text-uppercase tracking-widest shadow-none p-0 pe-4 cursor-pointer"
                                        style={{ width: 'auto', minWidth: '150px' }}
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="">STATUS: ALL</option>
                                        <option value="PENDING">PENDING</option>
                                        <option value="IN_PROGRESS">IN PROGRESS</option>
                                        <option value="RESOLVED">RESOLVED</option>
                                        <option value="CLOSED">CLOSED</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-fluid" style={{ maxWidth: '1400px' }}>
                <div className="row g-4">
                    {/* Stats Sidebar */}
                    <div className="col-lg-3">
                        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4 overflow-hidden">
                            <h6 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                                <Activity size={18} style={{ color: '#1254AF' }} />
                                Map statistics
                            </h6>
                            <div className="d-flex flex-column gap-3">
                                <div className="p-3 rounded-4 bg-light border-start border-4 border-primary">
                                    <span className="small fw-bold text-muted uppercase d-block mb-1">Total shown</span>
                                    <span className="fw-bold fs-3 text-dark">{complaints.length}</span>
                                </div>
                                {stats && (
                                    <>
                                        <div className="p-3 rounded-4 bg-light border-start border-4 border-warning">
                                            <span className="small fw-bold text-muted uppercase d-block mb-1">In progress</span>
                                            <span className="fw-bold fs-3 text-dark">{stats.inProgress || 0}</span>
                                        </div>
                                        <div className="p-3 rounded-4 bg-light border-start border-4 border-success">
                                            <span className="small fw-bold text-muted uppercase d-block mb-1">Resolved</span>
                                            <span className="fw-bold fs-3 text-dark">{stats.resolved || stats.closed || 0}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                            <h6 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                                <Layers size={18} style={{ color: '#1254AF' }} />
                                Status key
                            </h6>
                            <div className="d-flex flex-column gap-3 mt-2">
                                {[
                                    { label: 'New / Pending', color: '#EF4444' },
                                    { label: 'In progress', color: '#F59E0B' },
                                    { label: 'Resolved', color: '#10B981' },
                                    { label: 'Closed', color: '#6B7280' }
                                ].map((item, i) => (
                                    <div key={i} className="d-flex align-items-center gap-2">
                                        <div style={{ width: '12px', height: '12px', backgroundColor: item.color, borderRadius: '3px' }}></div>
                                        <span className="small fw-bold text-muted uppercase tracking-wider">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Map Container */}
                    <div className="col-lg-9">
                        <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ height: '700px' }}>
                            {loading ? (
                                <div className="d-flex flex-column justify-content-center align-items-center h-100 bg-white">
                                    <RefreshCw className="animate-spin text-primary mb-4" size={56} style={{ color: '#1254AF' }} />
                                    <p className="fw-bold text-muted">Updating map data...</p>
                                </div>
                            ) : complaints.length === 0 ? (
                                <div className="d-flex flex-column justify-content-center align-items-center h-100 bg-white">
                                    <MapPin size={64} className="text-muted opacity-25 mb-4 mx-auto" />
                                    <h5 className="fw-bold text-dark mb-2">No active reports on map</h5>
                                    <p className="text-muted small">Try adjusting your filters or search area.</p>
                                </div>
                            ) : (
                                <MapContainer
                                    center={defaultCenter}
                                    zoom={12}
                                    style={{ height: '100%', width: '100%' }}
                                    scrollWheelZoom={true}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                    />
                                    <RecenterMap items={complaints} />
                                    {complaints.map((complaint) => (
                                        <Marker
                                            key={complaint.id || complaint.complaintId}
                                            position={[complaint.latitude, complaint.longitude]}
                                            icon={createCustomIcon(complaint.status)}
                                        >
                                            <Popup maxWidth={300} className="custom-map-popup">
                                                <div className="p-3">
                                                    <div className="d-flex justify-content-between align-items-start mb-3 border-bottom pb-2">
                                                        <div className="d-flex flex-column">
                                                            <span className="small fw-bold text-primary mb-1">#{complaint.id || complaint.complaintId}</span>
                                                            <span className="small text-muted fw-bold">{new Date(complaint.createdAt || complaint.complaintDate).toLocaleDateString()}</span>
                                                        </div>
                                                        <StatusBadge status={complaint.status} size="sm" />
                                                    </div>
                                                    <h6 className="fw-bold text-dark mb-2">{complaint.title}</h6>
                                                    <p className="small text-muted mb-3 opacity-75">"{complaint.description?.substring(0, 80)}..."</p>
                                                    <div className="d-flex flex-column gap-2 mb-4 bg-light p-2 rounded-4">
                                                        <div className="d-flex align-items-center gap-2 small text-dark fw-bold">
                                                            <Building2 size={12} className="text-primary" />
                                                            <span>{complaint.departmentName || 'General'}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => navigate(`/citizen/complaint/${complaint.id || complaint.complaintId}`)}
                                                        className="btn btn-primary w-100 rounded-pill fw-bold small shadow-sm py-2 border-0"
                                                        style={{ backgroundColor: '#1254AF' }}
                                                    >
                                                        <Eye size={14} className="me-2" /> View details
                                                    </button>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .leaflet-popup-content-wrapper { border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important; font-family: inherit; }
                .leaflet-popup-content { margin: 0; }
                .leaflet-container { font-family: inherit; }
            `}} />
        </div>
    );
};

export default CitizenMap;
