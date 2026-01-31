import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import apiService from '../../api/apiService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { DEPARTMENTS } from '../../constants';

const WardAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [summary, departmentWise, slaData, workload] = await Promise.all([
                apiService.wardOfficer.getWardSummary().catch(() => ({ data: {} })),
                apiService.wardOfficer.getDepartmentWiseAnalytics().catch(() => ({ data: [] })),
                apiService.wardOfficer.getSlaAnalytics().catch(() => ({ data: {} })),
                apiService.wardOfficer.getOfficerWorkload().catch(() => ({ data: [] }))
            ]);

            setAnalytics({
                summary: summary.data || {},
                departmentWise: departmentWise.data || [],
                sla: slaData.data || {},
                workload: workload.data || []
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const summary = analytics?.summary || {};
    const departmentWise = analytics?.departmentWise || [];
    const sla = analytics?.sla || {};

    return (
        <div className="container-fluid py-4">
            <div className="row mb-4">
                <div className="col-12">
                    <h2 className="mb-3">
                        <BarChart3 className="me-2" size={32} />
                        Ward Analytics
                    </h2>
                    <p className="text-muted">
                        Comprehensive analytics and insights for your ward
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="row mb-4">
                <div className="col-md-3 mb-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-grow-1">
                                    <p className="text-muted mb-1">Total Complaints</p>
                                    <h3 className="mb-0">{summary.totalComplaints || 0}</h3>
                                </div>
                                <BarChart3 size={40} className="text-primary opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 mb-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-grow-1">
                                    <p className="text-muted mb-1">Pending Approval</p>
                                    <h3 className="mb-0 text-warning">{summary.pendingApproval || 0}</h3>
                                </div>
                                <Clock size={40} className="text-warning opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 mb-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-grow-1">
                                    <p className="text-muted mb-1">Resolved</p>
                                    <h3 className="mb-0 text-success">{summary.resolved || 0}</h3>
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
                                    <h3 className="mb-0 text-danger">{sla.breached || 0}</h3>
                                </div>
                                <AlertTriangle size={40} className="text-danger opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Department-wise Breakdown */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Department-wise Complaints</h5>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Department</th>
                                            <th className="text-center">Total</th>
                                            <th className="text-center">Pending</th>
                                            <th className="text-center">In Progress</th>
                                            <th className="text-center">Resolved</th>
                                            <th className="text-center">SLA Compliance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {DEPARTMENTS.map(dept => {
                                            const deptData = departmentWise.find(d => d.departmentId === dept.department_id) || {};
                                            const total = deptData.total || 0;
                                            const resolved = deptData.resolved || 0;
                                            const compliance = total > 0 ? Math.round((resolved / total) * 100) : 0;

                                            return (
                                                <tr key={dept.department_id}>
                                                    <td>
                                                        <span className="me-2">{dept.icon}</span>
                                                        <strong>{dept.name}</strong>
                                                    </td>
                                                    <td className="text-center">
                                                        <span className="badge bg-primary">{total}</span>
                                                    </td>
                                                    <td className="text-center">
                                                        <span className="badge bg-warning">{deptData.pending || 0}</span>
                                                    </td>
                                                    <td className="text-center">
                                                        <span className="badge bg-info">{deptData.inProgress || 0}</span>
                                                    </td>
                                                    <td className="text-center">
                                                        <span className="badge bg-success">{resolved}</span>
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="progress" style={{ height: '20px', minWidth: '100px' }}>
                                                            <div
                                                                className={`progress-bar ${compliance >= 70 ? 'bg-success' : compliance >= 40 ? 'bg-warning' : 'bg-danger'}`}
                                                                role="progressbar"
                                                                style={{ width: `${compliance}%` }}
                                                            >
                                                                {compliance}%
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SLA Analytics */}
            <div className="row">
                <div className="col-md-6 mb-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">SLA Performance</h5>
                        </div>
                        <div className="card-body">
                            <div className="row text-center">
                                <div className="col-4">
                                    <div className="mb-3">
                                        <h2 className="text-success mb-0">{sla.met || 0}</h2>
                                        <small className="text-muted">SLA Met</small>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="mb-3">
                                        <h2 className="text-warning mb-0">{sla.warning || 0}</h2>
                                        <small className="text-muted">At Risk</small>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="mb-3">
                                        <h2 className="text-danger mb-0">{sla.breached || 0}</h2>
                                        <small className="text-muted">Breached</small>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Overall SLA Compliance</span>
                                    <strong className="text-success">
                                        {sla.complianceRate || 0}%
                                    </strong>
                                </div>
                                <div className="progress" style={{ height: '12px' }}>
                                    <div
                                        className="progress-bar bg-success"
                                        role="progressbar"
                                        style={{ width: `${sla.complianceRate || 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 mb-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Quick Stats</h5>
                        </div>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                                <div>
                                    <small className="text-muted d-block">Average Resolution Time</small>
                                    <h4 className="mb-0">{summary.avgResolutionTime || 0} hours</h4>
                                </div>
                                <Clock size={32} className="text-primary opacity-50" />
                            </div>

                            <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                                <div>
                                    <small className="text-muted d-block">Active Officers</small>
                                    <h4 className="mb-0">{summary.activeOfficers || 0}</h4>
                                </div>
                                <Users size={32} className="text-success opacity-50" />
                            </div>

                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <small className="text-muted d-block">Citizen Satisfaction</small>
                                    <h4 className="mb-0">{summary.satisfaction || 0}%</h4>
                                </div>
                                <TrendingUp size={32} className="text-warning opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WardAnalytics;
