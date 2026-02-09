import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle, Calendar, MapPin, ArrowRight, Search,
    Filter, RefreshCw, Clock, ChevronLeft
} from 'lucide-react';
import apiService from '../../api/apiService';
import DashboardHeader from '../../components/layout/DashboardHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { useToast } from '../../hooks/useToast';

const DepartmentHistory = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await apiService.departmentOfficer.getResolvedHistory();
            const data = response.data || response;
            const list = Array.isArray(data) ? data : (data.content || data.complaints || []);
            setHistory(list);
        } catch (error) {
            console.error('Failed to load history:', error);
            showToast('Failed to retrieve history logs.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredHistory = history.filter(item =>
        (item.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.complaintId?.toString().includes(searchTerm))
    );

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="ARCHIVES"
                userName="Mission Log"
                wardName="Resolved Operations"
                subtitle="Historical Record of Completed Assignments"
                icon={CheckCircle}
                showProfileInitials={true}
                actions={
                    <button
                        onClick={fetchHistory}
                        className="btn btn-white bg-white text-primary rounded-circle p-2 shadow-lg border-0 transition-all hover-up d-flex align-items-center justify-content-center"
                        style={{ width: '45px', height: '45px' }}
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                }
            />

            <div className="container px-4" style={{ marginTop: '-40px' }}>
                <div className="card border-0 shadow-lg gov-rounded overflow-hidden bg-white elevation-1">
                    <div className="p-4 border-bottom bg-light bg-opacity-30 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                            <button onClick={() => navigate('/department/dashboard')} className="btn btn-light rounded-circle p-2 border me-2">
                                <ChevronLeft size={20} />
                            </button>
                            <h5 className="fw-black mb-0 text-uppercase tracking-wider">Resolution Log</h5>
                        </div>
                        <div className="input-group overflow-hidden border-0 bg-white shadow-sm elevation-1 gov-rounded" style={{ maxWidth: '300px', borderRadius: '20px' }}>
                            <span className="input-group-text bg-transparent border-0 ps-3"><Search size={18} className="text-muted" /></span>
                            <input
                                type="text"
                                className="form-control bg-transparent border-0 py-2 fs-6 fw-bold px-1 shadow-none text-uppercase extra-small"
                                placeholder="SEARCH LOGS..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light bg-opacity-50">
                                <tr>
                                    <th className="px-5 py-4 border-0 text-dark opacity-60 fw-black extra-small uppercase tracking-widest">Reference ID</th>
                                    <th className="py-4 border-0 text-dark opacity-60 fw-black extra-small uppercase tracking-widest">Issue</th>
                                    <th className="py-4 border-0 text-dark opacity-60 fw-black extra-small uppercase tracking-widest">Resolution Date</th>
                                    <th className="py-4 border-0 text-dark opacity-60 fw-black extra-small uppercase tracking-widest">Status</th>
                                    <th className="px-5 py-4 border-0 text-end text-dark opacity-60 fw-black extra-small uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5">
                                            <RefreshCw size={40} className="animate-spin text-primary opacity-20 mb-3" />
                                            <p className="extra-small fw-black text-muted uppercase">Accessing Archives...</p>
                                        </td>
                                    </tr>
                                ) : filteredHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5">
                                            <div className="rounded-circle bg-light d-inline-flex p-4 mb-4">
                                                <CheckCircle size={48} className="text-muted opacity-20" />
                                            </div>
                                            <h6 className="fw-black text-dark uppercase mb-1">No Archives Found</h6>
                                            <p className="extra-small text-muted fw-bold opacity-60">Complete tasks to populate this ledger.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredHistory.map(item => (
                                        <tr key={item.id || item.complaintId} onClick={() => navigate(`/department/complaints/${item.id || item.complaintId}`)} className="cursor-pointer transition-all hover-bg-light">
                                            <td className="px-5">
                                                <span className="badge bg-light text-dark border fw-black extra-small p-2">#{item.id || item.complaintId}</span>
                                            </td>
                                            <td>
                                                <div className="fw-black text-dark small text-uppercase tracking-tight text-truncate" style={{ maxWidth: '250px' }}>{item.title}</div>
                                                <div className="d-flex align-items-center gap-2 mt-1">
                                                    <MapPin size={10} className="text-muted" />
                                                    <span className="extra-small text-muted fw-bold uppercase">{item.wardName || 'Ward Area'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2 text-muted fw-black extra-small">
                                                    <Calendar size={14} />
                                                    {new Date(item.updatedAt || Date.now()).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td>
                                                <StatusBadge status={item.status} size="sm" />
                                            </td>
                                            <td className="px-5 text-end">
                                                <button className="btn btn-link text-primary p-0">
                                                    <ArrowRight size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .fw-black { font-weight: 800; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.2em; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}} />
        </div>
    );
};

export default DepartmentHistory;
