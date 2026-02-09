import apiService from '../api/apiService';

const wardOfficerService = {
    // ✅ Main analytics dashboard (Consolidated)
    getDashboardAnalytics: () =>
        apiService.wardOfficer.getDashboardAnalytics(),

    // ✅ Monthly trends
    getMonthlyTrends: () =>
        apiService.wardOfficer.getMonthlyTrends(),

    // ✅ Department Distribution
    getDepartmentDistribution: () =>
        apiService.wardOfficer.getDepartmentDistribution(),

    // ✅ Complaint Management
    // ✅ Complaint Management
    getWardComplaints: () =>
        apiService.wardOfficer.getWardComplaints(),

    // ✅ Approve Request
    approveComplaint: (id, data) =>
        apiService.wardOfficer.approveComplaint(id, data),

    // ✅ Reject Request
    rejectComplaint: (id, remarks) =>
        apiService.wardOfficer.rejectComplaint(id, remarks),

    // ✅ Ward Changes
    getPendingWardChanges: () =>
        apiService.wardOfficer.getPendingWardChanges(),

    approveWardChange: (id, remarks) =>
        apiService.wardOfficer.approveWardChange(id, remarks),

    rejectWardChange: (id, remarks) =>
        apiService.wardOfficer.rejectWardChange(id, remarks),

    // ✅ Staff
    registerDepartmentOfficer: (data) =>
        apiService.wardOfficer.registerDepartmentOfficer(data),

    getDepartmentOfficers: () =>
        apiService.wardOfficer.getDepartmentOfficers(),

    // ✅ Map
    getMapView: () =>
        apiService.wardOfficer.getMapData()
};

export default wardOfficerService;
