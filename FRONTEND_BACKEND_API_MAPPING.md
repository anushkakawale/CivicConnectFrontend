# 🔗 FRONTEND-TO-BACKEND API MAPPING

> **Last Updated:** January 31, 2026  
> **Purpose:** Complete mapping of frontend pages/components to backend API endpoints  
> **Base URL:** `http://localhost:8083/api`

---

## 📋 TABLE OF CONTENTS

1. [Authentication Pages](#1-authentication-pages)
2. [Citizen Portal](#2-citizen-portal)
3. [Ward Officer Portal](#3-ward-officer-portal)
4. [Department Officer Portal](#4-department-officer-portal)
5. [Admin Portal](#5-admin-portal)
6. [Common Components](#6-common-components)
7. [API Service Methods](#7-api-service-methods)

---

## 1️⃣ AUTHENTICATION PAGES

### Login Page (`/login`)
**Component:** `src/pages/auth/Login.jsx`

#### APIs Used:
```javascript
// Login
POST /api/auth/login
Request: { email, password }
Response: { token, role, userId, name }
```

**Frontend Code:**
```javascript
const handleLogin = async (credentials) => {
  const response = await axios.post('/api/auth/login', credentials);
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('role', response.data.role);
  // Redirect based on role
};
```

---

### Registration Page (`/register`)
**Component:** `src/pages/auth/Register.jsx`

#### APIs Used:
```javascript
// Get Wards (for dropdown)
GET /api/wards
Response: [{ wardId, wardNumber, areaName, zone, population }]

// Register Citizen
POST /api/citizens/register
Request: { name, email, mobile, password, wardId, address }
Response: { message, userId }
```

**Frontend Code:**
```javascript
const loadWards = async () => {
  const response = await axios.get('/api/wards');
  setWards(response.data);
};

const handleRegister = async (formData) => {
  const response = await axios.post('/api/citizens/register', formData);
  // Show success message and redirect to login
};
```

---

## 2️⃣ CITIZEN PORTAL

### Citizen Dashboard (`/citizen/dashboard`)
**Component:** `src/pages/citizen/CitizenDashboard.jsx`

#### APIs Used:
```javascript
// Dashboard Stats
GET /api/citizen/dashboard
Response: {
  totalComplaints,
  pendingComplaints,
  resolvedComplaints,
  closedComplaints,
  slaBreached,
  avgResolutionTime,
  recentComplaints: [...]
}

// Dashboard Counts
GET /api/dashboard/counts
Response: { totalComplaints, pending, inProgress, resolved, closed }

// SLA Stats
GET /api/dashboard/sla
Response: { active, warning, breached, completed }
```

**Frontend Code:**
```javascript
useEffect(() => {
  const fetchDashboard = async () => {
    const stats = await axios.get('/api/citizen/dashboard');
    const counts = await axios.get('/api/dashboard/counts');
    const sla = await axios.get('/api/dashboard/sla');
    setDashboardData({ ...stats.data, ...counts.data, ...sla.data });
  };
  fetchDashboard();
}, []);
```

---

### My Complaints (`/citizen/my-complaints`)
**Component:** `src/pages/citizen/MyComplaints.jsx`

#### APIs Used:
```javascript
// Get My Complaints (Paginated)
GET /api/citizen/complaints?page=0&size=10&status=IN_PROGRESS&priority=HIGH
Response: {
  content: [...],
  totalElements,
  totalPages,
  currentPage
}
```

**Frontend Code:**
```javascript
const fetchComplaints = async (page = 0, filters = {}) => {
  const params = new URLSearchParams({
    page,
    size: 10,
    ...filters
  });
  const response = await axios.get(`/api/citizen/complaints?${params}`);
  setComplaints(response.data.content);
  setTotalPages(response.data.totalPages);
};
```

---

### Create Complaint (`/citizen/create-complaint`)
**Component:** `src/pages/citizen/CreateComplaint.jsx`

#### APIs Used:
```javascript
// Get Wards
GET /api/wards

// Get Departments
GET /api/departments

// Create Complaint
POST /api/citizen/complaints
Content-Type: multipart/form-data
FormData: {
  title,
  description,
  category,
  priority,
  location,
  latitude,
  longitude,
  wardId,
  departmentId,
  images: [file1, file2]
}
Response: { complaintId, message, status }
```

**Frontend Code:**
```javascript
const handleSubmit = async (formData) => {
  const data = new FormData();
  data.append('title', formData.title);
  data.append('description', formData.description);
  // ... other fields
  formData.images.forEach(image => {
    data.append('images', image);
  });
  
  const response = await axios.post('/api/citizen/complaints', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  // Redirect to complaint details
};
```

---

### Complaint Details (`/citizen/complaint/:id`)
**Component:** `src/pages/citizen/ComplaintDetails.jsx`

#### APIs Used:
```javascript
// Get Complaint Details
GET /api/complaints/{complaintId}/details
Response: {
  complaintId,
  title,
  description,
  status,
  priority,
  images: [...],
  timeline: [...],
  feedback: {...},
  canReopen,
  slaDeadline,
  slaStatus
}

// Upload Image
POST /api/complaints/{complaintId}/images
FormData: { file, stage }

// Reopen Complaint
PUT /api/complaints/{complaintId}/reopen
Request: { reason }

// Submit Feedback
POST /api/complaints/{complaintId}/feedback
Request: { rating, comment }
```

**Frontend Code:**
```javascript
useEffect(() => {
  const fetchDetails = async () => {
    const response = await axios.get(`/api/complaints/${id}/details`);
    setComplaint(response.data);
  };
  fetchDetails();
}, [id]);

const handleReopen = async (reason) => {
  await axios.put(`/api/complaints/${id}/reopen`, { reason });
  // Refresh complaint details
};

const handleFeedback = async (rating, comment) => {
  await axios.post(`/api/complaints/${id}/feedback`, { rating, comment });
  // Refresh complaint details
};
```

---

### Area Complaints (`/citizen/area-complaints`)
**Component:** `src/pages/citizen/AreaComplaints.jsx`

#### APIs Used:
```javascript
// Get Area Complaints
GET /api/citizen/area-complaints?page=0&size=10
Response: { content: [...], totalElements, totalPages }
```

---

### Officer Directory (`/citizen/officers`)
**Component:** `src/pages/citizen/OfficerDirectory.jsx`

#### APIs Used:
```javascript
// Get Ward Officer
GET /api/citizen/officers/ward-officer
Response: { officerId, name, email, mobile, department, role }

// Get Department Officers
GET /api/citizen/officers/department-officers
Response: [{ officerId, name, email, mobile, department, role }]

// Get All Officers in Ward
GET /api/citizens/officers
Response: [...]

// Get Officer Details
GET /api/citizens/officers/{officerUserId}
Response: { officerId, name, email, mobile, department, role }
```

---

### Citizen Profile (`/citizen/profile`)
**Component:** `src/pages/citizen/Profile.jsx`

#### APIs Used:
```javascript
// Get Profile
GET /api/profile/citizen
Response: {
  userId,
  name,
  email,
  mobile,
  ward,
  address,
  totalComplaints,
  joinedDate
}

// Update Name
PUT /api/profile/name
Request: { name }

// Change Password
PUT /api/profile/password
Request: { currentPassword, newPassword }

// Update Address
PUT /api/profile/citizen/address
Request: { address }

// Request Ward Change
PUT /api/profile/citizen/ward
Request: { wardId }
```

---

### Citizen Map (`/citizen/map`)
**Component:** `src/pages/citizen/Map.jsx`

#### APIs Used:
```javascript
// Get Ward Map Data
GET /api/citizens/map/ward
Response: {
  wardId,
  wardName,
  complaints: [{ complaintId, title, latitude, longitude, status, priority }]
}
```

---

### Notifications (`/citizen/notifications`)
**Component:** `src/pages/citizen/Notifications.jsx`

#### APIs Used:
```javascript
// Get All Notifications
GET /api/notifications
Response: [{ notificationId, title, message, type, read, createdAt, complaintId }]

// Get Unread Notifications
GET /api/notifications/unread

// Get Unread Count
GET /api/notifications/unread/count
Response: { unreadCount }

// Mark as Read
PUT /api/notifications/{id}/read

// Mark All as Read
PUT /api/notifications/read-all
Response: { message, updatedCount, unreadCount }

// Delete Notification
DELETE /api/notifications/{id}

// Clear Read Notifications
DELETE /api/notifications/clear-read
```

---

## 3️⃣ WARD OFFICER PORTAL

### Ward Officer Dashboard (`/ward-officer/dashboard`)
**Component:** `src/pages/wardOfficer/WardOfficerDashboard.jsx`

#### APIs Used:
```javascript
// Dashboard Stats
GET /api/ward-officer/dashboard

// Pending Approvals
GET /api/ward-officer/dashboard/pending-approvals

// Dashboard Counts
GET /api/dashboard/counts

// SLA Stats
GET /api/dashboard/sla

// Analytics
GET /api/ward-officer/analytics/dashboard
```

---

### Ward Complaints (`/ward-officer/complaints`)
**Component:** `src/pages/wardOfficer/Complaints.jsx`

#### APIs Used:
```javascript
// Get Ward Complaints
GET /api/ward-officer/complaints?page=0&size=10&status=SUBMITTED

// Approve Complaint
PUT /api/ward-officer/complaints/{complaintId}/approve
Request: { assignedOfficerId, priority, notes }

// Reject Complaint
PUT /api/ward-officer/complaints/{complaintId}/reject
Request: { reason, notes }

// Assign Complaint
PUT /api/ward-officer/complaints/{complaintId}/assign
Request: { officerId, priority }
```

---

### Pending Approvals (`/ward-officer/pending-approvals`)
**Component:** `src/pages/wardOfficer/PendingApprovals.jsx`

#### APIs Used:
```javascript
// Get Pending Approvals
GET /api/ward-officer/dashboard/pending-approvals
Response: [{
  complaintId,
  title,
  status,
  priority,
  submittedAt,
  citizenName
}]
```

---

### Department Officers (`/ward-officer/officers`)
**Component:** `src/pages/wardOfficer/DepartmentOfficers.jsx`

#### APIs Used:
```javascript
// Get Department Officers
GET /api/ward-officer/department-officers

// Register Department Officer
POST /api/ward-officer/register/department-officer
Request: {
  name,
  email,
  mobile,
  password,
  departmentId,
  wardId
}
```

---

### Ward Change Requests (`/ward-officer/ward-changes`)
**Component:** `src/pages/wardOfficer/WardChangeRequests.jsx`

#### APIs Used:
```javascript
// Get Pending Requests
GET /api/ward-change/pending

// Approve Request
PUT /api/ward-change/{requestId}/approve
Request: { remarks }

// Reject Request
PUT /api/ward-change/{requestId}/reject
Request: { remarks }
```

---

### Ward Officer Analytics (`/ward-officer/analytics`)
**Component:** `src/pages/wardOfficer/Analytics.jsx`

#### APIs Used:
```javascript
// Get Dashboard Analytics
GET /api/ward-officer/analytics/dashboard

// Get Department Distribution
GET /api/ward-officer/analytics/department-distribution

// Get Monthly Trends
GET /api/ward-officer/analytics/monthly-trends
```

---

### Ward Map (`/ward-officer/map`)
**Component:** `src/pages/wardOfficer/Map.jsx`

#### APIs Used:
```javascript
// Get Ward Map View
GET /api/ward/map
```

---

## 4️⃣ DEPARTMENT OFFICER PORTAL

### Department Officer Dashboard (`/department/dashboard`)
**Component:** `src/pages/department/DepartmentDashboard.jsx`

#### APIs Used:
```javascript
// Dashboard Summary
GET /api/department/dashboard/summary

// Assigned Complaints
GET /api/department/dashboard/assigned?page=0&size=10

// Dashboard Counts
GET /api/dashboard/counts

// SLA Stats
GET /api/dashboard/sla

// Analytics
GET /api/department/analytics/dashboard
```

---

### Department Complaints (`/department/complaints`)
**Component:** `src/pages/department/Complaints.jsx`

#### APIs Used:
```javascript
// Get My Complaints
GET /api/department/complaints?page=0&size=10&status=ASSIGNED

// Mark as In Progress
PUT /api/department/complaints/{complaintId}/in-progress
Request: { notes }

// Resolve Complaint
PUT /api/department/complaints/{complaintId}/resolve
Request: { resolutionNotes, workDetails }

// Upload Image
POST /api/complaints/{complaintId}/images
FormData: { file, stage: 'IN_PROGRESS' }
```

---

### Department Analytics (`/department/analytics`)
**Component:** `src/pages/department/Analytics.jsx`

#### APIs Used:
```javascript
// Get Dashboard Analytics
GET /api/department/analytics/dashboard

// Get Pending Work
GET /api/department/analytics/pending-work

// Get Trends
GET /api/department/analytics/trends
```

---

### Department Map (`/department/map`)
**Component:** `src/pages/department/Map.jsx`

#### APIs Used:
```javascript
// Get Department Map View
GET /api/department/map
```

---

### Department Officers (`/department/officers`)
**Component:** `src/pages/department/Officers.jsx`

#### APIs Used:
```javascript
// Get Ward Officer
GET /api/department/officers/ward-officer
```

---

## 5️⃣ ADMIN PORTAL

### Admin Dashboard (`/admin/dashboard`)
**Component:** `src/pages/admin/AdminDashboard.jsx`

#### APIs Used:
```javascript
// Dashboard Stats
GET /api/admin/dashboard/ready-to-close

// Dashboard Counts
GET /api/dashboard/counts

// SLA Stats
GET /api/dashboard/sla

// City-Wide Analytics
GET /api/admin/analytics/dashboard

// Charts
GET /api/admin/charts/complaints-by-ward
GET /api/admin/charts/complaints-by-department
GET /api/admin/charts/sla-stats
```

---

### All Complaints (`/admin/complaints`)
**Component:** `src/pages/admin/AllComplaints.jsx`

#### APIs Used:
```javascript
// Get All Complaints
GET /api/admin/complaints?page=0&size=20&status=CLOSED&wardId=1

// Close Complaint
PUT /api/admin/complaints/{complaintId}/close
Request: { closureNotes }

// Get Escalated Complaints
GET /api/admin/complaints/escalated
```

---

### Ready to Close (`/admin/ready-to-close`)
**Component:** `src/pages/admin/ReadyToClose.jsx`

#### APIs Used:
```javascript
// Get Ready to Close Complaints
GET /api/admin/dashboard/ready-to-close

// Close Complaint
PUT /api/admin/complaints/{complaintId}/close
Request: { closureNotes }
```

---

### Officer Management (`/admin/officers`)
**Component:** `src/pages/admin/OfficerManagement.jsx`

#### APIs Used:
```javascript
// Get All Officers
GET /api/admin/officers

// Register Ward Officer
POST /api/admin/register/ward-officer
Request: {
  name,
  email,
  mobile,
  password,
  wardId
}
```

---

### Admin Analytics (`/admin/analytics`)
**Component:** `src/pages/admin/Analytics.jsx`

#### APIs Used:
```javascript
// Get City-Wide Dashboard
GET /api/admin/analytics/dashboard

// Get Monthly Trends
GET /api/admin/analytics/monthly-trends

// Get Priority Distribution
GET /api/admin/analytics/priority-distribution

// Get Top Performers
GET /api/admin/analytics/top-performers

// SLA Analytics
GET /api/admin/analytics/sla/overall
GET /api/admin/analytics/sla/department/{departmentId}
```

---

### Admin Map (`/admin/map`)
**Component:** `src/pages/admin/Map.jsx`

#### APIs Used:
```javascript
// Get City Map
GET /api/admin/map/city

// Get Ward Map
GET /api/admin/map/ward/{wardId}

// Get Map Statistics
GET /api/map/statistics?wardId=1&departmentId=2

// Get Hotspots
GET /api/map/hotspots
```

---

### Audit Logs (`/admin/audit`)
**Component:** `src/pages/admin/AuditLogs.jsx`

#### APIs Used:
```javascript
// Get Audit Logs
GET /api/admin/audit/logs?action=CREATE&entityType=COMPLAINT&userId=42&page=0&size=20

// Get Audit Summary
GET /api/admin/audit/summary
```

---

### Export (`/admin/export`)
**Component:** `src/pages/admin/Export.jsx`

#### APIs Used:
```javascript
// Export Complaints to Excel
GET /api/admin/export/complaints/excel?wardId=1&departmentId=2&status=CLOSED
Response: Excel file download
```

---

## 6️⃣ COMMON COMPONENTS

### Navbar Component
**Component:** `src/components/layout/Navbar.jsx`

#### APIs Used:
```javascript
// Get Unread Count
GET /api/notifications/unread/count
Response: { unreadCount }

// Get Profile (for user name)
GET /api/profile
```

---

### Notification Bell Component
**Component:** `src/components/common/NotificationBell.jsx`

#### APIs Used:
```javascript
// Get Unread Notifications
GET /api/notifications/unread

// Get Unread Count
GET /api/notifications/unread/count

// Mark as Read
PUT /api/notifications/{id}/read
```

---

### Map Component
**Component:** `src/components/common/Map.jsx`

#### APIs Used:
```javascript
// Get Active Complaints for Map
GET /api/map/active-complaints?wardId=1&departmentId=2

// Get Complaint Details (on marker click)
GET /api/complaints/{complaintId}/details
```

---

### Image Viewer Component
**Component:** `src/components/common/ImageViewer.jsx`

#### APIs Used:
```javascript
// Get Image
GET /api/images/{complaintId}/{fileName}
Response: Image file
```

---

## 7️⃣ API SERVICE METHODS

### `src/services/apiService.js`

```javascript
// Authentication
export const login = (credentials) => 
  axios.post('/api/auth/login', credentials);

// Citizen
export const getCitizenDashboard = () => 
  axios.get('/api/citizen/dashboard');

export const getMyComplaints = (params) => 
  axios.get('/api/citizen/complaints', { params });

export const createComplaint = (formData) => 
  axios.post('/api/citizen/complaints', formData);

export const getAreaComplaints = (params) => 
  axios.get('/api/citizen/area-complaints', { params });

// Complaints
export const getComplaintDetails = (id) => 
  axios.get(`/api/complaints/${id}/details`);

export const uploadImage = (complaintId, formData) => 
  axios.post(`/api/complaints/${complaintId}/images`, formData);

export const reopenComplaint = (id, reason) => 
  axios.put(`/api/complaints/${id}/reopen`, { reason });

export const submitFeedback = (id, data) => 
  axios.post(`/api/complaints/${id}/feedback`, data);

// Ward Officer
export const getWardComplaints = (params) => 
  axios.get('/api/ward-officer/complaints', { params });

export const approveComplaint = (id, data) => 
  axios.put(`/api/ward-officer/complaints/${id}/approve`, data);

export const rejectComplaint = (id, data) => 
  axios.put(`/api/ward-officer/complaints/${id}/reject`, data);

export const assignComplaint = (id, data) => 
  axios.put(`/api/ward-officer/complaints/${id}/assign`, data);

// Department Officer
export const getDepartmentComplaints = (params) => 
  axios.get('/api/department/complaints', { params });

export const markInProgress = (id, notes) => 
  axios.put(`/api/department/complaints/${id}/in-progress`, { notes });

export const resolveComplaint = (id, data) => 
  axios.put(`/api/department/complaints/${id}/resolve`, data);

// Admin
export const getAllComplaints = (params) => 
  axios.get('/api/admin/complaints', { params });

export const closeComplaint = (id, notes) => 
  axios.put(`/api/admin/complaints/${id}/close`, { closureNotes: notes });

export const getReadyToClose = () => 
  axios.get('/api/admin/dashboard/ready-to-close');

export const getAllOfficers = () => 
  axios.get('/api/admin/officers');

export const registerWardOfficer = (data) => 
  axios.post('/api/admin/register/ward-officer', data);

// Notifications
export const getNotifications = () => 
  axios.get('/api/notifications');

export const getUnreadNotifications = () => 
  axios.get('/api/notifications/unread');

export const getUnreadCount = () => 
  axios.get('/api/notifications/unread/count');

export const markAsRead = (id) => 
  axios.put(`/api/notifications/${id}/read`);

export const markAllAsRead = () => 
  axios.put('/api/notifications/read-all');

export const deleteNotification = (id) => 
  axios.delete(`/api/notifications/${id}`);

export const clearReadNotifications = () => 
  axios.delete('/api/notifications/clear-read');

// Profile
export const getProfile = () => 
  axios.get('/api/profile');

export const updateName = (name) => 
  axios.put('/api/profile/name', { name });

export const changePassword = (data) => 
  axios.put('/api/profile/password', data);

export const updateAddress = (address) => 
  axios.put('/api/profile/citizen/address', { address });

// Mobile OTP
export const requestMobileOtp = (newMobile) => 
  axios.post('/api/profile/mobile/request-otp', { newMobile });

export const verifyMobileOtp = (otp) => 
  axios.post('/api/profile/mobile/verify-otp', { otp });

// Master Data
export const getWards = () => 
  axios.get('/api/wards');

export const getDepartments = () => 
  axios.get('/api/departments');

// Map
export const getMapData = (params) => 
  axios.get('/api/complaints/map', { params });

export const getActiveComplaints = (params) => 
  axios.get('/api/map/active-complaints', { params });

export const getMapStatistics = (params) => 
  axios.get('/api/map/statistics', { params });

export const getHotspots = () => 
  axios.get('/api/map/hotspots');

// Analytics
export const getDashboardCounts = () => 
  axios.get('/api/dashboard/counts');

export const getSlaStats = () => 
  axios.get('/api/dashboard/sla');

export const getAdminAnalytics = () => 
  axios.get('/api/admin/analytics/dashboard');

export const getWardOfficerAnalytics = () => 
  axios.get('/api/ward-officer/analytics/dashboard');

export const getDepartmentAnalytics = () => 
  axios.get('/api/department/analytics/dashboard');

// Charts
export const getComplaintsByWard = () => 
  axios.get('/api/admin/charts/complaints-by-ward');

export const getComplaintsByDepartment = () => 
  axios.get('/api/admin/charts/complaints-by-department');

export const getSlaChartStats = () => 
  axios.get('/api/admin/charts/sla-stats');

// Export
export const exportComplaints = (params) => 
  axios.get('/api/admin/export/complaints/excel', { 
    params,
    responseType: 'blob' 
  });

// Audit
export const getAuditLogs = (params) => 
  axios.get('/api/admin/audit/logs', { params });

export const getAuditSummary = () => 
  axios.get('/api/admin/audit/summary');

// Ward Change
export const requestWardChange = (wardId) => 
  axios.post('/api/ward-change/request', { wardId });

export const getMyWardChangeRequests = () => 
  axios.get('/api/ward-change/my-requests');

export const getPendingWardChanges = () => 
  axios.get('/api/ward-change/pending');

export const approveWardChange = (id, remarks) => 
  axios.put(`/api/ward-change/${id}/approve`, { remarks });

export const rejectWardChange = (id, remarks) => 
  axios.put(`/api/ward-change/${id}/reject`, { remarks });

// Search
export const searchComplaints = (query, params) => 
  axios.get('/api/search/complaints', { 
    params: { query, ...params } 
  });

// Officers
export const getWardOfficer = () => 
  axios.get('/api/citizen/officers/ward-officer');

export const getDepartmentOfficers = () => 
  axios.get('/api/citizen/officers/department-officers');

export const getAllOfficersInWard = () => 
  axios.get('/api/citizens/officers');

export const getOfficerDetails = (userId) => 
  axios.get(`/api/citizens/officers/${userId}`);
```

---

## 📊 SUMMARY

### Total API Endpoints: ~120+
### Total Frontend Pages: ~40+
### Total Components: ~60+

### API Usage by Role:
- **Citizen:** ~25 endpoints
- **Ward Officer:** ~20 endpoints
- **Department Officer:** ~15 endpoints
- **Admin:** ~35 endpoints
- **Common/Shared:** ~25 endpoints

### Most Used APIs:
1. `GET /api/notifications/unread/count` (used in all layouts)
2. `GET /api/dashboard/counts` (used in all dashboards)
3. `GET /api/complaints/{id}/details` (used in all complaint views)
4. `GET /api/profile` (used in all profile pages)
5. `GET /api/wards` (used in registration and complaint creation)

---

**End of Document**
