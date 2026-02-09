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
  AlertTriangle,
  Timer,
  Target,
  Zap,
  Shield,
  Calendar,
  BarChart,
  LineChart
} from 'lucide-react';

// Enhanced mock data with SLA metrics
const mockChartData = {
  complaintsByMonth: [
    { month: 'Jan', count: 45, resolved: 42, breached: 3 },
    { month: 'Feb', count: 52, resolved: 48, breached: 4 },
    { month: 'Mar', count: 38, resolved: 36, breached: 2 },
    { month: 'Apr', count: 61, resolved: 55, breached: 6 },
    { month: 'May', count: 55, resolved: 52, breached: 3 },
    { month: 'Jun', count: 48, resolved: 46, breached: 2 }
  ],
  complaintsByCategory: [
    { category: 'Water Supply', count: 120, color: '#3B82F6', slaHours: 24, compliance: 96.2 },
    { category: 'Sanitation', count: 85, color: '#10B981', slaHours: 36, compliance: 92.8 },
    { category: 'Roads', count: 65, color: '#F59E0B', slaHours: 72, compliance: 89.5 },
    { category: 'Electricity', count: 95, color: '#EF4444', slaHours: 24, compliance: 97.1 },
    { category: 'Waste Management', count: 45, color: '#8B5CF6', slaHours: 12, compliance: 95.3 },
    { category: 'Public Safety', count: 30, color: '#EC4899', slaHours: 6, compliance: 98.7 }
  ],
  slaPerformance: [
    { month: 'Jan', performance: 92, breached: 8, onTime: 42 },
    { month: 'Feb', performance: 88, breached: 12, onTime: 40 },
    { month: 'Mar', performance: 95, breached: 2, onTime: 36 },
    { month: 'Apr', performance: 91, breached: 6, onTime: 55 },
    { month: 'May', performance: 94, breached: 3, onTime: 52 },
    { month: 'Jun', performance: 96, breached: 2, onTime: 46 }
  ],
  resolutionTime: [
    { department: 'Water Supply', avgTime: 2.3, slaHours: 24, compliance: 96.2 },
    { department: 'Sanitation', avgTime: 3.1, slaHours: 36, compliance: 92.8 },
    { department: 'Roads', avgTime: 4.5, slaHours: 72, compliance: 89.5 },
    { department: 'Electricity', avgTime: 1.8, slaHours: 24, compliance: 97.1 },
    { department: 'Waste Management', avgTime: 1.2, slaHours: 12, compliance: 95.3 },
    { department: 'Public Safety', avgTime: 0.8, slaHours: 6, compliance: 98.7 }
  ],
  realTimeSLA: [
    { time: '00:00', active: 45, critical: 5, breached: 2 },
    { time: '04:00', active: 42, critical: 4, breached: 2 },
    { time: '08:00', active: 58, critical: 8, breached: 3 },
    { time: '12:00', active: 62, critical: 12, breached: 5 },
    { time: '16:00', active: 55, critical: 7, breached: 4 },
    { time: '20:00', active: 48, critical: 6, breached: 3 }
  ]
};

export const ComplaintsBarChart = ({ height = 300 }) => {
  const maxValue = Math.max(...mockChartData.complaintsByMonth.map(d => d.count));
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Complaints Trend with SLA</h3>
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <TrendingUp className="w-4 h-4" />
          <span>+12% vs last month</span>
        </div>
      </div>
      
      <div className="relative" style={{ height }}>
        <div className="absolute inset-0 flex items-end justify-between px-2">
          {mockChartData.complaintsByMonth.map((data, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="flex items-end space-x-1 w-full">
                <div 
                  className="flex-1 bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600"
                  style={{ 
                    height: `${(data.resolved / maxValue) * 100}%`,
                    minHeight: '4px'
                  }}
                  title={`Resolved: ${data.resolved}`}
                />
                <div 
                  className="flex-1 bg-red-500 rounded-t transition-all duration-300 hover:bg-red-600"
                  style={{ 
                    height: `${(data.breached / maxValue) * 100}%`,
                    minHeight: '4px'
                  }}
                  title={`Breached: ${data.breached}`}
                />
              </div>
              <span className="text-xs text-slate-600 mt-2 text-center">{data.month}</span>
              <span className="text-xs font-medium text-slate-900">{data.count}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-center space-x-6 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-0"></div>
          <span className="text-slate-600">Resolved</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-0"></div>
          <span className="text-slate-600">Breached</span>
        </div>
      </div>
    </div>
  );
};

export const CategoryPieChart = () => {
  const total = mockChartData.complaintsByCategory.reduce((sum, cat) => sum + cat.count, 0);
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Categories with SLA Compliance</h3>
      
      <div className="space-y-3">
        {mockChartData.complaintsByCategory.map((category, index) => {
          const percentage = ((category.count / total) * 100).toFixed(1);
          const complianceColor = category.compliance >= 95 ? 'text-green-600' : category.compliance >= 90 ? 'text-amber-600' : 'text-red-600';
          
          return (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-900">{category.category}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600">{category.count}</span>
                    <span className={`text-xs font-medium ${complianceColor}`}>{category.compliance}%</span>
                  </div>
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
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-slate-500">{percentage}%</span>
                  <span className="text-xs text-slate-500">SLA: {category.slaHours}h</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Total Complaints</span>
          <span className="font-semibold text-slate-900">{total}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-slate-600">Avg SLA Compliance</span>
          <span className="font-semibold text-green-600">
            {(mockChartData.complaintsByCategory.reduce((sum, cat) => sum + cat.compliance, 0) / mockChartData.complaintsByCategory.length).toFixed(1)}%
          </span>
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
        <h3 className="text-lg font-semibold text-slate-900">SLA Performance Trend</h3>
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <TrendingUp className="w-4 h-4" />
          <span>96% target met</span>
        </div>
      </div>
      
      <div className="relative" style={{ height }}>
        <div className="absolute inset-0 flex items-end justify-between px-2">
          {mockChartData.slaPerformance.map((data, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="flex items-end space-x-1 w-full">
                <div 
                  className="flex-1 bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600"
                  style={{ 
                    height: `${(data.onTime / (data.onTime + data.breached)) * 100}%`,
                    minHeight: '4px'
                  }}
                  title={`On Time: ${data.onTime}`}
                />
                <div 
                  className="flex-1 bg-red-500 rounded-t transition-all duration-300 hover:bg-red-600"
                  style={{ 
                    height: `${(data.breached / (data.onTime + data.breached)) * 100}%`,
                    minHeight: '4px'
                  }}
                  title={`Breached: ${data.breached}`}
                />
              </div>
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
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Resolution Time vs SLA</h3>
      
      <div className="space-y-3">
        {mockChartData.resolutionTime.map((dept, index) => {
          const slaUtilization = (dept.avgTime / dept.slaHours) * 100;
          const performance = slaUtilization <= 80 ? 'excellent' : slaUtilization <= 95 ? 'good' : 'poor';
          const color = performance === 'excellent' ? 'text-green-600' : performance === 'good' ? 'text-amber-600' : 'text-red-600';
          const bgColor = performance === 'excellent' ? 'bg-green-500' : performance === 'good' ? 'bg-amber-500' : 'bg-red-500';
          
          return (
            <div key={index} className="flex items-center space-x-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-900">{dept.department}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${color}`}>{dept.avgTime}d</span>
                    <span className="text-xs text-slate-500">/ {dept.slaHours}h SLA</span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${bgColor}`}
                    style={{ 
                      width: `${Math.min(slaUtilization, 100)}%`
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-slate-500">SLA Utilization: {slaUtilization.toFixed(1)}%</span>
                  <span className={`text-xs font-medium ${color}`}>{dept.compliance}% compliance</span>
                </div>
              </div>
              <div className="w-8 text-right">
                <Timer className={`w-4 h-4 ${color} inline-block`} />
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
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-slate-600">Average SLA Compliance</span>
          <span className="font-semibold text-green-600">
            {(mockChartData.resolutionTime.reduce((sum, d) => sum + d.compliance, 0) / mockChartData.resolutionTime.length).toFixed(1)}%
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
    { label: 'SLA Breached', value: '20', icon: AlertTriangle, color: 'red', trend: 'down' }
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-xl p-4 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
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

// New Real-time SLA Chart
export const RealTimeSLAChart = ({ height = 200 }) => {
  const maxActive = Math.max(...mockChartData.realTimeSLA.map(d => d.active));
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Real-time SLA Monitoring</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-600">Live</span>
        </div>
      </div>
      
      <div className="relative" style={{ height }}>
        <div className="absolute inset-0 flex items-end justify-between px-2">
          {mockChartData.realTimeSLA.map((data, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="flex items-end space-x-1 w-full">
                <div 
                  className="flex-1 bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                  style={{ 
                    height: `${(data.active / maxActive) * 100}%`,
                    minHeight: '4px'
                  }}
                  title={`Active: ${data.active}`}
                />
                <div 
                  className="flex-1 bg-amber-500 rounded-t transition-all duration-300 hover:bg-amber-600"
                  style={{ 
                    height: `${(data.critical / maxActive) * 100}%`,
                    minHeight: '4px'
                  }}
                  title={`Critical: ${data.critical}`}
                />
                <div 
                  className="flex-1 bg-red-500 rounded-t transition-all duration-300 hover:bg-red-600"
                  style={{ 
                    height: `${(data.breached / maxActive) * 100}%`,
                    minHeight: '4px'
                  }}
                  title={`Breached: ${data.breached}`}
                />
              </div>
              <span className="text-xs text-slate-600 mt-2 text-center">{data.time}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-center space-x-6 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-0"></div>
          <span className="text-slate-600">Active</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-amber-500 rounded-0"></div>
          <span className="text-slate-600">Critical</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-0"></div>
          <span className="text-slate-600">Breached</span>
        </div>
      </div>
    </div>
  );
};

// SLA Heatmap Component
export const SLAHeatmap = () => {
  const departments = ['Water', 'Sanitation', 'Roads', 'Electricity', 'Waste', 'Safety'];
  const timeSlots = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
  
  const getHeatmapColor = (value) => {
    if (value >= 95) return 'bg-green-500';
    if (value >= 90) return 'bg-amber-500';
    if (value >= 80) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">SLA Performance Heatmap</h3>
      
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="grid grid-cols-7 gap-1">
            <div className="text-xs font-medium text-slate-600 p-2">Department</div>
            {timeSlots.map((slot) => (
              <div key={slot} className="text-xs font-medium text-slate-600 p-2 text-center">
                {slot}
              </div>
            ))}
          </div>
          
          {departments.map((dept, deptIndex) => (
            <div key={dept} className="grid grid-cols-7 gap-1">
              <div className="text-xs font-medium text-slate-700 p-2">{dept}</div>
              {timeSlots.map((slot, slotIndex) => {
                const performance = 85 + Math.random() * 15; // Random performance for demo
                const colorClass = getHeatmapColor(performance);
                
                return (
                  <div
                    key={slot}
                    className={`${colorClass} rounded-0 p-2 text-center text-xs text-white font-medium hover:opacity-80 transition-opacity cursor-pointer`}
                    title={`${dept} at ${slot}: ${performance.toFixed(1)}%`}
                  >
                    {performance.toFixed(0)}%
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-0"></div>
          <span className="text-slate-600">≥95%</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-amber-500 rounded-0"></div>
          <span className="text-slate-600">90-94%</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-orange-500 rounded-0"></div>
          <span className="text-slate-600">80-89%</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-0"></div>
          <span className="text-slate-600">&lt;80%</span>
        </div>
      </div>
    </div>
  );
};

export default {
  ComplaintsBarChart,
  CategoryPieChart,
  SLAPerformanceChart,
  ResolutionTimeChart,
  StatsOverview,
  RealTimeSLAChart,
  SLAHeatmap
};
