/**
 * Advanced Admin Tactical Map
 * Real-time visualization of city-wide grievances with SLA tracking.
 */

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
    Navigation, Filter, AlertTriangle, CheckCircle,
    Clock, RefreshCw, Maximize2, Crosshair,
    ShieldAlert, Building2, MapPin, Layers, X, Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import StatusBadge from '../../components/ui/StatusBadge';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Market Icon Generator
const createCustomIcon = (status, slaStatus) => {
    let color = '#244799';

    if (slaStatus === 'BREACHED') {
        color = '#EF4444'; // Red for Breaches
    } else {
        switch (status) {
            case 'SUBMITTED': color = '#6366F1'; break;
            case 'APPROVED': color = '#3B82F6'; break;
            case 'ASSIGNED': color = '#06B6D4'; break;
            case 'IN_PROGRESS': color = '#F59E0B'; break;
            case 'RESOLVED': color = '#10B981'; break;
            case 'CLOSED': color = '#475569'; break;
            case 'REJECTED': color = '#EF4444'; break;
            default: color = '#244799';
        }
    }

    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            background-color: ${color}; 
            width: 28px; 
            height: 28px; 
            border-radius: 50%; 
            border: 3px solid white;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
        ">
            <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
    });
};

const MapController = ({ complaints }) => {
    const map = useMap();
    useEffect(() => {
        if (complaints.length > 0) {
            const validCoords = complaints.filter(c => c.latitude && c.longitude);
            if (validCoords.length > 0) {
                const bounds = L.latLngBounds(validCoords.map(c => [c.latitude, c.longitude]));
                map.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 });
            }
        }
    }, [complaints, map]);
    return null;
};

const AdminMap = () => {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterWard, setFilterWard] = useState('ALL');
    const [filterDept, setFilterDept] = useState('ALL');
    const [stats, setStats] = useState({ total: 0, critical: 0, active: 0, resolved: 0 });
    const [wards, setWards] = useState([]);
    const [departments, setDepartments] = useState([]);
    const PRIMARY_COLOR = '#173470';

    useEffect(() => {
        fetchMapData();
        loadMetadata();

        const interval = setInterval(fetchMapData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadMetadata = async () => {
        try {
            const [wardsRes, deptsRes] = await Promise.all([
                apiService.common.getWards(),
                apiService.common.getDepartments()
            ]);
            setWards(wardsRes.data || wardsRes || []);
            setDepartments(deptsRes.data || deptsRes || []);
        } catch (err) {
            console.error('Metadata load failure:', err);
        }
    };

    const fetchMapData = async () => {
        try {
            setLoading(true);
            const response = await apiService.admin.getCityMap();
            const data = response.data || response || [];
            const list = Array.isArray(data) ? data : (data.complaints || []);

            setComplaints(list);
            updateStats(list);
        } catch (error) {
            console.error('Projection failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStats = (data) => {
        setStats({
            total: data.length,
            critical: data.filter(c => c.slaStatus === 'BREACHED' || c.priority === 'CRITICAL').length,
            active: data.filter(c => ['ASSIGNED', 'IN_PROGRESS'].includes(c.status)).length,
            resolved: data.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length
        });
    };

    const filteredComplaints = complaints.filter(c => {
        const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
        const matchesWard = filterWard === 'ALL' || (c.wardByWardId?.wardId || c.wardId)?.toString() === filterWard;
        const matchesDept = filterDept === 'ALL' || (c.departmentByDepartmentId?.departmentId || c.departmentId)?.toString() === filterDept;
        return matchesStatus && matchesWard && matchesDept;
    });

    return (
        <div className="admin-tactical-map-premium h-100 position-relative bg-white shadow-premium rounded-4 overflow-hidden" style={{ minHeight: '750px' }}>
            {/* Control HUD Overlay */}
            <div className="position-absolute top-0 start-0 p-4 w-100 d-flex flex-column flex-md-row gap-4 pointer-events-none" style={{ zIndex: 1000 }}>
                <div className="card border-0 shadow-premium rounded-4 bg-white bg-opacity-95 backdrop-blur pointer-events-auto" style={{ width: '100%', maxWidth: '340px' }}>
                    <div className="p-3 bg-primary text-white d-flex align-items-center gap-3 rounded-top-4" style={{ backgroundColor: PRIMARY_COLOR }}>
                        <div className="rounded-circle p-1 bg-white bg-opacity-20"><Layers size={16} /></div>
                        <h6 className="fw-black mb-0 extra-small tracking-widest uppercase">Map Overview</h6>
                    </div>

                    <div className="card-body p-4 p-xl-5">
                        <div className="d-flex flex-column gap-4">
                            <div>
                                <label className="extra-small fw-black text-muted uppercase tracking-widest mb-2 d-block opacity-40">Status</label>
                                <select className="form-select border-0 bg-light rounded-pill px-4 py-2 small fw-black shadow-sm pointer-pointer" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                    <option value="ALL">ALL STATES</option>
                                    <option value="SUBMITTED">SUBMITTED</option>
                                    <option value="IN_PROGRESS">IN PROGRESS</option>
                                    <option value="RESOLVED">RESOLVED</option>
                                    <option value="CLOSED">CLOSED</option>
                                </select>
                            </div>

                            <div className="row g-3">
                                <div className="col-6">
                                    <label className="extra-small fw-black text-muted uppercase tracking-widest mb-2 d-block opacity-40">Ward</label>
                                    <select className="form-select border-0 bg-light rounded-pill px-4 py-2 extra-small fw-black shadow-sm pointer-pointer" value={filterWard} onChange={e => setFilterWard(e.target.value)}>
                                        <option value="ALL">GLOBAL</option>
                                        {wards.map(w => <option key={w.wardId || w.id} value={w.wardId || w.id}>{w.areaName?.toUpperCase()}</option>)}
                                    </select>
                                </div>
                                <div className="col-6">
                                    <label className="extra-small fw-black text-muted uppercase tracking-widest mb-2 d-block opacity-40">Department</label>
                                    <select className="form-select border-0 bg-light rounded-pill px-4 py-2 extra-small fw-black shadow-sm pointer-pointer" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                                        <option value="ALL">ALL UNITS</option>
                                        {departments.map(d => <option key={d.departmentId || d.id} value={d.departmentId || d.id}>{d.departmentName?.toUpperCase()}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="row g-2 mt-5">
                            <div className="col-6">
                                <div className="p-3 rounded-4 bg-light text-center border-dashed border-2">
                                    <div className="extra-small fw-black text-primary uppercase">Satellite View</div>
                                    <div className="h4 fw-black text-dark mb-0">{stats.total}</div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="p-3 rounded-4 bg-danger text-white border-0 text-center shadow-lg transition-all hover-up-tiny">
                                    <div className="extra-small fw-black uppercase opacity-80 mb-1 text-white">Critical</div>
                                    <div className="h4 fw-black mb-0 text-white">{stats.critical}</div>
                                </div>
                            </div>
                        </div>

                        <button onClick={fetchMapData} className="btn btn-primary w-100 py-3 rounded-4 fw-black extra-small uppercase d-flex align-items-center justify-content-center gap-2 shadow-lg border-0 transition-all hover-up" style={{ backgroundColor: PRIMARY_COLOR }}>
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> REFRESH MAP
                        </button>
                    </div>
                </div>
            </div>

            {/* Legend Dock */}
            <div className="position-absolute bottom-0 start-50 translate-middle-x p-4 w-100 d-flex justify-content-center pointer-events-none" style={{ zIndex: 1000 }}>
                <div className="bg-white bg-opacity-95 backdrop-blur p-3 rounded-pill shadow-premium border d-flex gap-4 align-items-center px-5 pointer-events-auto transition-all hover-up-tiny">
                    {[
                        { label: 'New', color: '#6366F1' },
                        { label: 'Active', color: '#F59E0B' },
                        { label: 'Resolved', color: '#10B981' },
                        { label: 'Breach', color: '#EF4444' }
                    ].map((item, i) => (
                        <div key={i} className="d-flex align-items-center gap-2">
                            <div className="rounded-circle shadow-sm" style={{ width: '12px', height: '12px', backgroundColor: item.color }}></div>
                            <span className="extra-small fw-black text-muted uppercase opacity-40">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Leaflet Strategic Layer */}
            <MapContainer
                center={[18.5204, 73.8567]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; CARTO'
                />

                <MapController complaints={filteredComplaints} />

                {filteredComplaints.map(complaint => (
                    complaint.latitude && complaint.longitude && (
                        <Marker
                            key={complaint.complaintId || complaint.id}
                            position={[complaint.latitude, complaint.longitude]}
                            icon={createCustomIcon(complaint.status, complaint.slaStatus)}
                        >
                            <Popup className="premium-map-popup">
                                <div className="p-3" style={{ width: '280px' }}>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="extra-small fw-black text-primary px-3 py-1 bg-light rounded-pill" style={{ color: PRIMARY_COLOR }}>#{complaint.complaintId || complaint.id}</span>
                                        <StatusBadge status={complaint.status} size="sm" />
                                    </div>

                                    <h6 className="fw-black text-dark mb-3 uppercase lh-sm">{complaint.title}</h6>

                                    <div className="d-flex flex-column gap-2 mb-4 bg-light p-3 rounded-4 border-dashed border">
                                        <div className="extra-small text-muted fw-black d-flex align-items-center gap-2 uppercase">
                                            <Building2 size={12} className="text-primary opacity-40" /> {complaint.departmentName || 'GENERAL UNIT'}
                                        </div>
                                        <div className="extra-small text-muted fw-black d-flex align-items-center gap-2 uppercase">
                                            <MapPin size={12} className="text-primary opacity-40" /> {complaint.wardName || 'CENTRAL SECTOR'}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/admin/complaints/${complaint.complaintId || complaint.id}`)}
                                        className="btn btn-primary w-100 py-3 extra-small fw-black rounded-pill border-0 shadow-premium uppercase transition-all hover-up-tiny"
                                        style={{ backgroundColor: PRIMARY_COLOR }}
                                    >
                                        INSPECT RECORD
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>

            <style dangerouslySetInnerHTML={{
                __html: `
                .premium-map-popup .leaflet-popup-content-wrapper { 
                    border-radius: 20px; 
                    padding: 0; 
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(0,0,0,0.05);
                }
                .premium-map-popup .leaflet-popup-content { margin: 0; width: auto !important; }
                .animate-spin { animation: spin 1s linear infinite; }
                .hover-up:hover { transform: translateY(-6px); }
                .hover-up-tiny:hover { transform: translateY(-2px); }
                .backdrop-blur { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
                .pointer-events-none { pointer-events: none; }
                .pointer-events-auto { pointer-events: auto; }
                .pointer-pointer { cursor: pointer; }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02); }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .extra-small { font-size: 0.65rem; }
            `}} />
        </div>
    );
};

export default AdminMap;
