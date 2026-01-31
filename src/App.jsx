import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ModernLogin from './auth/ModernLogin';
import RegisterCitizen from './auth/RegisterCitizen';
import CitizenLayout from './layouts/CitizenLayout';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import RegisterComplaint from './pages/citizen/RegisterComplaint';
import MyComplaints from './pages/citizen/MyComplaints';
import ComplaintDetail from './pages/citizen/ComplaintDetail';
import ProfilePage from './pages/ProfilePage';
import AreaComplaints from './pages/citizen/AreaComplaints';
import SubmitFeedback from './pages/citizen/SubmitFeedback';
import FeedbackList from './pages/citizen/FeedbackList';
import Notifications from './pages/citizen/Notifications';
import SlaStatus from './pages/citizen/SlaStatus';
import CitizenMap from './pages/citizen/CitizenMap';
import OfficerDirectory from './pages/citizen/OfficerDirectory';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DepartmentLayout from './layouts/DepartmentLayout';
import DepartmentDashboard from './pages/department/DepartmentDashboard';
import DepartmentComplaintDetail from './pages/department/DepartmentComplaintDetail';
import DepartmentAnalyticsEnhanced from './pages/department/DepartmentAnalyticsEnhanced';
import DepartmentMap from './pages/department/DepartmentMap';
import DepartmentNotifications from './pages/department/DepartmentNotifications';
import WardOfficerLayout from './layouts/WardOfficerLayout';
import WardOfficerDashboard from './pages/ward/WardOfficerDashboard';
import ApprovalQueue from './pages/ward/ApprovalQueue';
import WardComplaints from './pages/ward/WardComplaints';
import RegisterDepartmentOfficer from './pages/ward/RegisterDepartmentOfficer';
import WardComplaintDetail from './pages/ward/WardComplaintDetail';
import DepartmentOfficersManagement from './pages/ward/DepartmentOfficersManagement';
import WardAnalytics from './pages/ward/WardAnalytics';
import WardNotifications from './pages/ward/WardNotifications';
import WardChangeManagement from './pages/ward/WardChangeManagement';
import WardMap from './pages/ward/WardMap';
import AdminLayout from './layouts/AdminLayout';
import ProfessionalAdminDashboard from './pages/admin/ProfessionalAdminDashboard';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminComplaintDetail from './pages/admin/AdminComplaintDetail';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import AdminOfficerDirectory from './pages/admin/AdminOfficerDirectory';
import AdminWardOfficerRegistration from './pages/admin/AdminWardOfficerRegistration';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminMap from './pages/admin/AdminMap';
import AdminReports from './pages/admin/AdminReports';
import WardChangeRequests from './pages/citizen/WardChangeRequests';
import ProfessionalWardOfficerDashboard from './pages/ProfessionalWardOfficerDashboard';
import ProfessionalDepartmentOfficerDashboard from './pages/ProfessionalDepartmentOfficerDashboard';
import ApiDiagnostic from './pages/ApiDiagnostic';
import DebugPanel from './components/DebugPanel';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/ui/ToastProvider';
import { ThemeProvider } from './contexts/ThemeContext';
import { MasterDataProvider } from './contexts/MasterDataContext';
import { USER_ROLES } from './constants';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <MasterDataProvider>
          <ToastProvider>
            <DebugPanel />
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<ModernLogin />} />
                <Route path="/register" element={<RegisterCitizen />} />
                <Route path="/diagnostic" element={<ApiDiagnostic />} />

                {/* Citizen Routes with Layout */}
                <Route
                  path="/citizen"
                  element={
                    <ProtectedRoute allowedRoles={[USER_ROLES.CITIZEN]}>
                      <CitizenLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<CitizenDashboard />} />
                  <Route path="complaints" element={<MyComplaints />} />
                  <Route path="register-complaint" element={<RegisterComplaint />} />
                  <Route path="complaint/:id" element={<ComplaintDetail />} />
                  <Route path="area-complaints" element={<AreaComplaints />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="sla" element={<SlaStatus />} />
                  <Route path="feedback/pending" element={<FeedbackList />} />
                  <Route path="feedback/:id" element={<SubmitFeedback />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="officers" element={<OfficerDirectory />} />
                  <Route path="ward-change-requests" element={<WardChangeRequests />} />
                  <Route path="map" element={<CitizenMap />} />
                  <Route index element={<Navigate to="dashboard" replace />} />
                </Route>

                {/* Department Officer Routes */}
                <Route
                  path="/department"
                  element={
                    <ProtectedRoute allowedRoles={[USER_ROLES.DEPARTMENT_OFFICER]}>
                      <DepartmentLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<ProfessionalDepartmentOfficerDashboard />} />
                  <Route path="complaints" element={<DepartmentDashboard />} />
                  <Route path="complaints/:id" element={<DepartmentComplaintDetail />} />
                  <Route path="analytics" element={<DepartmentAnalyticsEnhanced />} />
                  <Route path="map" element={<DepartmentMap />} />
                  <Route path="notifications" element={<DepartmentNotifications />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route index element={<Navigate to="dashboard" replace />} />
                </Route>

                {/* Ward Officer Routes */}
                <Route
                  path="/ward-officer"
                  element={
                    <ProtectedRoute allowedRoles={[USER_ROLES.WARD_OFFICER]}>
                      <WardOfficerLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<ProfessionalWardOfficerDashboard />} />
                  <Route path="approvals" element={<ApprovalQueue />} />
                  <Route path="complaints" element={<WardComplaints />} />
                  <Route path="complaints/:id" element={<WardComplaintDetail />} />
                  <Route path="officers" element={<DepartmentOfficersManagement />} />
                  <Route path="register-officer" element={<RegisterDepartmentOfficer />} />
                  <Route path="analytics" element={<WardAnalytics />} />
                  <Route path="map" element={<WardMap />} />
                  <Route path="notifications" element={<WardNotifications />} />
                  <Route path="ward-changes" element={<WardChangeManagement />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route index element={<Navigate to="dashboard" replace />} />
                </Route>


                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<ProfessionalAdminDashboard />} />
                  <Route path="complaints" element={<AdminComplaints />} />
                  <Route path="complaints/:id" element={<AdminComplaintDetail />} />
                  <Route path="users" element={<AdminUserManagement />} />
                  <Route path="officers" element={<AdminOfficerDirectory />} />
                  <Route path="register-ward-officer" element={<AdminWardOfficerRegistration />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="map" element={<AdminMap />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route index element={<Navigate to="dashboard" replace />} />
                </Route>

                {/* Fallback Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </ToastProvider>
        </MasterDataProvider>
      </ThemeProvider>
    </ErrorBoundary >
  );
}

export default App;
