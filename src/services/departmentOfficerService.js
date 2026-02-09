import apiService from '../api/apiService';

const DepartmentOfficerService = {
    // ✅ Main analytics dashboard (Consolidated stats)
    getDashboardAnalytics: () =>
        apiService.departmentOfficer.getDashboardStats(),

    // ✅ SLA analytics (Read-only overview)
    getSlaAnalytics: () =>
        apiService.departmentOfficer.getSlaStatus(),

    // ✅ Pending work (Priority list)
    getPendingWork: () =>
        apiService.departmentOfficer.getPendingWork(),

    // ✅ Assigned complaints (Table view)
    getAssignedComplaints: (params) =>
        apiService.departmentOfficer.getAssignedComplaints(params),

    // ✅ Map view (Department filtered)
    getMapView: () =>
        apiService.departmentOfficer.getMapData(),

    // ✅ Start work on complaint 
    startWork: (complaintId) =>
        apiService.departmentOfficer.startWork(complaintId),

    // ✅ Resolve complaint
    resolveComplaint: (complaintId, remarks) =>
        apiService.departmentOfficer.resolveComplaint(complaintId, remarks),

    // ✅ Get specific complaint details
    getComplaintById: (complaintId) =>
        apiService.departmentOfficer.getComplaintDetails(complaintId),

    // ✅ Profile
    getProfile: () =>
        apiService.departmentOfficer.getProfile()
};

export default DepartmentOfficerService;
