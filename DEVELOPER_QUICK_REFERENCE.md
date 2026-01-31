# 🚀 DEVELOPER QUICK REFERENCE GUIDE

> **Fast lookup for common tasks and API calls**

---

## 🔐 AUTHENTICATION

### Login
```javascript
import apiService from '../api/apiService';

const handleLogin = async (email, password) => {
  try {
    const response = await apiService.auth.login({ email, password });
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('role', response.data.role);
    // Redirect based on role
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Logout
```javascript
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  navigate('/');
};
```

### Check if Authenticated
```javascript
const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

const getUserRole = () => {
  return localStorage.getItem('role');
};
```

---

## 👤 CITIZEN APIS

### Create Complaint
```javascript
const createComplaint = async (complaintData, images) => {
  const formData = new FormData();
  
  // Add text fields
  formData.append('title', complaintData.title);
  formData.append('description', complaintData.description);
  formData.append('category', complaintData.category);
  formData.append('priority', complaintData.priority);
  formData.append('location', complaintData.location);
  formData.append('latitude', complaintData.latitude);
  formData.append('longitude', complaintData.longitude);
  formData.append('wardId', complaintData.wardId);
  formData.append('departmentId', complaintData.departmentId);
  
  // Add images
  images.forEach(image => {
    formData.append('images', image);
  });
  
  const response = await apiService.complaints.create(formData);
  return response.data;
};
```

### Get My Complaints
```javascript
const getMyComplaints = async (page = 0, size = 10, filters = {}) => {
  const response = await apiService.citizen.getMyComplaints({
    page,
    size,
    status: filters.status,
    priority: filters.priority,
    slaStatus: filters.slaStatus
  });
  return response.data;
};
```

### Get Complaint Details
```javascript
const getComplaintDetails = async (complaintId) => {
  const response = await apiService.complaints.getById(complaintId);
  return response.data;
};
```

### Upload Image to Complaint
```javascript
const uploadImage = async (complaintId, imageFile, type = 'BEFORE_WORK') => {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('type', type); // BEFORE_WORK, IN_PROGRESS, AFTER_RESOLUTION
  
  const response = await apiService.complaints.uploadImage(complaintId, formData);
  return response.data;
};
```

### Reopen Complaint
```javascript
const reopenComplaint = async (complaintId, reason) => {
  const response = await apiService.complaints.reopen(complaintId, reason);
  return response.data;
};
```

### Submit Feedback
```javascript
const submitFeedback = async (complaintId, rating, comment) => {
  const response = await apiService.complaints.submitFeedback(
    complaintId,
    rating,
    comment
  );
  return response.data;
};
```

---

## 🏢 WARD OFFICER APIS

### Get Ward Complaints
```javascript
const getWardComplaints = async (filters = {}) => {
  const response = await apiService.wardOfficer.getComplaints({
    page: filters.page || 0,
    size: filters.size || 10,
    status: filters.status,
    slaStatus: filters.slaStatus
  });
  return response.data;
};
```

### Approve Complaint
```javascript
const approveComplaint = async (complaintId, assignedOfficerId, priority) => {
  const response = await apiService.wardOfficer.approveComplaint(complaintId, {
    assignedOfficerId,
    priority,
    notes: 'Approved and assigned'
  });
  return response.data;
};
```

### Reject Complaint
```javascript
const rejectComplaint = async (complaintId, reason) => {
  const response = await apiService.wardOfficer.rejectComplaint(complaintId, {
    reason,
    notes: 'Rejected due to invalid information'
  });
  return response.data;
};
```

### Assign Complaint
```javascript
const assignComplaint = async (complaintId, officerId, priority) => {
  const response = await apiService.wardOfficer.assignComplaint(complaintId, {
    officerId,
    priority
  });
  return response.data;
};
```

---

## 🔧 DEPARTMENT OFFICER APIS

### Get Assigned Complaints
```javascript
const getAssignedComplaints = async (filters = {}) => {
  const response = await apiService.departmentOfficer.getComplaints({
    page: filters.page || 0,
    size: filters.size || 10,
    status: filters.status
  });
  return response.data;
};
```

### Mark as In Progress
```javascript
const markInProgress = async (complaintId, notes) => {
  const response = await apiService.departmentOfficer.markInProgress(
    complaintId,
    { notes }
  );
  return response.data;
};
```

### Resolve Complaint
```javascript
const resolveComplaint = async (complaintId, resolutionNotes, workDetails) => {
  const response = await apiService.departmentOfficer.resolveComplaint(
    complaintId,
    { resolutionNotes, workDetails }
  );
  return response.data;
};
```

---

## 👨‍💼 ADMIN APIS

### Get All Complaints
```javascript
const getAllComplaints = async (filters = {}) => {
  const response = await apiService.admin.getComplaints({
    page: filters.page || 0,
    size: filters.size || 20,
    status: filters.status,
    wardId: filters.wardId
  });
  return response.data;
};
```

### Close Complaint
```javascript
const closeComplaint = async (complaintId, closureNotes) => {
  const response = await apiService.admin.closeComplaint(complaintId, {
    closureNotes
  });
  return response.data;
};
```

### Get All Users
```javascript
const getAllUsers = async (filters = {}) => {
  const response = await apiService.admin.getUsers({
    page: filters.page || 0,
    size: filters.size || 20,
    role: filters.role
  });
  return response.data;
};
```

### Create User
```javascript
const createUser = async (userData) => {
  const response = await apiService.admin.createUser({
    name: userData.name,
    email: userData.email,
    mobile: userData.mobile,
    password: userData.password,
    role: userData.role, // WARD_OFFICER, DEPARTMENT_OFFICER
    wardId: userData.wardId,
    departmentId: userData.departmentId
  });
  return response.data;
};
```

---

## 🔔 NOTIFICATIONS

### Get All Notifications
```javascript
const getNotifications = async () => {
  const response = await apiService.notifications.getAll();
  return response.data;
};
```

### Get Unread Count
```javascript
const getUnreadCount = async () => {
  const response = await apiService.notifications.getUnreadCount();
  return response.data.count;
};
```

### Mark as Read
```javascript
const markAsRead = async (notificationId) => {
  await apiService.notifications.markAsRead(notificationId);
};
```

### Mark All as Read
```javascript
const markAllAsRead = async () => {
  await apiService.notifications.markAllAsRead();
};
```

---

## 📊 MASTER DATA

### Get Wards
```javascript
const getWards = async () => {
  const response = await apiService.masterData.getWards();
  return response.data;
};
```

### Get Departments
```javascript
const getDepartments = async () => {
  const response = await apiService.masterData.getDepartments();
  return response.data;
};
```

---

## 🗺️ MAP

### Get Map Complaints
```javascript
const getMapComplaints = async (filters = {}) => {
  const response = await apiService.map.getComplaints({
    status: filters.status,
    wardId: filters.wardId
  });
  return response.data;
};
```

---

## ⏱️ SLA

### Get SLA Dashboard
```javascript
const getSLADashboard = async () => {
  const response = await apiService.sla.getDashboard();
  return response.data;
  // Returns: { ACTIVE: 45, WARNING: 12, BREACHED: 5, COMPLETED: 200 }
};
```

---

## 🎨 UI COMPONENTS

### Show Toast Notification
```javascript
import { useToast } from '../components/ui/ToastProvider';

const { showToast } = useToast();

// Success
showToast('Complaint created successfully!', 'success');

// Error
showToast('Failed to upload image', 'error');

// Warning
showToast('SLA deadline approaching', 'warning');

// Info
showToast('New notification received', 'info');
```

### Show Confirm Dialog
```javascript
import { useState } from 'react';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const [showConfirm, setShowConfirm] = useState(false);

const handleDelete = async () => {
  // Delete logic
  setShowConfirm(false);
};

<ConfirmDialog
  isOpen={showConfirm}
  title="Delete Complaint?"
  message="This action cannot be undone. Are you sure?"
  onConfirm={handleDelete}
  onCancel={() => setShowConfirm(false)}
  variant="danger"
/>
```

### Show Loading Spinner
```javascript
import LoadingSpinner from '../components/ui/LoadingSpinner';

{loading && <LoadingSpinner />}
```

---

## 🪝 CUSTOM HOOKS

### useAuth
```javascript
import { useAuth } from '../hooks/useAuth';

const { user, isAuthenticated, login, logout } = useAuth();

if (!isAuthenticated) {
  return <Navigate to="/" />;
}
```

### useMasterData
```javascript
import { useMasterData } from '../hooks/useMasterData';

const { wards, departments, loading } = useMasterData();

<select>
  {wards.map(ward => (
    <option key={ward.wardId} value={ward.wardId}>
      {ward.areaName}
    </option>
  ))}
</select>
```

### useTheme
```javascript
import { useTheme } from '../hooks/useTheme';

const { theme, toggleTheme } = useTheme();

<button onClick={toggleTheme}>
  {theme === 'light' ? '🌙' : '☀️'}
</button>
```

---

## 🛠️ UTILITY FUNCTIONS

### Format Date
```javascript
import { formatDate, formatDateTime, formatRelativeTime } from '../utils/dateFormatter';

formatDate('2026-01-30T10:30:00');        // "Jan 30, 2026"
formatDateTime('2026-01-30T10:30:00');    // "Jan 30, 2026 10:30 AM"
formatRelativeTime('2026-01-30T10:30:00'); // "2 hours ago"
```

### Calculate SLA
```javascript
import { calculateTimeRemaining, getSLAStatus } from '../utils/slaCalculator';

const { hours, minutes, isBreached } = calculateTimeRemaining(deadline);
const status = getSLAStatus(deadline); // ACTIVE, WARNING, BREACHED
```

### Validate Form
```javascript
import { validateEmail, validateMobile, validatePassword } from '../utils/validators';

const errors = {};

if (!validateEmail(email)) {
  errors.email = 'Invalid email address';
}

if (!validateMobile(mobile)) {
  errors.mobile = 'Invalid mobile number';
}

if (!validatePassword(password)) {
  errors.password = 'Password must be at least 8 characters';
}
```

### Handle Errors
```javascript
import { handleApiError } from '../utils/errorHandler';

try {
  await apiService.complaints.create(data);
} catch (error) {
  const message = handleApiError(error);
  showToast(message, 'error');
}
```

---

## 📱 RESPONSIVE DESIGN

### Breakpoints
```javascript
// Mobile: 0-639px
// Tablet: 640px-1023px
// Desktop: 1024px+

// CSS
@media (min-width: 640px) {
  /* Tablet styles */
}

@media (min-width: 1024px) {
  /* Desktop styles */
}

// JavaScript
const isMobile = window.innerWidth < 640;
const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;
const isDesktop = window.innerWidth >= 1024;
```

---

## 🎯 COMMON PATTERNS

### Fetch Data on Mount
```javascript
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await apiService.citizen.getMyComplaints();
      setComplaints(data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);
```

### Handle Form Submit
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate
  const errors = validateForm(formData);
  if (Object.keys(errors).length > 0) {
    setErrors(errors);
    return;
  }
  
  // Submit
  try {
    setSubmitting(true);
    await apiService.complaints.create(formData);
    showToast('Complaint created successfully!', 'success');
    navigate('/citizen/complaints');
  } catch (error) {
    showToast(handleApiError(error), 'error');
  } finally {
    setSubmitting(false);
  }
};
```

### Pagination
```javascript
const [page, setPage] = useState(0);
const [size, setSize] = useState(10);
const [totalPages, setTotalPages] = useState(0);

const fetchComplaints = async () => {
  const response = await apiService.citizen.getMyComplaints({ page, size });
  setComplaints(response.content);
  setTotalPages(response.totalPages);
};

useEffect(() => {
  fetchComplaints();
}, [page, size]);

// Pagination controls
<button onClick={() => setPage(page - 1)} disabled={page === 0}>
  Previous
</button>
<span>Page {page + 1} of {totalPages}</span>
<button onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1}>
  Next
</button>
```

### Filtering
```javascript
const [filters, setFilters] = useState({
  status: '',
  priority: '',
  slaStatus: ''
});

const handleFilterChange = (key, value) => {
  setFilters(prev => ({ ...prev, [key]: value }));
};

const fetchComplaints = async () => {
  const response = await apiService.citizen.getMyComplaints({
    page: 0,
    size: 10,
    ...filters
  });
  setComplaints(response.content);
};

useEffect(() => {
  fetchComplaints();
}, [filters]);
```

---

## 🔒 PROTECTED ROUTES

### Setup
```javascript
import ProtectedRoute from '../components/auth/ProtectedRoute';

<Route
  path="/citizen/dashboard"
  element={
    <ProtectedRoute allowedRoles={['CITIZEN']}>
      <CitizenDashboard />
    </ProtectedRoute>
  }
/>
```

---

## 🗺️ MAP INTEGRATION

### Basic Map Setup
```javascript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

<MapContainer center={[18.5204, 73.8567]} zoom={13}>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='&copy; OpenStreetMap contributors'
  />
  
  {complaints.map(complaint => (
    <Marker
      key={complaint.complaintId}
      position={[complaint.latitude, complaint.longitude]}
    >
      <Popup>
        <h4>{complaint.title}</h4>
        <p>{complaint.status}</p>
      </Popup>
    </Marker>
  ))}
</MapContainer>
```

---

## 📊 CHARTS

### Bar Chart Example
```javascript
import { Bar } from 'react-chartjs-2';

const data = {
  labels: ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed'],
  datasets: [{
    label: 'Complaints',
    data: [12, 19, 8, 15, 25],
    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6b7280']
  }]
};

<Bar data={data} />
```

---

## 🎨 CONSTANTS

### Status Colors
```javascript
import { COMPLAINT_STATUS } from '../constants';

const getStatusColor = (status) => {
  return COMPLAINT_STATUS[status]?.color || 'secondary';
};

const getStatusIcon = (status) => {
  return COMPLAINT_STATUS[status]?.icon || '📋';
};
```

### Priority Colors
```javascript
const PRIORITY_COLORS = {
  CRITICAL: 'danger',
  HIGH: 'warning',
  MEDIUM: 'info',
  LOW: 'success'
};
```

---

## 🚨 ERROR HANDLING

### Global Error Handler
```javascript
// In axios.js
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);
```

---

## 💡 TIPS & BEST PRACTICES

### 1. Always use apiService
```javascript
// ✅ Good
import apiService from '../api/apiService';
const response = await apiService.citizen.getMyComplaints();

// ❌ Bad
import axios from 'axios';
const response = await axios.get('http://localhost:8083/api/citizen/my-complaints');
```

### 2. Handle loading states
```javascript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await apiService.citizen.getMyComplaints();
    setComplaints(data);
  } finally {
    setLoading(false);
  }
};
```

### 3. Show user feedback
```javascript
try {
  await apiService.complaints.create(data);
  showToast('Success!', 'success');
} catch (error) {
  showToast('Failed!', 'error');
}
```

### 4. Validate before submit
```javascript
const errors = validateForm(formData);
if (Object.keys(errors).length > 0) {
  setErrors(errors);
  return;
}
// Proceed with submission
```

### 5. Clean up effects
```javascript
useEffect(() => {
  const interval = setInterval(() => {
    fetchUnreadCount();
  }, 30000);
  
  return () => clearInterval(interval);
}, []);
```

---

## 🔗 QUICK LINKS

- **Full Documentation:** `COMPLETE_PROJECT_DOCUMENTATION.md`
- **Frontend Features:** `FRONTEND_SPECIFIC_FEATURES.md`
- **API Service:** `src/api/apiService.js`
- **Constants:** `src/constants.js`
- **Postman Collection:** `CivicConnect_Postman_Collection.json`

---

**📌 Bookmark this page for quick reference while coding!**
