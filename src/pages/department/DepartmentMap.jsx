import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import apiService from '../../api/apiService';
import {
    Map as MapIcon, Filter, Layers, Navigation, ChevronRight,
    Loader, AlertCircle, RefreshCw, Smartphone, Search, Maximize,
    Database, Activity, Info, Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Simple custom marker icons with refined colors
const createCustomIcon = (status) => {
    let color = '#1254AF'; // Default Blue
    if (status === 'IN_PROGRESS') color = '#F59E0B'; // Amber
    if (status === 'RESOLVED') color = '#10B981'; // Green
    if (status === 'CLOSED') color = '#6B7280'; // Gray
    if (status === 'PENDING') color = '#6366F1'; // Indigo

    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 0; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
};

const DepartmentMap = () => {
    const navigate = useNavigate();
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [refreshing, setRefreshing] = useState(false);
    const [restricted, setRestricted] = useState(false);

    useEffect(() => {
        fetchMapData();
    }, []);

    const fetchMapData = async () => {
        try {
            setLoading(true);
            setRestricted(false);
            const response = await apiService.departmentOfficer.getMapData();
            const data = response.data || response;
            setLocations(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Map data sync failed:', err);
            if (err.status === 403) {
                setRestricted(true);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchMapData();
    };

    const filteredLocations = filter === 'ALL'
        ? locations
        : locations.filter(loc => loc.status === filter);

    if (loading && !refreshing) return (
        <div className="d-flex flex-column justify-content-center align-items-center h-100 bg-light gov-rounded">
            <Loader className="animate-spin text-primary mb-3" size={40} style={{ color: '#1254AF' }} />
            <p className="fw-black extra-small text-muted text-uppercase tracking-widest">Loading Map View...</p>
        </div>
    );

    if (restricted) return (
        <div className="d-flex flex-column justify-content-center align-items-center h-100 bg-white gov-rounded p-5 text-center border">
            <div className="p-4 rounded-circle bg-danger bg-opacity-10 mb-4 border border-danger border-opacity-25">
                <AlertCircle size={48} className="text-danger" />
            </div>
            <h5 className="fw-black text-dark text-uppercase tracking-wider mb-2">Tactical Map Restricted</h5>
            <p className="extra-small text-muted fw-bold uppercase tracking-widest mb-4" style={{ maxWidth: '300px' }}>
                Your current authorization profile does not permit access to the geographic command coordinates.
            </p>
            <button onClick={handleRefresh} className="btn btn-primary rounded-pill px-5 py-2 fw-black extra-small tracking-widest" style={{ backgroundColor: '#1254AF' }}>
                RE-VALIDATE ACCESS
            </button>
        </div>
    );

    return (
        <div className="h-100 d-flex flex-column bg-white gov-rounded overflow-hidden border shadow-sm">
            {/* Map Header */}
            <div className="p-3 bg-white border-bottom d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                    <div className="p-2 rounded-0 bg-light text-primary border shadow-sm">
                        <Target size={20} />
                    </div>
                    <div>
                        <h6 className="fw-black mb-0 text-dark text-uppercase tracking-wider extra-small">Field Ops Intelligence Map</h6>
                        <small className="text-muted fw-bold extra-small tracking-widest opacity-75">GEOSPATIAL HUB | FORCE MONITOR</small>
                    </div>
                </div>
                <div className="d-flex gap-2">
                    <select
                        className="form-select form-select-sm rounded-0 fw-bold extra-small border shadow-sm px-3"
                        style={{ width: '130px' }}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="ALL">ALL STATUS</option>
                        <option value="ASSIGNED">ASSIGNED</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                    </select>
                    <button
                        onClick={handleRefresh}
                        className="btn btn-sm btn-light rounded-0 px-3 border shadow-sm transition-all hover-up d-flex align-items-center gap-2 extra-small fw-black"
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> REFRESH
                    </button>
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-grow-1 position-relative">
                <MapContainer
                    center={[18.5204, 73.8567]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <ZoomControl position="bottomright" />

                    {filteredLocations.map((loc, idx) => (
                        <Marker
                            key={idx}
                            position={[loc.latitude || 18.5204, loc.longitude || 73.8567]}
                            icon={createCustomIcon(loc.status)}
                        >
                            <Popup className="tactical-popup">
                                <div className="p-2" style={{ minWidth: '180px' }}>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="fw-black text-primary extra-small tracking-tighter">ID: #{loc.complaintId}</span>
                                        <span className={`badge rounded-0 fw-bold extra-small ${loc.status === 'RESOLVED' ? 'bg-success' : 'bg-primary'}`}>{loc.status}</span>
                                    </div>
                                    <h6 className="fw-bold text-dark small mb-2">{loc.title || 'Untitled Case'}</h6>
                                    <button
                                        onClick={() => navigate(`/department/complaints/${loc.complaintId}`)}
                                        className="btn btn-primary btn-sm w-100 rounded-0 extra-small fw-black d-flex align-items-center justify-content-center gap-1 shadow-sm mt-1"
                                        style={{ backgroundColor: '#1254AF' }}
                                    >
                                        VIEW DETAILS <ChevronRight size={12} />
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                {/* Legend Overlay */}
                <div className="position-absolute bottom-0 start-0 m-3 p-3 bg-white bg-opacity-90 backdrop-blur rounded-0 shadow-lg border border-white border-opacity-30" style={{ zIndex: 1000, minWidth: '150px' }}>
                    <h6 className="fw-black extra-small text-dark mb-3 text-uppercase tracking-widest border-bottom pb-2">Map Legend</h6>
                    <div className="d-flex flex-column gap-2">
                        {[
                            { label: 'ASSIGNED', color: '#1254AF' },
                            { label: 'WORKING', color: '#F59E0B' },
                            { label: 'RESOLVED', color: '#10B981' },
                            { label: 'INACTIVE', color: '#6B7280' }
                        ].map((item, i) => (
                            <div key={i} className="d-flex align-items-center gap-2">
                                <div style={{ width: '8px', height: '8px', backgroundColor: item.color, borderRadius: '0' }}></div>
                                <span className="extra-small fw-bold text-muted uppercase tracking-wider">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .fw-black { font-weight: 800; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.25em; }
                .tracking-wider { letter-spacing: 0.1em; }
                .tracking-tighter { letter-spacing: -0.02em; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .backdrop-blur { backdrop-filter: blur(8px); }
                .tactical-popup .leaflet-popup-content-wrapper { border-radius: 0; padding: 0; overflow: hidden; }
                .tactical-popup .leaflet-popup-content { margin: 0; }
                .hover-up:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important; }
            `}} />
        </div>
    );
};

export default DepartmentMap;
