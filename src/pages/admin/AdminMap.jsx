/**
 * Admin Map View
 * Visualizes all complaints on a city map
 */

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
// Leaflet CSS is imported in main.jsx
import apiService from '../../api/apiService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

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

// Custom Icons based on status
const createStatusIcon = (color) => {
    return new L.DivIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });
};

const getStatusColor = (status) => {
    switch (status) {
        case 'RESOLVED': return '#10b981'; // Green
        case 'CLOSED': return '#6b7280'; // Gray
        case 'REJECTED': return '#ef4444'; // Red
        case 'IN_PROGRESS': return '#3b82f6'; // Blue
        case 'PENDING': return '#f59e0b'; // Orange
        default: return '#8b5cf6'; // Purple
    }
};

const RecenterMap = ({ items }) => {
    const map = useMap();
    useEffect(() => {
        if (items.length > 0) {
            // Calculate bounds
            const bounds = L.latLngBounds(items.map(c => [c.latitude || 18.5204, c.longitude || 73.8567]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [items, map]);
    return null;
};

const AdminMap = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            // Fetch large batch for map
            const response = await apiService.admin.getAllComplaints(0, 500);

            // Extract content safely
            const data = Array.isArray(response) ? response : (response.content || response.data || []);

            // Filter only items with valid coordinates
            const validData = data.filter(c =>
                c.latitude && c.longitude &&
                !isNaN(c.latitude) && !isNaN(c.longitude) &&
                c.latitude !== 0 && c.longitude !== 0
            );

            console.log(`Loaded ${validData.length} valid map points`);
            setComplaints(validData);
        } catch (error) {
            console.error('Failed to load map data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    const center = [18.5204, 73.8567]; // Pune center default

    return (
        <div style={{ height: 'calc(100vh - 100px)', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            <MapContainer
                center={center}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {complaints.map(complaint => (
                    <Marker
                        key={complaint.complaintId}
                        position={[complaint.latitude, complaint.longitude]}
                        icon={DefaultIcon} // Or use custom colorful icons if desired
                    >
                        <Popup>
                            <div style={{ minWidth: '200px' }}>
                                <h4 style={{ margin: '0 0 5px', fontSize: '14px', fontWeight: 'bold' }}>{complaint.title}</h4>
                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        background: getStatusColor(complaint.status) + '20',
                                        color: getStatusColor(complaint.status),
                                        fontWeight: 600
                                    }}>
                                        {complaint.status}
                                    </span>
                                </div>
                                <p style={{ fontSize: '12px', margin: 0 }}>
                                    {complaint.description?.substring(0, 50)}...
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                <RecenterMap items={complaints} />
            </MapContainer>
        </div>
    );
};

export default AdminMap;
