import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  FileText,
  MapPin,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Activity,
  Calendar,
  MessageSquare,
  Building2
} from 'lucide-react';
import ModernLayout from '../components/layout/ModernLayout';
import { StatsCard, GovButton, GovBadge, GovAlert } from '../components/ui/GovComponents';

const ProfessionalCitizenDashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('email') || 'Citizen';
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    inProgressComplaints: 0
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading citizen dashboard data...');

      // Import API service dynamically
      const apiService = (await import('../api/apiService')).default;

      // Fetch dashboard stats
      const dashboardData = await apiService.citizen.getDashboard();
      console.log('✅ Dashboard data received:', dashboardData);

      setStats({
        totalComplaints: dashboardData.totalComplaints || 0,
        pendingComplaints: dashboardData.pendingComplaints || 0,
        resolvedComplaints: dashboardData.resolvedComplaints || 0,
        inProgressComplaints: dashboardData.inProgressComplaints || 0
      });

      // Fetch recent complaints
      const complaintsData = await apiService.citizen.getMyComplaints(0, 5);
      console.log('✅ Recent complaints received:', complaintsData);

      if (complaintsData.content && Array.isArray(complaintsData.content)) {
        const formattedComplaints = complaintsData.content.map(c => ({
          id: `CMP-${c.complaintId}`,
          title: c.title,
          status: c.status,
          date: new Date(c.createdAt).toLocaleDateString(),
          category: c.category || c.department?.departmentName || 'General'
        }));
        setRecentComplaints(formattedComplaints);
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading dashboard:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      // Set default values on error
      setStats({
        totalComplaints: 0,
        pendingComplaints: 0,
        resolvedComplaints: 0,
        inProgressComplaints: 0
      });
      setRecentComplaints([]);
      setLoading(false);

      // Show error notification
      if (error.response?.status === 403) {
        console.warn('⚠️ Access forbidden. Please check backend security configuration.');
      } else if (error.response?.status === 401) {
        console.warn('⚠️ Unauthorized. Please login again.');
      } else {
        console.warn('⚠️ Failed to load dashboard data. Using default values.');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'warning',
      'IN_PROGRESS': 'info',
      'RESOLVED': 'success',
      'REJECTED': 'danger'
    };
    return colors[status] || 'secondary';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'PENDING': Clock,
      'IN_PROGRESS': Activity,
      'RESOLVED': CheckCircle,
      'REJECTED': AlertCircle
    };
    return icons[status] || Clock;
  };

  const quickActions = [
    {
      title: 'Register Complaint',
      description: 'File a new civic issue',
      icon: PlusCircle,
      color: 'blue',
      path: '/citizen/complaints/new',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'My Complaints',
      description: 'View and track your complaints',
      icon: FileText,
      color: 'purple',
      path: '/citizen/complaints',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Ward Complaints',
      description: 'View complaints in your area',
      icon: MapPin,
      color: 'green',
      path: '/citizen/ward-complaints',
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Contact Officers',
      description: 'Connect with local officers',
      icon: Users,
      color: 'amber',
      path: '/citizen/officers',
      gradient: 'from-amber-500 to-amber-600'
    }
  ];

  if (loading) {
    return (
      <ModernLayout role="CITIZEN" userName={userName}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout role="CITIZEN" userName={userName}>
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-xl">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">Welcome back, {userName}!</h1>
              <p className="text-blue-100">Your voice matters in building a better community</p>
              <div className="flex items-center space-x-4 mt-3">
                <GovBadge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Active Citizen
                </GovBadge>
                <span className="text-blue-100 text-sm">
                  Member since January 2024
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Complaints"
          value={stats.totalComplaints}
          change="+2 this month"
          icon={FileText}
          color="blue"
          trend="up"
        />
        <StatsCard
          title="Pending"
          value={stats.pendingComplaints}
          change="Awaiting action"
          icon={Clock}
          color="amber"
          trend="down"
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgressComplaints}
          change="Being processed"
          icon={Activity}
          color="blue"
          trend="up"
        />
        <StatsCard
          title="Resolved"
          value={stats.resolvedComplaints}
          change="+1 this week"
          icon={CheckCircle}
          color="green"
          trend="up"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="group relative overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-left border border-slate-200 hover:border-transparent"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                <div className={`p-2 rounded-xl bg-gradient-to-br ${action.gradient} text-white shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-4 h-4" />
                </div>

                <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-slate-600">
                  {action.description}
                </p>

                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-blue-600 text-sm font-medium">Get Started →</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Complaints List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Recent Complaints</h2>
            <GovButton variant="outline" size="sm" onClick={() => navigate('/citizen/complaints')}>
              View All
            </GovButton>
          </div>

          <div className="space-y-4">
            {recentComplaints.map((complaint) => {
              const StatusIcon = getStatusIcon(complaint.status);
              return (
                <div
                  key={complaint.id}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-transparent cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm font-medium text-slate-500">{complaint.id}</span>
                        <GovBadge variant={getStatusColor(complaint.status)} size="sm">
                          <div className="flex items-center space-x-1">
                            <StatusIcon className="w-3 h-3" />
                            <span>{complaint.status.replace('_', ' ')}</span>
                          </div>
                        </GovBadge>
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-2">{complaint.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          {complaint.date}
                        </span>
                        <span className="flex items-center space-x-1">
                          <FileText className="w-4 h-4" />
                          {complaint.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity & Updates */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Activity & Updates</h2>

          <div className="space-y-6">
            {/* System Status */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-500 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">System Operational</h3>
                  <p className="text-green-700 text-sm">All services running normally</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-600">Response Time:</span>
                  <span className="text-green-900 font-medium ml-2">2.3 hours</span>
                </div>
                <div>
                  <span className="text-green-600">Resolution Rate:</span>
                  <span className="text-green-900 font-medium ml-2">94%</span>
                </div>
              </div>
            </div>

            {/* Recent Updates */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4">Recent Updates</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-900">New comment on complaint #CMP-002</p>
                    <p className="text-xs text-slate-500 mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-900">Complaint #CMP-001 resolved</p>
                    <p className="text-xs text-slate-500 mt-1">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-900">Scheduled maintenance tonight</p>
                    <p className="text-xs text-slate-500 mt-1">2 days ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">Need Help?</h3>
              <p className="text-blue-700 text-sm mb-4">
                Get assistance with your complaints or learn more about our services.
              </p>
              <GovButton variant="primary" size="sm" className="w-full">
                Contact Support
              </GovButton>
            </div>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
};

export default ProfessionalCitizenDashboard;
