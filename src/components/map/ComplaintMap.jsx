import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Filter, MapPin, RefreshCw, Layers } from 'lucide-react';
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
            let params = {};
            let responseData = [];

            if (filters.status !== 'ALL') {
                params.status = filters.status;
            }

            switch (role) {
                case 'CITIZEN':
                    try {
                        const res = await apiService.citizen.getMapData();
                        responseData = Array.isArray(res) ? res : (res.data || []);
                    } catch (e) {
                        // Fallback if specific endpoint not ready yet
                        params.wardId = wardId;
                        const res = await apiService.map.getActiveComplaints(params);
                        responseData = res;
                    }
                    break;
                case 'WARD_OFFICER':
                    try {
                        const res = await apiService.wardOfficer.getMapData();
                        responseData = Array.isArray(res) ? res : (res.data || []);
                    } catch (e) {
                        params.wardId = wardId;
                        const res = await apiService.map.getActiveComplaints(params);
                        responseData = res;
                    }
                    break;
                case 'DEPARTMENT_OFFICER':
                    try {
                        const res = await apiService.departmentOfficer.getMapData();
                        responseData = Array.isArray(res) ? res : (res.data || []);
                    } catch (e) {
                        params.wardId = wardId;
                        params.departmentId = departmentId;
                        params.assignedTo = userId;
                        const res = await apiService.map.getActiveComplaints(params);
                        responseData = res;
                    }
                    break;
                case 'ADMIN':
                    if (filters.ward !== 'ALL') params.wardId = filters.ward;
                    if (filters.department !== 'ALL') params.departmentId = filters.department;

                    try {
                        let res;
                        if (filters.ward !== 'ALL') {
                            res = await apiService.admin.getWardMap(filters.ward);
                        } else {
                            res = await apiService.admin.getCityMap();
                        }
                        responseData = Array.isArray(res) ? res : (res.data || []);
                    } catch (e) {
                        const res = await apiService.map.getActiveComplaints(params);
                        responseData = res;
                    }
                    break;
                default:
                    const res = await apiService.map.getActiveComplaints(params); // Fallback
                    responseData = res;
                    break;
            }

            // Client-side filtering if API returns everything
            if (filters.status !== 'ALL' && Array.isArray(responseData)) {
                responseData = responseData.filter(c => c.status === filters.status);
            }

            setComplaints(responseData || []);
        } catch (error) {
            console.error('Failed to load map data:', error);
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    const getMarkerIcon = (status) => {
        const colors = {
            'SUBMITTED': '#3b82f6',
            'APPROVED': '#8b5cf6',
            'ASSIGNED': '#f59e0b',
            'IN_PROGRESS': '#f97316',
            'RESOLVED': '#10b981',
            'CLOSED': '#6b7280',
            'REJECTED': '#ef4444'
        };
        const color = colors[status] || '#6b7280';

        return L.divIcon({
            className: 'custom-marker',
            html: `
        <div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5" fill="rgba(0,0,0,0.2)"/>
          </svg>
        </div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -32]
        });
    };

    return (
        <div className="complaint-map-container">
            <div className={`map-filters-panel ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="filters-header">
                    <div className="filters-title">
                        <Filter className="w-5 h-5 text-blue-600" />
                        <h3>Smart Filters</h3>
                    </div>
                    <button onClick={loadComplaints} className="refresh-button">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="filters-content">
                    <div className="filter-group">
                        <label>Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="filter-select"
                        >
                            <option value="ALL">All Active</option>
                            <option value="SUBMITTED">Submitted</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                        </select>
                    </div>

                    {role === 'ADMIN' && (
                        <>
                            <div className="filter-group">
                                <label>Ward</label>
                                <select value={filters.ward} onChange={(e) => setFilters({ ...filters, ward: e.target.value })} className="filter-select">
                                    <option value="ALL">Entire City</option>
                                    {wards.map(w => <option key={w.wardId} value={w.wardId}>{w.wardName}</option>)}
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Department</label>
                                <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })} className="filter-select">
                                    <option value="ALL">All Depts</option>
                                    {departments.map(d => <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>)}
                                </select>
                            </div>
                        </>
                    )}

                    <div className="map-stats mt-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                            <Layers className="w-4 h-4 text-slate-400" />
                            <span>{complaints.length} Visible Pins</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="map-wrapper">
                <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} className="complaint-map">
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                    />
                    {complaints.map((c) => (
                        <Marker key={c.complaintId || c.id} position={[c.latitude, c.longitude]} icon={getMarkerIcon(c.status)}>
                            <Popup className="complaint-popup-premium">
                                <div className="p-1 min-w-[200px]">
                                    {c.imageUrl && (
                                        <div className="w-full h-32 mb-3 rounded-lg overflow-hidden relative bg-slate-100">
                                            <img src={c.imageUrl} alt="Issue" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                                            <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
                                                {c.departmentName || 'General'}
                                            </div>
                                        </div>
                                    )}
                                    <h4 className="font-bold text-slate-900 mb-1 line-clamp-1">{c.title}</h4>
                                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{c.description}</p>

                                    <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider mb-3">
                                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-0">{c.wardName}</span>
                                        <span className={`px-2 py-1 rounded-0 ${c.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {c.status}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => onComplaintClick && onComplaintClick(c.complaintId || c.id)}
                                        className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default ComplaintMap;
