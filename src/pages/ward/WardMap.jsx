import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import apiService from '../../api/apiService';
import {
    Map as MapIcon, Filter, Layers, Navigation, ChevronRight,
    Loader, AlertCircle, RefreshCw, Smartphone, Search, Maximize,
    Database, Activity, Info, X, MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Simple custom marker icons with refined colors
const createCustomIcon = (status) => {
    let color = '#244799'; // Default Blue
    if (status === 'IN_PROGRESS') color = '#F59E0B'; // Amber
    if (status === 'RESOLVED') color = '#10B981'; // Green
    if (status === 'CLOSED') color = '#6B7280'; // Gray
    if (status === 'PENDING') color = '#EF4444'; // Red

    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
};

const WardMap = () => {
    const navigate = useNavigate();
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchMapData();
    }, []);

    const fetchMapData = async () => {
        try {
            setLoading(true);
            const response = await apiService.wardOfficer.getMapData();
            const data = response.data || response;
            setLocations(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Ward Map data sync failed:', err);
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
        <div className="d-flex flex-column justify-content-center align-items-center h-100 bg-light rounded-0 min-vh-50" style={{ backgroundColor: '#F8FAFC' }}>
            <Loader className="animate-spin text-primary mb-3" size={40} style={{ color: '#244799' }} />
            <p className="fw-black extra-small text-muted text-uppercase tracking-widest">Scanning Ward Node...</p>
        </div>
    );

    return (
        <div className="h-100 d-flex flex-column bg-light rounded-0 overflow-hidden border border-light shadow-sm" style={{ minHeight: '600px', backgroundColor: '#F8FAFC' }}>
            {/* Map Header */}
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center" style={{ backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' }}>
                <div className="d-flex align-items-center gap-2">
                    <div className="p-2 rounded-0 bg-white bg-opacity-10 text-white border border-white border-opacity-20 shadow-sm">
                        <MapIcon size={20} />
                    </div>
                    <div>
                        <h6 className="fw-black mb-0 text-uppercase tracking-wider extra-small text-white">Ward Monitoring Matrix</h6>
                        <small className="text-white fw-bold extra-small tracking-widest opacity-75">LIVE TACTICAL FEED</small>
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
                        <option value="PENDING">PENDING</option>
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
                                        <span className="fw-black text-primary extra-small tracking-tighter">ID: #{loc.complaintId || loc.id}</span>
                                        <span className={`badge rounded-0 fw-bold extra-small ${loc.status === 'RESOLVED' ? 'bg-success' : 'bg-primary'}`}>{loc.status}</span>
                                    </div>
                                    <h6 className="fw-bold text-dark small mb-2">{loc.title || 'Untitled Case'}</h6>
                                    <div className="extra-small text-muted mb-3 d-flex align-items-center gap-1">
                                        <MapPin size={10} /> {loc.department || 'Ward Level'}
                                    </div>
                                    <button
                                        onClick={() => navigate(`/ward-officer/complaints/${loc.complaintId || loc.id}`)}
                                        className="btn btn-primary btn-sm w-100 rounded-0 extra-small fw-black d-flex align-items-center justify-content-center gap-1 shadow-sm mt-1"
                                        style={{ backgroundColor: '#244799' }}
                                    >
                                        VIEW DETAILS <ChevronRight size={12} />
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                {/* Legend Overlay */}
                <div className="position-absolute bottom-0 start-0 m-3 p-3 bg-white bg-opacity-90 backdrop-blur rounded-0 shadow-premium border border-light" style={{ zIndex: 1000, minWidth: '150px' }}>
                    <h6 className="fw-black extra-small text-dark mb-3 text-uppercase tracking-widest border-bottom border-light pb-2">Legend</h6>
                    <div className="d-flex flex-column gap-2">
                        {[
                            { label: 'PENDING', color: '#EF4444' },
                            { label: 'ASSIGNED', color: '#1254AF' },
                            { label: 'WORKING', color: '#F59E0B' },
                            { label: 'RESOLVED', color: '#10B981' }
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
                .tactical-popup .leaflet-popup-content-wrapper { border-radius: 16px; padding: 0; overflow: hidden; }
                .tactical-popup .leaflet-popup-content { margin: 0; }
                .hover-up:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important; }
                .min-vh-50 { min-height: 50vh; }
            `}} />
        </div>
    );
};

export default WardMap;
