import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, TrendingUp, Calendar } from 'lucide-react';
import apiService from '../../api/apiService';
import { COMPLAINT_STATUS, SLA_STATUS } from '../../constants';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const SlaStatus = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, active, breached, met

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            // Fetch with large size to get all for stats
            const response = await apiService.citizen.getMyComplaints({ page: 0, size: 100 });
            console.log('SLA fetch response:', response);

            const data = response.data || response;
            const content = data.content || (Array.isArray(data) ? data : []);

            setComplaints(content);
        } catch (error) {
            console.error('Error fetching complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateSlaStatus = (complaint) => {
        // If backend provides SLA status, use it
        if (complaint.slaStatus && complaint.slaDeadline) {
            const deadline = new Date(complaint.slaDeadline);
            const now = new Date();
            const hoursRemaining = (deadline - now) / (1000 * 60 * 60);

            // If status is just the string, we map it
            return {
                status: complaint.slaStatus, // 'ACTIVE', 'WARNING', 'BREACHED', 'MET'
                hoursRemaining: Math.max(0, hoursRemaining),
                percentageUsed: 50, // Approximation if not calculated
                slaHours: 48 // Default or unknown
            };
        }

        if (!complaint.createdAt) return null;

        const createdDate = new Date(complaint.createdAt);
        const now = new Date();
        const hoursElapsed = (now - createdDate) / (1000 * 60 * 60);
        // Fallback to 48h if not provided
        const slaHours = complaint.department?.slaHours || 48;
        const percentageUsed = (hoursElapsed / slaHours) * 100;

        if (complaint.status === 'CLOSED' || complaint.status === 'RESOLVED') {
            return {
                status: hoursElapsed <= slaHours ? 'MET' : 'BREACHED',
                hoursRemaining: 0,
                percentageUsed: 100,
                slaHours
            };
        }

        let status = 'ACTIVE';
        if (percentageUsed >= 100) status = 'BREACHED';
        else if (percentageUsed >= 80) status = 'WARNING';

        return {
            status,
            hoursRemaining: Math.max(0, slaHours - hoursElapsed),
            percentageUsed,
            slaHours
        };
    };

    const filteredComplaints = complaints.filter(complaint => {
        const slaInfo = calculateSlaStatus(complaint);
        if (!slaInfo) return false;

        if (filter === 'all') return true;
        if (filter === 'active') return slaInfo.status === 'ACTIVE' || slaInfo.status === 'WARNING';
        if (filter === 'breached') return slaInfo.status === 'BREACHED';
        if (filter === 'met') return slaInfo.status === 'MET';
        return true;
    });

    const stats = {
        total: complaints.length,
        active: complaints.filter(c => {
            const sla = calculateSlaStatus(c);
            return sla && (sla.status === 'ACTIVE' || sla.status === 'WARNING');
        }).length,
        breached: complaints.filter(c => {
            const sla = calculateSlaStatus(c);
            return sla && sla.status === 'BREACHED';
        }).length,
        met: complaints.filter(c => {
            const sla = calculateSlaStatus(c);
            return sla && sla.status === 'MET';
        }).length
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="container-fluid py-4">
            <div className="row mb-4">
                <div className="col-12">
                    <h2 className="mb-3">
                        <Clock className="me-2" size={32} />
                        SLA Status Tracker
                    </h2>
                    <p className="text-muted">
                        Track Service Level Agreement compliance for all your complaints
                    </p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="row mb-4">
                <div className="col-md-3 mb-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-grow-1">
                                    <p className="text-muted mb-1">Total Complaints</p>
                                    <h3 className="mb-0">{stats.total}</h3>
                                </div>
                                <Calendar size={40} className="text-primary opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 mb-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-grow-1">
                                    <p className="text-muted mb-1">Active</p>
                                    <h3 className="mb-0 text-primary">{stats.active}</h3>
                                </div>
                                <Clock size={40} className="text-primary opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 mb-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-grow-1">
                                    <p className="text-muted mb-1">SLA Met</p>
                                    <h3 className="mb-0 text-success">{stats.met}</h3>
                                </div>
                                <CheckCircle size={40} className="text-success opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 mb-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-grow-1">
                                    <p className="text-muted mb-1">SLA Breached</p>
                                    <h3 className="mb-0 text-danger">{stats.breached}</h3>
                                </div>
                                <AlertTriangle size={40} className="text-danger opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="btn-group" role="group">
                        <button
                            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setFilter('all')}
                        >
                            All ({stats.total})
                        </button>
                        <button
                            className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setFilter('active')}
                        >
                            Active ({stats.active})
                        </button>
                        <button
                            className={`btn ${filter === 'met' ? 'btn-success' : 'btn-outline-success'}`}
                            onClick={() => setFilter('met')}
                        >
                            Met ({stats.met})
                        </button>
                        <button
                            className={`btn ${filter === 'breached' ? 'btn-danger' : 'btn-outline-danger'}`}
                            onClick={() => setFilter('breached')}
                        >
                            Breached ({stats.breached})
                        </button>
                    </div>
                </div>
            </div>

            {/* Complaints List */}
            <div className="row">
                <div className="col-12">
                    {filteredComplaints.length === 0 ? (
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center py-5">
                                <Clock size={64} className="text-muted mb-3" />
                                <h5>No complaints found</h5>
                                <p className="text-muted">
                                    {filter === 'all'
                                        ? 'You haven\'t registered any complaints yet.'
                                        : `No complaints with ${filter} SLA status.`
                                    }
                                </p>
                            </div>
                        </div>
                    ) : (
                        filteredComplaints.map(complaint => {
                            const slaInfo = calculateSlaStatus(complaint);
                            if (!slaInfo) return null;

                            const slaConfig = SLA_STATUS[slaInfo.status];

                            return (
                                <div key={complaint.complaintId} className="card border-0 shadow-sm mb-3">
                                    <div className="card-body">
                                        <div className="row align-items-center">
                                            <div className="col-md-6">
                                                <h5 className="mb-1">
                                                    {complaint.title || `Complaint #${complaint.complaintId}`}
                                                </h5>
                                                <div className="text-muted small mb-2">
                                                    #{complaint.complaintId} • {complaint.department?.name}
                                                </div>
                                                <p className="mb-2">
                                                    {complaint.description}
                                                </p>
                                                <span className={`badge bg-${COMPLAINT_STATUS[complaint.status]?.color}`}>
                                                    {complaint.status}
                                                </span>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <small className="text-muted">SLA Progress</small>
                                                        <small className={`text-${slaConfig.color} fw-bold`}>
                                                            {slaInfo.status}
                                                        </small>
                                                    </div>
                                                    <div className="progress" style={{ height: '8px' }}>
                                                        <div
                                                            className={`progress-bar bg-${slaConfig.color}`}
                                                            role="progressbar"
                                                            style={{ width: `${Math.min(slaInfo.percentageUsed, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                <div className="d-flex justify-content-between">
                                                    <div>
                                                        <small className="text-muted d-block">SLA Time</small>
                                                        <strong>{slaInfo.slaHours} hours</strong>
                                                    </div>
                                                    <div className="text-end">
                                                        <small className="text-muted d-block">
                                                            {slaInfo.status === 'BREACHED' || slaInfo.status === 'MET'
                                                                ? 'Final Status'
                                                                : 'Time Remaining'
                                                            }
                                                        </small>
                                                        <strong className={`text-${slaConfig.color}`}>
                                                            {slaInfo.status === 'BREACHED' || slaInfo.status === 'MET'
                                                                ? slaInfo.status
                                                                : `${Math.floor(slaInfo.hoursRemaining)}h ${Math.floor((slaInfo.hoursRemaining % 1) * 60)}m`
                                                            }
                                                        </strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default SlaStatus;
