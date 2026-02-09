import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, FileText, TrendingUp, AlertTriangle, CheckCircle,
  Clock, BarChart3, Activity, Building2, Shield, Settings,
  Calendar, MapPin, Eye, UserPlus, ShieldCheck, Zap,
  RefreshCw, Filter, Layers, Globe, Database, Cpu
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid, AreaChart, Area,
  LineChart, Line
} from 'recharts';

const ProfessionalAdminDashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("name") || localStorage.getItem('email')?.split('@')[0] || 'Admin';

  const [stats, setStats] = useState({
    totalUsers: 15420,
    totalComplaints: 3420,
    pendingComplaints: 234,
    resolvedComplaints: 2890,
    activeOfficers: 45,
    systemHealth: 98
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated Load
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  const COLORS = ['#1254AF', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

  const chartData = [
    { name: 'Mon', complaints: 400, resolved: 240 },
    { name: 'Tue', complaints: 300, resolved: 139 },
    { name: 'Wed', complaints: 200, resolved: 980 },
    { name: 'Thu', complaints: 278, resolved: 390 },
    { name: 'Fri', complaints: 189, resolved: 480 },
    { name: 'Sat', complaints: 239, resolved: 380 },
    { name: 'Sun', complaints: 349, resolved: 430 },
  ];

  const deptPerformance = [
    { name: 'Sanitation', value: 400 },
    { name: 'Roads', value: 300 },
    { name: 'Water', value: 300 },
    { name: 'Electricity', value: 200 },
  ];

  if (loading) return (
    <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F5F7FA' }}>
      <Cpu className="animate-spin text-primary mb-4" size={56} style={{ color: '#1254AF' }} />
      <p className="fw-bold text-primary text-uppercase tracking-widest" style={{ color: '#1254AF' }}>Loading Dashboard...</p>
    </div>
  );

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#F5F7FA', padding: '2rem' }}>

      {/* Global Command Header */}
      <div className="card border-0 shadow-lg rounded-0 overflow-hidden mb-4" style={{
        background: 'linear-gradient(135deg, #1254AF 0%, #0D4291 100%)'
      }}>
        <div className="card-body p-4 position-relative">
          <div className="position-absolute top-50 end-0 translate-middle-y p-3 opacity-10">
            <Globe size={180} color="white" />
          </div>
          <div className="row align-items-center position-relative z-1">
            <div className="col-md-8 text-white">
              <div className="d-flex align-items-center gap-3 mb-2">
                <div className="p-2 rounded-0 bg-white bg-opacity-20 shadow-sm border border-white border-opacity-10">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h1 className="fw-bold mb-0" style={{ fontSize: '1.75rem' }}>Admin Dashboard</h1>
                  <p className="opacity-90 fw-medium mb-0 small">Overview of city performance and user management.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-white bg-opacity-20 border-0 rounded-0 p-3 text-center backdrop-blur-sm">
                <div className="display-6 fw-bold text-white mb-0">{stats.systemHealth}%</div>
                <div className="extra-small fw-bold text-white text-uppercase tracking-wider opacity-90">System Health</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Metrics Grid */}
      <div className="row g-4 mb-4">
        {[
          { label: 'Total Users', val: stats.totalUsers, icon: Users, color: '#1254AF', trend: '+12%' },
          { label: 'Complaints', val: stats.totalComplaints, icon: FileText, color: '#3B82F6', trend: '+8%' },
          { label: 'High Priority', val: stats.pendingComplaints, icon: AlertTriangle, color: '#F59E0B', alert: true },
          { label: 'Resolution', val: '84.5%', icon: CheckCircle, color: '#10B981' },
          { label: 'Active Officers', val: stats.activeOfficers, icon: Shield, color: '#6366F1' },
          { label: 'Avg Response', val: '1.2s', icon: Zap, color: '#8B5CF6' }
        ].map((s, idx) => (
          <div key={idx} className="col-6 col-md-4 col-xl-2">
            <div className="card border-0 shadow-sm rounded-0 p-3 h-100 bg-white transition-all hover-up">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="p-2 rounded-0" style={{ backgroundColor: s.color + '15', color: s.color }}>
                  <s.icon size={20} />
                </div>
                {s.trend && <span className="extra-small fw-bold text-success">{s.trend}</span>}
              </div>
              <h3 className="fw-bold text-dark mb-0">{s.val}</h3>
              <span className="extra-small fw-bold text-muted text-uppercase tracking-wider">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        {/* Core Quick Ops */}
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-0 bg-white p-3 border-hover-primary transition-all">
            <div className="row g-2">
              {[
                { title: 'User Management', desc: 'Manage all users', icon: Users, path: '/admin/users' },
                { title: 'Register Officer', desc: 'Add new ward officer', icon: UserPlus, path: '/admin/register-ward-officer' },
                { title: 'Analytics', desc: 'View reports', icon: BarChart3, path: '/admin/analytics' },
                { title: 'Settings', desc: 'System configuration', icon: Settings, path: '/admin/settings' }
              ].map((act, idx) => (
                <div key={idx} className="col-md-3">
                  <button
                    onClick={() => navigate(act.path)}
                    className="btn btn-light w-100 h-100 p-3 rounded-0 border-0 d-flex align-items-center gap-3 text-start"
                    style={{ backgroundColor: '#F8FAFC' }}
                  >
                    <div className="p-2 bg-white rounded-0 shadow-sm text-primary" style={{ color: '#1254AF' }}>
                      <act.icon size={24} />
                    </div>
                    <div>
                      <div className="fw-bold text-dark small mb-0">{act.title}</div>
                      <div className="extra-small text-muted">{act.desc}</div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Tactical Trends */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-0 bg-white p-4 border-hover-primary transition-all h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <Activity className="text-primary" style={{ color: '#1254AF' }} size={20} />
                Complaint Trends
              </h5>
              <div className="badge bg-primary bg-opacity-10 text-primary rounded-0 px-3 py-1 fw-bold extra-small uppercase tracking-wider" style={{ color: '#1254AF', backgroundColor: '#E3F2FD' }}>
                Live Data
              </div>
            </div>

            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1254AF" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#1254AF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F9FF" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '0', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="complaints" stroke="#1254AF" fillOpacity={1} fill="url(#colorComplaints)" strokeWidth={2} />
                  <Area type="monotone" dataKey="resolved" stroke="#3B82F6" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sector Utilization */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-0 bg-white p-4 border-hover-primary transition-all h-100">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <Layers className="text-primary" style={{ color: '#1254AF' }} size={20} />
              Department Load
            </h5>

            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptPerformance}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deptPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-auto pt-4 border-top border-dashed">
              <div className="row g-3">
                <div className="col-6">
                  <div className="p-2 rounded-0 bg-light text-center">
                    <span className="extra-small fw-bold text-muted d-block mb-1">UPTIME</span>
                    <span className="fw-bold text-primary" style={{ color: '#1254AF' }}>99.9%</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-2 rounded-0 bg-light text-center">
                    <span className="extra-small fw-bold text-muted d-block mb-1">LATENCY</span>
                    <span className="fw-bold text-primary" style={{ color: '#1254AF' }}>1.2s</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .fw-bold { font-weight: 700; }
        .text-primary { color: #1254AF !important; }
        .bg-primary { background-color: #1254AF !important; }
        .extra-small { font-size: 0.75rem; }
        .tracking-wider { letter-spacing: 0.05em; }
        .transition-all { transition: all 0.2s ease-in-out; }
        .hover-up:hover { transform: translateY(-3px); }
        .border-hover-primary:hover { border-color: #1254AF !important; }
        .btn-light:hover { background-color: #F0F9FF !important; color: #1254AF !important; transform: translateY(-2px); }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
};

export default ProfessionalAdminDashboard;
