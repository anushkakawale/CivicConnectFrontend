import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, FileText, Clock, CheckCircle, AlertCircle, RefreshCw,
  ChevronRight, Activity, MapPin, Bell, User, Star
} from 'lucide-react';
import { StatCard, StatusBadge } from '../components/common';

const ProfessionalCitizenDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const userName = localStorage.getItem('email')?.split('@')[0] || 'Citizen';

  useEffect(() => {
    // Simple loading delay for UX feel
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="gov-loader mb-4"></div>
          <p className="text-slate-500 font-medium">Synchronizing Citizen Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Reduced Height Hero */}
      <div className="dashboard-hero" style={{ padding: '2rem' }}>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="max-w-2xl">
            <h1 className="text-white text-3xl mb-2 font-bold">Welcome back, {userName}</h1>
            <p className="text-blue-100 text-sm opacity-90 mb-6 font-medium max-w-lg">
              Manage your complaints and track status updates efficiently.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/register-complaint')}
                className="btn-premium btn-premium-primary py-3 px-8 bg-white text-blue-900 border-none shadow-lg hover:scale-105"
                style={{ color: '#1254AF' }}
              >
                <Plus size={18} className="stroke-[3]" /> New Complaint
              </button>
              <button
                className="btn-premium btn-premium-secondary bg-white/10 text-white border border-white/20 hover:bg-white/20 py-3 px-6"
                onClick={() => window.location.reload()}
              >
                <RefreshCw size={16} /> Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stat-grid mt-6">
        <StatCard icon={FileText} value="12" label="Total Complaints" trend={{ direction: 'up', value: 15 }} />
        <StatCard icon={Activity} value="2" label="In Progress" variant="info" />
        <StatCard icon={CheckCircle} value="8" label="Resolved" variant="success" />
        <StatCard icon={Star} value="4.8" label="My Rating" variant="secondary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Historical Log */}
        <div className="lg:col-span-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Recent Complaints</h2>
            <button onClick={() => navigate('/citizen/complaints')} className="text-blue-600 font-semibold text-sm flex items-center gap-1 hover:underline" style={{ color: '#1254AF' }}>
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Ward</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 'CMP-102', title: 'Street Light Issue', status: 'IN_PROGRESS', ward: 'Shivaji-2' },
                  { id: 'CMP-098', title: 'Garbage Collection', status: 'RESOLVED', ward: 'Kothrud-1' },
                  { id: 'CMP-084', title: 'Water Leakage', status: 'PENDING', ward: 'Hadapsar-A' }
                ].map((item, idx) => (
                  <tr key={idx}>
                    <td className="font-bold text-slate-900">#{item.id}</td>
                    <td className="font-semibold text-slate-700">{item.title}</td>
                    <td><StatusBadge status={item.status} size="small" /></td>
                    <td className="text-sm font-medium text-slate-500">{item.ward}</td>
                    <td>
                      <button className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all" style={{ color: '#1254AF' }}>
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operations Center */}
        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Quick Links</h2>

          <div className="grid grid-cols-1 gap-3">
            {[
              { label: 'Notifications', icon: Bell, path: '/notifications', count: 3, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Ward Map', icon: MapPin, path: '/map', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'My Profile', icon: User, path: '/citizen/profile', color: 'text-blue-600', bg: 'bg-blue-50' }
            ].map((hub, i) => (
              <button key={i} onClick={() => navigate(hub.path)} className={`flex items-center justify-between p-4 ${hub.bg} rounded-xl border border-transparent hover:border-slate-200 transition-all group`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white shadow-sm transition-transform group-hover:scale-110 ${hub.color}`}>
                    <hub.icon size={20} />
                  </div>
                  <span className="font-semibold text-slate-800">{hub.label}</span>
                </div>
                {hub.count && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{hub.count}</span>}
              </button>
            ))}
          </div>

          <div className="bg-slate-900 p-6 rounded-0xl text-white relative overflow-hidden shadow-lg group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/30 transition-all"></div>
            <h3 className="text-lg font-bold mb-2 relative z-10">Help & Support</h3>
            <p className="text-slate-400 text-xs mb-4 relative z-10 font-medium leading-relaxed">Need assistance? Contact our support team for help with your grievances.</p>
            <button className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-blue-50 transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalCitizenDashboard;
