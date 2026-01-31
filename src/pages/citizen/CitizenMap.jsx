import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Filter, AlertCircle, Loader } from 'lucide-react';
import apiService from '../../api/apiService';
import { StatusBadge, PriorityBadge } from '../../components/common';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues in React
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
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const RecenterMap = ({ items }) => {
    const map = useMap();
    useEffect(() => {
        if (items && items.length > 0) {
            const bounds = L.latLngBounds(items.map(c => [c.latitude, c.longitude]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [items, map]);
    return null;
};

const CitizenMap = () => {
    const [complaints, setComplaints] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterDepartment, setFilterDepartment] = useState('');
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        fetchMapData();
        fetchDepartments();
    }, [filterDepartment]);

    const fetchDepartments = async () => {
        try {
            const response = await apiService.masterData.getDepartments();
            setDepartments(response.data || []);
        } catch (error) {
            console.error('Failed to load departments', error);
            setDepartments([]);
        }
    };

    const fetchMapData = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filterDepartment) params.departmentId = filterDepartment;

            const [complaintsRes, statsRes] = await Promise.all([
                apiService.map.getActiveComplaints(params),
                apiService.map.getStatistics(params)
            ]);

            const complaintData = complaintsRes.data?.complaints || complaintsRes.data || [];
            setComplaints(Array.isArray(complaintData) ? complaintData : []);
            setStats(statsRes.data || {});

        } catch (error) {
            console.error('Failed to fetch map data:', error);
            setComplaints([]);
            setStats({});
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid py-4 h-100 d-flex flex-column">
            {/* Header */}
            <div className="row mb-4 align-items-center">
                <div className="col-md-6">
                    <h2 className="mb-1 fw-bold">
                        <MapPin className="me-2 text-primary" size={32} />
                        City Complaint Map
                    </h2>
                    <p className="text-muted mb-0">
                        View active complaints and works in your city
                    </p>
                </div>
                <div className="col-md-6 text-md-end mt-3 mt-md-0">
                    <div className="d-inline-block text-start">
                        <div className="input-group">
                            <span className="input-group-text bg-white">
                                <Filter size={18} />
                            </span>
                            <select
                                className="form-select"
                                value={filterDepartment}
                                onChange={(e) => setFilterDepartment(e.target.value)}
                            >
                                <option value="">All Departments</option>
                                {departments.map(d => (
                                    <option key={d.departmentId} value={d.departmentId}>
                                        {d.departmentName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="row g-3 mb-4">
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm bg-primary text-white h-100">
                            <div className="card-body">
                                <h3 className="mb-0">{stats.activeOnMap || 0}</h3>
                                <small className="text-white-50">Active on Map</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <h3 className="mb-0 text-warning">{stats.inProgress || 0}</h3>
                                <small className="text-muted">In Progress</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <h3 className="mb-0 text-success">{stats.resolved || 0}</h3>
                                <small className="text-muted">Resolved Works</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <h3 className="mb-0">{stats.total || 0}</h3>
                                <small className="text-muted">Total Complaints</small>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Map Container */}
            <div className="card border-0 shadow-sm flex-fill" style={{ minHeight: '500px' }}>
                <div className="card-body p-0 position-relative h-100 rounded overflow-hidden">
                    {loading && (
                        <div className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex justify-content-center align-items-center z-3">
                            <div className="text-center">
                                <div className="spinner-border text-primary mb-2" role="status"></div>
                                <p>Loading map data...</p>
                            </div>
                        </div>
                    )}

                    <MapContainer
                        center={[18.5204, 73.8567]} // Default to Pune
                        zoom={12}
                        style={{ height: '100%', width: '100%', minHeight: '500px' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {complaints.map((c) => (
                            <Marker
                                key={c.complaintId}
                                position={[c.latitude, c.longitude]}
                            >
                                <Popup>
                                    <div style={{ minWidth: '240px' }}>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="badge bg-primary">#{c.complaintId}</span>
                                            <small className="text-muted">{new Date(c.createdAt).toLocaleDateString()}</small>
                                        </div>
                                        <h6 className="mb-1 fw-bold">{c.title}</h6>
                                        <p className="small text-muted mb-2">{c.departmentName} • {c.wardName}</p>
                                        <p className="mb-2 small">{c.description}</p>
                                        <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                                            <span className={`badge bg-${c.status === 'IN_PROGRESS' ? 'warning' : 'primary'}`}>
                                                {c.status}
                                            </span>
                                            <span className={`badge bg-${c.priority === 'HIGH' || c.priority === 'CRITICAL' ? 'danger' : 'secondary'}`}>
                                                {c.priority}
                                            </span>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                        <RecenterMap items={complaints} />
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default CitizenMap;
