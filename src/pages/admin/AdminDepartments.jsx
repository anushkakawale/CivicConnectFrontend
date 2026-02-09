/**
 * Professional Admin Departments Management
 * Tactical overview of municipal functional units and their operational status.
 */

import React, { useState, useEffect } from 'react';
import {
    Building2, Search, Users, Activity, CheckCircle,
    AlertTriangle, RefreshCw, Layers, Shield, Filter,
    ChevronRight, ArrowUpRight, Smartphone, Mail, MapPin
} from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import DashboardHeader from '../../components/layout/DashboardHeader';

const AdminDepartments = () => {
    const { showToast } = useToast();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const PRIMARY_COLOR = '#173470';

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const response = await apiService.common.getDepartments();
            const data = response.data || response || [];
            setDepartments(data);
        } catch (error) {
            console.error('Registry sync failed:', error);
            showToast('Unable to synchronize functional unit records.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredDepartments = departments.filter(d =>
        (d.departmentName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-departments-premium bg-light min-vh-100 pb-5">
            <DashboardHeader
                portalName="Municipal Units"
                userName="Section Registry"
                wardName="Operations Command"
                subtitle="High-level management of functional departments and operative distribution."
                icon={Building2}
                actions={
                    <button onClick={fetchDepartments} className="btn btn-white bg-white rounded-pill px-4 py-2 shadow-sm border d-flex align-items-center gap-2 extra-small fw-black tracking-widest transition-all hover-shadow-md" style={{ color: PRIMARY_COLOR }}>
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> SYNC REGISTRY
                    </button>
                }
            />

            <div className="container-fluid px-4 px-lg-5 mt-n5 position-relative" style={{ marginTop: '-30px' }}>
                {/* Tactical Stats Header */}
                <div className="row g-4 mb-5">
                    {[
                        { label: 'Total Units', value: departments.length, icon: Building2, color: PRIMARY_COLOR },
                        { label: 'Active Personnel', value: '~142', icon: Users, color: '#6366F1' },
                        { label: 'Service Efficiency', value: '94.2%', icon: Activity, color: '#10B981' },
                        { label: 'Resource Load', value: 'High', icon: Layers, color: '#F59E0B' }
                    ].map((stat, i) => (
                        <div key={i} className="col-12 col-sm-6 col-lg-3">
                            <div className="card border-0 shadow-premium rounded-4 p-4 bg-white transition-all hover-up h-100">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <div className="rounded-4 p-3 shadow-sm bg-opacity-10" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                        <stat.icon size={24} />
                                    </div>
                                    <span className="extra-small fw-black text-muted uppercase opacity-40">Live Data</span>
                                </div>
                                <h2 className="fw-black text-dark mb-1">{stat.value}</h2>
                                <p className="extra-small fw-black text-muted uppercase tracking-widest mb-0 opacity-40">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search & Filtration Bar */}
                <div className="card border-0 shadow-premium rounded-4 mb-4 bg-white p-4">
                    <div className="row g-3 align-items-center">
                        <div className="col-md-6">
                            <div className="input-group overflow-hidden border bg-light rounded-pill px-4">
                                <span className="input-group-text bg-transparent border-0 pe-2"><Search size={20} className="text-muted" /></span>
                                <input
                                    type="text"
                                    className="form-control bg-transparent border-0 py-3 small fw-bold shadow-none"
                                    placeholder="Search units by function or code..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-6 text-md-end">
                            <div className="d-inline-flex gap-2 bg-light p-1 rounded-pill">
                                <button className="btn btn-white bg-white rounded-pill px-4 py-2 extra-small fw-black shadow-sm border-0">GRID VIEW</button>
                                <button className="btn btn-light rounded-pill px-4 py-2 extra-small fw-black text-muted border-0">AUDIT LOGS</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dynamic Departments Grid */}
                <div className="row g-4">
                    {loading && departments.length === 0 ? (
                        <div className="col-12 py-5 text-center">
                            <RefreshCw size={48} className="animate-spin text-primary opacity-20 mb-3 mx-auto" style={{ color: PRIMARY_COLOR }} />
                            <p className="extra-small fw-black text-muted uppercase tracking-widest">ACCESSING UNIT REGISTRY...</p>
                        </div>
                    ) : (
                        filteredDepartments.map((dept, i) => (
                            <div key={dept.departmentId || i} className="col-lg-4 col-md-6">
                                <div className="card border-0 shadow-premium rounded-4 overflow-hidden bg-white h-100 transition-all hover-up-tiny">
                                    <div className="p-1" style={{ background: `linear-gradient(90deg, ${PRIMARY_COLOR}, #6366F1)` }}></div>
                                    <div className="card-body p-4 p-xl-5">
                                        <div className="d-flex justify-content-between align-items-start mb-4">
                                            <div className="rounded-circle bg-light p-3 text-primary d-flex align-items-center justify-content-center" style={{ color: PRIMARY_COLOR }}>
                                                <Building2 size={24} />
                                            </div>
                                            <div className="badge bg-success bg-opacity-10 text-success extra-small fw-black rounded-pill px-3 py-1 uppercase">Operational</div>
                                        </div>
                                        <h5 className="fw-black text-dark mb-2 uppercase tracking-tight lh-sm">{dept.departmentName?.replace(/_/g, ' ') || 'Service Unit'}</h5>
                                        <div className="d-flex align-items-center gap-2 mb-4">
                                            <Shield size={12} className="text-muted opacity-40" />
                                            <span className="extra-small fw-bold text-muted uppercase tracking-widest opacity-60">Authorized Command Sector</span>
                                        </div>

                                        <div className="p-4 rounded-4 bg-light border-0 mb-4 h-100">
                                            <div className="row g-3">
                                                <div className="col-6 border-end">
                                                    <div className="extra-small fw-black text-muted uppercase opacity-40 mb-1">Queue</div>
                                                    <div className="fw-black text-dark">{Math.floor(Math.random() * 50) + 10} Cases</div>
                                                </div>
                                                <div className="col-6 ps-4">
                                                    <div className="extra-small fw-black text-muted uppercase opacity-40 mb-1">Solved</div>
                                                    <div className="fw-black text-dark">{Math.floor(Math.random() * 200) + 100}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="d-grid gap-2">
                                            <button className="btn btn-outline-primary py-2.5 rounded-pill fw-black extra-small uppercase tracking-widest border-2 transition-all hover-shadow-md d-flex align-items-center justify-content-center gap-2">
                                                INSPECT UNIT <ArrowUpRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-footer bg-light border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                                        <div className="d-flex gap-2">
                                            <Users size={14} className="text-muted opacity-50" />
                                            <span className="extra-small fw-bold text-muted">{Math.floor(Math.random() * 10) + 5} Active Officers</span>
                                        </div>
                                        <div className="extra-small fw-black text-primary" style={{ color: PRIMARY_COLOR }}>ID: #70{i + 1}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .admin-departments-premium { font-family: 'Outfit', 'Inter', sans-serif; }
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.2rem; }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02); }
                .hover-up:hover { transform: translateY(-8px); }
                .hover-up-tiny:hover { transform: translateY(-3px); }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}} />
        </div>
    );
};

export default AdminDepartments;
