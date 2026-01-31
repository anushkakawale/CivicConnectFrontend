import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  BarChart3,
  Activity,
  Building2,
  Shield,
  Settings,
  Calendar,
  MapPin,
  Eye
} from 'lucide-react';
import ModernLayout from '../components/layout/ModernLayout';
import { StatsCard, GovButton, GovBadge, GovAlert } from '../components/ui/GovComponents';

const ProfessionalAdminDashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('email') || 'Admin';
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    activeOfficers: 0,
    systemHealth: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [slaCompliance, setSlaCompliance] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch admin dashboard data
    setTimeout(() => {
      setStats({
        totalUsers: 15420,
        totalComplaints: 3420,
        pendingComplaints: 234,
        resolvedComplaints: 2890,
        activeOfficers: 45,
        systemHealth: 98
      });
      
      setRecentActivity([
        {
          id: 1,
          type: 'complaint_registered',
          message: 'New complaint registered by citizen',
          user: 'john.doe@email.com',
          time: '5 minutes ago',
          priority: 'medium'
        },
        {
          id: 2,
          type: 'officer_assigned',
          message: 'Department officer assigned to complaint',
          user: 'ward.officer@city.gov',
          time: '15 minutes ago',
          priority: 'low'
        },
        {
          id: 3,
          type: 'sla_breach',
          message: 'SLA breach alert for complaint #2341',
          user: 'system',
          time: '1 hour ago',
          priority: 'high'
        },
        {
          id: 4,
          type: 'complaint_resolved',
          message: 'Complaint resolved successfully',
          user: 'dept.officer@city.gov',
          time: '2 hours ago',
          priority: 'low'
        }
      ]);

      setSlaCompliance({
        overall: 94.5,
        infrastructure: 96.2,
        sanitation: 92.8,
        water: 91.5,
        electricity: 97.1
      });

      setLoading(false);
    }, 1000);
  }, []);

  const getActivityIcon = (type) => {
    const icons = {
      'complaint_registered': FileText,
      'officer_assigned': Users,
      'sla_breach': AlertTriangle,
      'complaint_resolved': CheckCircle,
      'system_alert': Settings
    };
    return icons[type] || Activity;
  };

  const getActivityColor = (priority) => {
    const colors = {
      'high': 'red',
      'medium': 'amber',
      'low': 'green'
    };
    return colors[priority] || 'blue';
  };

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'View and manage all users',
      icon: Users,
      color: 'blue',
      path: '/admin/users',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Register Ward Officer',
      description: 'Add new ward officers',
      icon: UserPlus,
      color: 'green',
      path: '/admin/register-ward-officer',
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'System Analytics',
      description: 'View detailed analytics',
      icon: BarChart3,
      color: 'purple',
      path: '/admin/analytics',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'System Settings',
      description: 'Configure system settings',
      icon: Settings,
      color: 'amber',
      path: '/admin/settings',
      gradient: 'from-amber-500 to-amber-600'
    }
  ];

  if (loading) {
    return (
      <ModernLayout role="ADMIN" userName={userName}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout role="ADMIN" userName={userName}>
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-purple-100">System overview and management console</p>
              <div className="flex items-center space-x-4 mt-4">
                <GovBadge variant="secondary" className="bg-white/20 text-white border-white/30">
                  System Administrator
                </GovBadge>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-purple-100 text-sm">System Online</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.systemHealth}%</div>
                  <div className="text-purple-100 text-sm">System Health</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change="+12% this month"
          icon={Users}
          color="blue"
          trend="up"
        />
        <StatsCard
          title="Total Complaints"
          value={stats.totalComplaints.toLocaleString()}
          change="+8% this week"
          icon={FileText}
          color="purple"
          trend="up"
        />
        <StatsCard
          title="Pending"
          value={stats.pendingComplaints.toLocaleString()}
          change="Needs attention"
          icon={Clock}
          color="amber"
          trend="down"
        />
        <StatsCard
          title="Resolved"
          value={stats.resolvedComplaints.toLocaleString()}
          change="+15% improvement"
          icon={CheckCircle}
          color="green"
          trend="up"
        />
        <StatsCard
          title="Active Officers"
          value={stats.activeOfficers}
          change="All departments"
          icon={Shield}
          color="blue"
          trend="up"
        />
        <StatsCard
          title="SLA Compliance"
          value={`${slaCompliance.overall}%`}
          change="Above target"
          icon={TrendingUp}
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
                
                <div className={`p-3 rounded-xl bg-gradient-to-br ${action.gradient} text-white shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-slate-600">
                  {action.description}
                </p>
                
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-purple-600 text-sm font-medium">Manage →</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Recent Activity</h2>
            <GovButton variant="outline" size="sm">
              View All Activity
            </GovButton>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-200">
              {recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-lg bg-${getActivityColor(activity.priority)}-100`}>
                        <Icon className={`w-5 h-5 text-${getActivityColor(activity.priority)}-600`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-slate-900">{activity.message}</p>
                          <GovBadge variant={getActivityColor(activity.priority)} size="sm">
                            {activity.priority}
                          </GovBadge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <span>{activity.user}</span>
                          <span>•</span>
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SLA Compliance */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">SLA Compliance</h2>
          
          <div className="space-y-6">
            {/* Overall SLA */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-green-900">Overall Compliance</h3>
                <span className="text-2xl font-bold text-green-600">{slaCompliance.overall}%</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${slaCompliance.overall}%` }}
                ></div>
              </div>
              <p className="text-green-700 text-sm mt-2">Above target threshold</p>
            </div>

            {/* Department-wise SLA */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4">Department SLA</h3>
              <div className="space-y-4">
                {Object.entries(slaCompliance).filter(([key]) => key !== 'overall').map(([dept, compliance]) => (
                  <div key={dept} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 capitalize">{dept}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            compliance >= 95 ? 'bg-green-500' : 
                            compliance >= 90 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${compliance}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-slate-900">{compliance}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Alerts */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4">System Alerts</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">SLA Breach Risk</p>
                    <p className="text-xs text-red-700">3 complaints approaching deadline</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-900">Pending Approvals</p>
                    <p className="text-xs text-amber-700">8 officer registrations pending</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900">System Overview</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Server Uptime</span>
              <span className="font-medium text-slate-900">99.9%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Response Time</span>
              <span className="font-medium text-slate-900">1.2s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Database Health</span>
              <span className="font-medium text-green-600">Optimal</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900">User Activity</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Active Today</span>
              <span className="font-medium text-slate-900">342</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">New Registrations</span>
              <span className="font-medium text-slate-900">28</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Engagement Rate</span>
              <span className="font-medium text-slate-900">87%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Performance</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Avg. Resolution Time</span>
              <span className="font-medium text-slate-900">2.3 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Satisfaction Score</span>
              <span className="font-medium text-slate-900">4.6/5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Efficiency Index</span>
              <span className="font-medium text-green-600">+12%</span>
            </div>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
};

export default ProfessionalAdminDashboard;
