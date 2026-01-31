import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Activity,
  Users,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

// Mock data for charts
const mockChartData = {
  complaintsByMonth: [
    { month: 'Jan', count: 45 },
    { month: 'Feb', count: 52 },
    { month: 'Mar', count: 38 },
    { month: 'Apr', count: 61 },
    { month: 'May', count: 55 },
    { month: 'Jun', count: 48 }
  ],
  complaintsByCategory: [
    { category: 'Water Supply', count: 120, color: '#3B82F6' },
    { category: 'Sanitation', count: 85, color: '#10B981' },
    { category: 'Roads', count: 65, color: '#F59E0B' },
    { category: 'Electricity', count: 95, color: '#EF4444' },
    { category: 'Waste Management', count: 45, color: '#8B5CF6' },
    { category: 'Public Safety', count: 30, color: '#EC4899' }
  ],
  slaPerformance: [
    { month: 'Jan', performance: 92 },
    { month: 'Feb', performance: 88 },
    { month: 'Mar', performance: 95 },
    { month: 'Apr', performance: 91 },
    { month: 'May', performance: 94 },
    { month: 'Jun', performance: 96 }
  ],
  resolutionTime: [
    { department: 'Water Supply', avgTime: 2.3 },
    { department: 'Sanitation', avgTime: 3.1 },
    { department: 'Roads', avgTime: 4.5 },
    { department: 'Electricity', avgTime: 1.8 },
    { department: 'Waste Management', avgTime: 1.2 },
    { department: 'Public Safety', avgTime: 0.8 }
  ]
};

export const ComplaintsBarChart = ({ height = 300 }) => {
  const maxValue = Math.max(...mockChartData.complaintsByMonth.map(d => d.count));
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Complaints Trend</h3>
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <TrendingUp className="w-4 h-4" />
          <span>+12% vs last month</span>
        </div>
      </div>
      
      <div className="relative" style={{ height }}>
        <div className="absolute inset-0 flex items-end justify-between px-2">
          {mockChartData.complaintsByMonth.map((data, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                style={{ 
                  height: `${(data.count / maxValue) * 100}%`,
                  minHeight: '4px'
                }}
              />
              <span className="text-xs text-slate-600 mt-2 text-center">{data.month}</span>
              <span className="text-xs font-medium text-slate-900">{data.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CategoryPieChart = () => {
  const total = mockChartData.complaintsByCategory.reduce((sum, cat) => sum + cat.count, 0);
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Complaints by Category</h3>
      
      <div className="space-y-3">
        {mockChartData.complaintsByCategory.map((category, index) => {
          const percentage = ((category.count / total) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-900">{category.category}</span>
                  <span className="text-sm text-slate-600">{category.count}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: category.color
                    }}
                  />
                </div>
              </div>
              <span className="text-xs text-slate-500 w-12 text-right">{percentage}%</span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Total Complaints</span>
          <span className="font-semibold text-slate-900">{total}</span>
        </div>
      </div>
    </div>
  );
};

export const SLAPerformanceChart = ({ height = 250 }) => {
  const maxValue = 100;
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">SLA Performance</h3>
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <TrendingUp className="w-4 h-4" />
          <span>96% target met</span>
        </div>
      </div>
      
      <div className="relative" style={{ height }}>
        <div className="absolute inset-0 flex items-end justify-between px-2">
          {mockChartData.slaPerformance.map((data, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className={`w-full rounded-t transition-all duration-300 ${
                  data.performance >= 95 ? 'bg-green-500' : 
                  data.performance >= 90 ? 'bg-amber-500' : 'bg-red-500'
                } hover:opacity-80`}
                style={{ 
                  height: `${(data.performance / maxValue) * 100}%`,
                  minHeight: '4px'
                }}
              />
              <span className="text-xs text-slate-600 mt-2 text-center">{data.month}</span>
              <span className="text-xs font-medium text-slate-900">{data.performance}%</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="text-center">
            <div className="text-green-600 font-semibold">Excellent</div>
            <div className="text-slate-600">≥95%</div>
          </div>
          <div className="text-center">
            <div className="text-amber-600 font-semibold">Good</div>
            <div className="text-slate-600">90-94%</div>
          </div>
          <div className="text-center">
            <div className="text-red-600 font-semibold">Poor</div>
            <div className="text-slate-600">&lt;90%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ResolutionTimeChart = () => {
  const maxTime = Math.max(...mockChartData.resolutionTime.map(d => d.avgTime));
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Avg Resolution Time (Days)</h3>
      
      <div className="space-y-3">
        {mockChartData.resolutionTime.map((dept, index) => {
          const performance = dept.avgTime <= 2 ? 'excellent' : dept.avgTime <= 3 ? 'good' : 'poor';
          const color = performance === 'excellent' ? 'text-green-600' : performance === 'good' ? 'text-amber-600' : 'text-red-600';
          
          return (
            <div key={index} className="flex items-center space-x-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-900">{dept.department}</span>
                  <span className={`text-sm font-medium ${color}`}>{dept.avgTime}d</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      performance === 'excellent' ? 'bg-green-500' : 
                      performance === 'good' ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${((maxTime - dept.avgTime) / maxTime) * 100}%`
                    }}
                  />
                </div>
              </div>
              <div className="w-8 text-right">
                <Clock className={`w-4 h-4 ${color} inline-block`} />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Department Average</span>
          <span className="font-semibold text-slate-900">
            {(mockChartData.resolutionTime.reduce((sum, d) => sum + d.avgTime, 0) / mockChartData.resolutionTime.length).toFixed(1)}d
          </span>
        </div>
      </div>
    </div>
  );
};

export const StatsOverview = () => {
  const stats = [
    { label: 'Total Complaints', value: '440', icon: FileText, color: 'blue', trend: 'up' },
    { label: 'Resolved', value: '385', icon: CheckCircle, color: 'green', trend: 'up' },
    { label: 'In Progress', value: '35', icon: Clock, color: 'amber', trend: 'down' },
    { label: 'Pending', value: '20', icon: AlertTriangle, color: 'red', trend: 'down' }
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-xl p-4 shadow-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                <Icon className={`w-4 h-4 text-${stat.color}-600`} />
              </div>
              {stat.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-sm text-slate-600">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export default {
  ComplaintsBarChart,
  CategoryPieChart,
  SLAPerformanceChart,
  ResolutionTimeChart,
  StatsOverview
};
