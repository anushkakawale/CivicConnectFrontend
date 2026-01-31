import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Filter, MapPin, RefreshCw } from 'lucide-react';
import apiService from '../../api/apiService';
import 'leaflet/dist/leaflet.css';
import './ComplaintMap.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ComplaintMap = ({ role, userId, wardId, departmentId, onComplaintClick }) => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [wards, setWards] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [filters, setFilters] = useState({
        status: 'ALL',
        department: 'ALL',
        ward: wardId || 'ALL'
    });

    const center = [18.5204, 73.8567]; // Pune coordinates

    useEffect(() => {
        loadMasterData();
    }, []);

    useEffect(() => {
        loadComplaints();
    }, [filters, role, wardId, departmentId]);

    const loadMasterData = async () => {
        try {
            const [wardsData, deptsData] = await Promise.all([
                apiService.common.getWards(),
                apiService.common.getDepartments()
            ]);
            setWards(wardsData);
            setDepartments(deptsData);
        } catch (error) {
            console.error('Failed to load master data:', error);
        }
    };

    const loadComplaints = async () => {
        try {
            setLoading(true);
            console.log('🗺️ Loading map data for role:', role);

            let params = {};

            // Role-based filtering
            switch (role) {
                case 'CITIZEN':
                    // Show only own ward complaints
                    params.wardId = wardId;
                    break;

                case 'WARD_OFFICER':
                    // Show all complaints in officer's ward
                    params.wardId = wardId;
                    break;

                case 'DEPARTMENT_OFFICER':
                    // Show assigned complaints in their ward and department
                    params.wardId = wardId;
                    params.departmentId = departmentId;
                    params.assignedTo = userId;
                    break;

                case 'ADMIN':
                    // Show all complaints with filters
                    if (filters.ward !== 'ALL') params.wardId = filters.ward;
                    if (filters.department !== 'ALL') params.departmentId = filters.department;
                    break;
            }

            // Add status filter
            if (filters.status !== 'ALL') {
                params.status = filters.status;
            }

            const data = await apiService.map.getComplaintsForMap(params);
            console.log('✅ Map data loaded:', data?.length || 0, 'complaints');
            setComplaints(data || []);
        } catch (error) {
            console.error('❌ Failed to load map data:', error);
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    const getMarkerIcon = (status) => {
        const colors = {
            'SUBMITTED': '#3b82f6',    // Blue
            'APPROVED': '#8b5cf6',      // Purple
            'ASSIGNED': '#f59e0b',      // Amber
            'IN_PROGRESS': '#f97316',   // Orange
            'RESOLVED': '#10b981',      // Green
            'CLOSED': '#6b7280',        // Gray
            'REJECTED': '#ef4444'       // Red
        };

        const color = colors[status] || '#6b7280';

        return L.divIcon({
            className: 'custom-marker',
            html: `
        <div style="
          background-color: ${color};
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          </svg>
        </div>
      `,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
        });
    };

    const getStatusBadgeClass = (status) => {
        const classes = {
            'SUBMITTED': 'status-submitted',
            'APPROVED': 'status-approved',
            'ASSIGNED': 'status-assigned',
            'IN_PROGRESS': 'status-in-progress',
            'RESOLVED': 'status-resolved',
            'CLOSED': 'status-closed',
            'REJECTED': 'status-rejected'
        };
        return classes[status] || 'status-default';
    };

    const handleComplaintClick = (complaintId) => {
        if (onComplaintClick) {
            onComplaintClick(complaintId);
        }
    };

    return (
        <div className="complaint-map-container">
            {/* Filters */}
            <div className="map-filters-panel">
                <div className="filters-header">
                    <div className="filters-title">
                        <Filter className="w-5 h-5" />
                        <h3>Map Filters</h3>
                    </div>
                    <button
                        onClick={loadComplaints}
                        className="refresh-button"
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                <div className="filters-content">
                    {/* Status Filter */}
                    <div className="filter-group">
                        <label>Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="filter-select"
                        >
                            <option value="ALL">All Status</option>
                            <option value="SUBMITTED">Submitted</option>
                            <option value="APPROVED">Approved</option>
                            <option value="ASSIGNED">Assigned</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="CLOSED">Closed</option>
                        </select>
                    </div>

                    {/* Admin-only filters */}
                    {role === 'ADMIN' && (
                        <>
                            <div className="filter-group">
                                <label>Ward</label>
                                <select
                                    value={filters.ward}
                                    onChange={(e) => setFilters({ ...filters, ward: e.target.value })}
                                    className="filter-select"
                                >
                                    <option value="ALL">All Wards</option>
                                    {wards.map(ward => (
                                        <option key={ward.wardId} value={ward.wardId}>
                                            {ward.wardName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Department</label>
                                <select
                                    value={filters.department}
                                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                                    className="filter-select"
                                >
                                    <option value="ALL">All Departments</option>
                                    {departments.map(dept => (
                                        <option key={dept.departmentId} value={dept.departmentId}>
                                            {dept.departmentName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {/* Stats */}
                    <div className="map-stats">
                        <div className="stat-item">
                            <MapPin className="w-4 h-4" />
                            <span>{complaints.length} Complaints</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="map-wrapper">
                {loading && (
                    <div className="map-loading-overlay">
                        <div className="loader-spinner"></div>
                        <p>Loading complaints...</p>
                    </div>
                )}

                <MapContainer
                    center={center}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    className="complaint-map"
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    {complaints.map((complaint) => (
                        <Marker
                            key={complaint.complaintId}
                            position={[complaint.latitude, complaint.longitude]}
                            icon={getMarkerIcon(complaint.status)}
                        >
                            <Popup className="complaint-popup">
                                <div className="popup-content">
                                    <h4 className="popup-title">{complaint.title}</h4>

                                    <div className="popup-details">
                                        <div className="detail-row">
                                            <span className="detail-label">ID:</span>
                                            <span className="detail-value">CMP-{complaint.complaintId}</span>
                                        </div>

                                        <div className="detail-row">
                                            <span className="detail-label">Status:</span>
                                            <span className={`status-badge ${getStatusBadgeClass(complaint.status)}`}>
                                                {complaint.status}
                                            </span>
                                        </div>

                                        <div className="detail-row">
                                            <span className="detail-label">Category:</span>
                                            <span className="detail-value">{complaint.category}</span>
                                        </div>

                                        {complaint.priority && (
                                            <div className="detail-row">
                                                <span className="detail-label">Priority:</span>
                                                <span className={`priority-badge priority-${complaint.priority.toLowerCase()}`}>
                                                    {complaint.priority}
                                                </span>
                                            </div>
                                        )}

                                        <div className="detail-row">
                                            <span className="detail-label">Date:</span>
                                            <span className="detail-value">
                                                {new Date(complaint.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleComplaintClick(complaint.complaintId)}
                                        className="view-details-btn"
                                    >
                                        View Full Details
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Legend */}
            <div className="map-legend">
                <h4>Status Legend</h4>
                <div className="legend-items">
                    <div className="legend-item">
                        <div className="legend-marker" style={{ backgroundColor: '#3b82f6' }}></div>
                        <span>Submitted</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-marker" style={{ backgroundColor: '#f97316' }}></div>
                        <span>In Progress</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-marker" style={{ backgroundColor: '#10b981' }}></div>
                        <span>Resolved</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-marker" style={{ backgroundColor: '#6b7280' }}></div>
                        <span>Closed</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplaintMap;
