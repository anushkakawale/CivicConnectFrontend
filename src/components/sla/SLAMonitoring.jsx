import React, { useState, useEffect } from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Timer,
  BarChart3,
  Calendar,
  Target,
  Zap,
  Shield,
  Bell,
  Eye,
  Filter,
  Search,
  ChevronRight,
  Info,
  AlertCircle,
  CheckSquare
} from 'lucide-react';
import { GovBadge, GovButton, GovAlert } from '../ui/GovComponents';

// Enhanced SLA Status Component
export const SLAStatusCard = ({ complaint, className = '' }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [slaStatus, setSlaStatus] = useState('normal');

  useEffect(() => {
    const calculateSLA = () => {
      if (!complaint.createdAt || !complaint.slaHours) return;

      const created = new Date(complaint.createdAt);
      const now = new Date();
      const elapsedHours = (now - created) / (1000 * 60 * 60);
      const remainingHours = complaint.slaHours - elapsedHours;

      setTimeRemaining(remainingHours);

      if (remainingHours <= 0) {
        setSlaStatus('breached');
      } else if (remainingHours <= complaint.slaHours * 0.25) {
        setSlaStatus('critical');
      } else if (remainingHours <= complaint.slaHours * 0.5) {
        setSlaStatus('warning');
      } else {
        setSlaStatus('normal');
      }
    };

    calculateSLA();
    const interval = setInterval(calculateSLA, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [complaint]);

  const getSLAColor = () => {
    switch (slaStatus) {
      case 'breached': return 'text-red-600 bg-red-50 border-red-200';
      case 'critical': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getSLAIcon = () => {
    switch (slaStatus) {
      case 'breached': return AlertTriangle;
      case 'critical': return AlertCircle;
      case 'warning': return Clock;
      default: return CheckCircle;
    }
  };

  const getSLAText = () => {
    if (timeRemaining === null) return 'Calculating...';

    if (timeRemaining <= 0) return 'SLA Breached';

    const totalMinutes = Math.floor(timeRemaining * 60);
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;

    let parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);

    return `${parts.join(' ')} remaining`;
  };

  const SLAIcon = getSLAIcon();

  return (
    <div className={`flex items-center space-x-3 p-3 rounded-xl border ${getSLAColor()} ${className}`}>
      <div className="flex-shrink-0">
        <SLAIcon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">SLA Status</div>
        <div className="text-xs opacity-75">{getSLAText()}</div>
      </div>
      <div className="flex-shrink-0">
        <div className="text-xs font-mono bg-white/50 px-2 py-1 rounded-0">
          {complaint.slaHours}h SLA
        </div>
      </div>
    </div>
  );
};

// SLA Dashboard Component
export const SLADashboard = ({ className = '' }) => {
  const [slaMetrics, setSlaMetrics] = useState({
    overall: 94.5,
    breached: 12,
    atRisk: 28,
    onTrack: 156,
    averageResolutionTime: 2.3,
    complianceTrend: 'up'
  });

  const [departmentSLA, setDepartmentSLA] = useState([
    { name: 'Water Supply', compliance: 96.2, breached: 2, atRisk: 5, total: 45 },
    { name: 'Sanitation', compliance: 92.8, breached: 4, atRisk: 8, total: 38 },
    { name: 'Roads', compliance: 89.5, breached: 3, atRisk: 7, total: 32 },
    { name: 'Electricity', compliance: 97.1, breached: 1, atRisk: 3, total: 41 },
    { name: 'Waste Management', compliance: 95.3, breached: 1, atRisk: 4, total: 28 },
    { name: 'Public Safety', compliance: 98.7, breached: 1, atRisk: 1, total: 24 }
  ]);

  const [slaAlerts, setSlaAlerts] = useState([
    {
      id: 1,
      type: 'critical',
      message: '3 complaints approaching SLA breach in next 2 hours',
      department: 'Water Supply',
      time: '5 minutes ago'
    },
    {
      id: 2,
      type: 'breached',
      message: 'Complaint #2341 has breached SLA deadline',
      department: 'Sanitation',
      time: '15 minutes ago'
    },
    {
      id: 3,
      type: 'warning',
      message: 'High volume of complaints in Roads department',
      department: 'Roads',
      time: '1 hour ago'
    }
  ]);

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800';
      case 'breached': return 'bg-red-100 border-red-300 text-red-900';
      case 'warning': return 'bg-amber-50 border-amber-200 text-amber-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return AlertTriangle;
      case 'breached': return AlertCircle;
      case 'warning': return Clock;
      default: return Info;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* SLA Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-500 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-green-900">{slaMetrics.overall}%</span>
          </div>
          <div className="text-sm font-medium text-green-900">Overall Compliance</div>
          <div className="text-xs text-green-700 mt-1">Above target threshold</div>
          <div className="mt-3 flex items-center text-xs text-green-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            +2.3% from last month
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-500 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-red-900">{slaMetrics.breached}</span>
          </div>
          <div className="text-sm font-medium text-red-900">SLA Breached</div>
          <div className="text-xs text-red-700 mt-1">Requires immediate attention</div>
          <div className="mt-3">
            <GovButton variant="danger" size="sm" className="w-full">
              View All
            </GovButton>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-500 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-amber-900">{slaMetrics.atRisk}</span>
          </div>
          <div className="text-sm font-medium text-amber-900">At Risk</div>
          <div className="text-xs text-amber-700 mt-1">Approaching deadline</div>
          <div className="mt-3">
            <GovButton variant="warning" size="sm" className="w-full">
              Monitor
            </GovButton>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Timer className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-blue-900">{slaMetrics.averageResolutionTime}d</span>
          </div>
          <div className="text-sm font-medium text-blue-900">Avg Resolution</div>
          <div className="text-xs text-blue-700 mt-1">Across all departments</div>
          <div className="mt-3 flex items-center text-xs text-blue-600">
            <TrendingDown className="w-3 h-3 mr-1" />
            -0.5d improvement
          </div>
        </div>
      </div>

      {/* Department-wise SLA Performance */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Department SLA Performance</h3>
          <GovButton variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </GovButton>
        </div>

        <div className="space-y-4">
          {departmentSLA.map((dept, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="font-medium text-slate-900">{dept.name}</div>
                  <GovBadge variant={dept.compliance >= 95 ? 'success' : dept.compliance >= 90 ? 'warning' : 'danger'}>
                    {dept.compliance}% Compliance
                  </GovBadge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <span>{dept.total} total</span>
                  <span className="text-red-600">{dept.breached} breached</span>
                  <span className="text-amber-600">{dept.atRisk} at risk</span>
                </div>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${dept.compliance >= 95 ? 'bg-green-500' :
                      dept.compliance >= 90 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                  style={{ width: `${dept.compliance}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SLA Alerts */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">SLA Alerts</h3>
          <GovButton variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            View All Alerts
          </GovButton>
        </div>

        <div className="space-y-3">
          {slaAlerts.map((alert) => {
            const AlertIcon = getAlertIcon(alert.type);
            return (
              <div key={alert.id} className={`flex items-start space-x-3 p-4 rounded-lg border ${getAlertColor(alert.type)}`}>
                <div className="flex-shrink-0">
                  <AlertIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{alert.message}</div>
                  <div className="text-sm opacity-75 mt-1">
                    {alert.department} • {alert.time}
                  </div>
                </div>
                <GovButton variant="outline" size="sm">
                  <Eye className="w-4 h-4" />
                </GovButton>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Enhanced SLA Timeline Component
export const SLATimeline = ({ complaints, className = '' }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredComplaints = complaints.filter(complaint => {
    const matchesFilter = filter === 'all' ||
      (filter === 'breached' && complaint.slaStatus === 'breached') ||
      (filter === 'at-risk' && complaint.slaStatus === 'critical') ||
      (filter === 'on-track' && complaint.slaStatus === 'normal');

    const matchesSearch = complaint.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.complaintId?.toString().includes(searchTerm);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-slate-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">SLA Timeline</h3>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="breached">Breached</option>
            <option value="at-risk">At Risk</option>
            <option value="on-track">On Track</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredComplaints.map((complaint) => (
          <div key={complaint.complaintId} className="border-l-4 border-blue-500 pl-4 py-3 hover:bg-slate-50 rounded-r-lg transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-mono text-sm text-slate-600">#{complaint.complaintId}</span>
                  <GovBadge variant="outline" size="sm">
                    {complaint.department}
                  </GovBadge>
                  <GovBadge variant={complaint.priority === 'HIGH' ? 'danger' : complaint.priority === 'MEDIUM' ? 'warning' : 'success'} size="sm">
                    {complaint.priority}
                  </GovBadge>
                </div>
                <h4 className="font-medium text-slate-900 mb-1">{complaint.title}</h4>
                <p className="text-sm text-slate-600 mb-2">{complaint.description}</p>
                <div className="flex items-center space-x-4 text-xs text-slate-500">
                  <span>Created: {new Date(complaint.createdAt).toLocaleDateString()}</span>
                  <span>SLA: {complaint.slaHours}h</span>
                </div>
              </div>
              <div className="ml-4">
                <SLAStatusCard complaint={complaint} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Real-time SLA Monitor Component
export const RealTimeSLAMonitor = ({ className = '' }) => {
  const [activeComplaints, setActiveComplaints] = useState([]);
  const [realTimeStats, setRealTimeStats] = useState({
    totalActive: 0,
    criticalCount: 0,
    breachedCount: 0,
    avgTimeRemaining: 0
  });

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      // Update real-time stats
      setRealTimeStats(prev => ({
        ...prev,
        avgTimeRemaining: Math.max(0, prev.avgTimeRemaining - 0.1)
      }));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center">
          <Activity className="w-5 h-5 mr-2 text-green-400" />
          Real-time SLA Monitor
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-400">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="text-2xl font-bold">{realTimeStats.totalActive}</div>
          <div className="text-sm text-slate-300">Active Complaints</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="text-2xl font-bold text-red-400">{realTimeStats.criticalCount}</div>
          <div className="text-sm text-slate-300">Critical</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="text-2xl font-bold text-amber-400">{realTimeStats.breachedCount}</div>
          <div className="text-sm text-slate-300">Breached</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">{realTimeStats.avgTimeRemaining.toFixed(1)}h</div>
          <div className="text-sm text-slate-300">Avg Time Left</div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4">
        <div className="text-sm text-slate-300 mb-2">System Status</div>
        <div className="flex items-center justify-between">
          <span className="text-sm">All systems operational</span>
          <GovBadge variant="success" className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Healthy
          </GovBadge>
        </div>
      </div>
    </div>
  );
};

export default {
  SLAStatusCard,
  SLADashboard,
  SLATimeline,
  RealTimeSLAMonitor
};
