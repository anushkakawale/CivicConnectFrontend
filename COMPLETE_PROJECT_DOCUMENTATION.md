# 🏗 CIVICCONNECT – COMPLETE PROJECT DOCUMENTATION

> **Last Updated:** January 31, 2026  
> **Version:** 1.0  
> **Base URL:** `http://localhost:8083/api`  
> **Frontend Port:** `5173` (Vite Dev Server)

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Architecture & Tech Stack](#2-architecture--tech-stack)
3. [User Roles & Permissions](#3-user-roles--permissions)
4. [Complete API Reference](#4-complete-api-reference)
5. [Frontend Structure](#5-frontend-structure)
6. [Page-to-API Mapping](#6-page-to-api-mapping)
7. [Data Flow & State Management](#7-data-flow--state-management)
8. [Features Implemented](#8-features-implemented)
9. [Features NOT Yet Implemented](#9-features-not-yet-implemented)
10. [Postman Collection](#10-postman-collection)
11. [Quick Start Guide](#11-quick-start-guide)

---

## 1️⃣ PROJECT OVERVIEW

**CivicConnect** is a comprehensive civic complaint management system for municipal corporations. It enables citizens to register complaints, track their resolution, and provide feedback, while allowing officers to manage and resolve issues efficiently.

### 🎯 Core Objectives

- **Citizen Empowerment:** Easy complaint registration with image upload and GPS location
- **Officer Efficiency:** Role-based dashboards with SLA tracking
- **Transparency:** Real-time status updates and notifications
- **Accountability:** Complete audit trail and analytics

### 🔑 Key Features

✅ Multi-role authentication (Citizen, Ward Officer, Department Officer, Admin)  
✅ Complaint lifecycle management with status tracking  
✅ SLA (Service Level Agreement) monitoring with breach alerts  
✅ Image upload for complaints (before/during/after)  
✅ Real-time notifications  
✅ Interactive map view with complaint clustering  
✅ Analytics and reporting dashboards  
✅ Ward change request workflow  
✅ Officer directory  
✅ Feedback and rating system  

---

## 2️⃣ ARCHITECTURE & TECH STACK

### Backend Stack
- **Framework:** Spring Boot 3.x
- **Database:** MySQL
- **Authentication:** JWT (JSON Web Tokens)
- **File Storage:** Local file system (images)
- **API Documentation:** Swagger/OpenAPI

### Frontend Stack
- **Framework:** React 18.x
- **Build Tool:** Vite
- **Routing:** React Router v6
- **State Management:** Redux Toolkit + Context API
- **HTTP Client:** Axios
- **UI Framework:** Bootstrap 5 + Custom CSS
- **Maps:** Leaflet.js
- **Charts:** Chart.js / Recharts
- **Styling:** CSS Modules + Tailwind CSS (optional)

### Architecture Pattern
```
┌─────────────┐      JWT Auth      ┌──────────────┐
│   React     │ ◄─────────────────► │ Spring Boot  │
│  Frontend   │    REST APIs       │   Backend    │
└─────────────┘                     └──────────────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │    MySQL     │
                                    │   Database   │
                                    └──────────────┘
```

---

## 3️⃣ USER ROLES & PERMISSIONS

### 🔵 CITIZEN
**Can:**
- Register and login
- Create complaints with images and GPS location
- View own complaints
- View area complaints (same ward)
- Track complaint status and SLA
- Reopen closed complaints
- Submit feedback/ratings
- View officer directory
- Request ward change
- Receive notifications

**Cannot:**
- Assign or update complaint status
- Access other wards' data
- Manage users

---

### 🟢 WARD OFFICER
**Can:**
- View all complaints in assigned ward
- Approve/reject submitted complaints
- Assign complaints to department officers
- Monitor SLA compliance in ward
- Manage department officers
- Register new department officers
- View ward analytics
- Approve ward change requests

**Cannot:**
- Resolve complaints (only department officers can)
- Access other wards
- Manage system-wide settings

---

### 🟡 DEPARTMENT OFFICER
**Can:**
- View assigned complaints (own ward + own department)
- Update complaint status (In Progress → Resolved)
- Upload progress images
- Add work notes
- View department analytics
- Receive SLA alerts

**Cannot:**
- Approve/reject complaints
- Assign complaints
- Access other departments or wards

---

### 🔴 ADMIN
**Can:**
- View all complaints across all wards
- Close complaints
- Manage all users (create, update, delete)
- Register ward officers
- View system-wide analytics
- Access audit logs
- View city-wide map
- Generate reports
- Manage escalated complaints

**Cannot:**
- (Full system access)

---

## 4️⃣ COMPLETE API REFERENCE

### 🔐 AUTHENTICATION APIs

#### Register Citizen
```http
POST /api/auth/register
Content-Type: application/json
```
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "9876543210",
  "password": "Password@123",
  "wardId": 1,
  "address": "123 Main Street, Pune"
}
```
**Response:**
```json
{
  "message": "User registered successfully",
  "userId": 42
}
```

---

#### Login
```http
POST /api/auth/login
Content-Type: application/json
```
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password@123"
}
```
**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "CITIZEN",
  "userId": 42,
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Frontend Usage:**
```javascript
// Store token in localStorage
localStorage.setItem('token', response.token);
localStorage.setItem('role', response.role);

// Add to all subsequent requests
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

---

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

---

### 📊 MASTER DATA APIs

#### Get All Wards
```http
GET /api/wards
```
**Response:**
```json
[
  {
    "wardId": 1,
    "number": 1,
    "areaName": "Shivaji Nagar",
    "zone": "Central",
    "population": 50000
  }
]
```

---

#### Get All Departments
```http
GET /api/departments
```
**Response:**
```json
[
  {
    "departmentId": 1,
    "name": "Water Supply",
    "icon": "💧",
    "slaHours": 24,
    "priority": "HIGH",
    "description": "Water supply, leakage, pressure issues"
  }
]
```

---

### 👤 CITIZEN APIs

#### Get Citizen Dashboard
```http
GET /api/citizen/dashboard
Authorization: Bearer {token}

```
**Response:**
```json
{
  "totalComplaints": 15,
  "pendingComplaints": 5,
  "resolvedComplaints": 8,
  "closedComplaints": 2,
  "recentComplaints": [...],
  "slaBreached": 1,
  "avgResolutionTime": 36.5
}
```

---

#### Get My Complaints (Paginated)
```http
GET /api/citizen/my-complaints?page=0&size=10&status=IN_PROGRESS&priority=HIGH
Authorization: Bearer {token}
```
**Query Parameters:**
- `page` (optional): Page number (default: 0)
- `size` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (SUBMITTED, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED, etc.)
- `priority` (optional): Filter by priority (LOW, MEDIUM, HIGH, CRITICAL)
- `slaStatus` (optional): Filter by SLA status (ACTIVE, WARNING, BREACHED, COMPLETED)

**Response:**
```json
{
  "content": [
    {
      "complaintId": 123,
      "title": "Street light not working",
      "description": "Dark area at night",
      "status": "IN_PROGRESS",
      "priority": "MEDIUM",
      "slaStatus": "ACTIVE",
      "createdAt": "2026-01-30T10:30:00",
      "department": "Electricity",
      "ward": "Shivaji Nagar",
      "assignedOfficer": "Officer Name",
      "imageCount": 2,
      "latitude": 18.5204,
      "longitude": 73.8567
    }
  ],
  "totalElements": 15,
  "totalPages": 2,
  "currentPage": 0,
  "size": 10
}
```

---

#### Create Complaint
```http
POST /api/citizen/complaints
Authorization: Bearer {token}
Content-Type: multipart/form-data
```
**Form Data:**
```
title: "Pothole on Main Road"
description: "Deep pothole causing accidents"
category: "Roads"
priority: "HIGH"
location: "Main Road, Near City Mall"
latitude: 18.5204
longitude: 73.8567
wardId: 1
departmentId: 3
images: [file1.jpg, file2.jpg] (optional, multiple files)
```

**Response:**
```json
{
  "complaintId": 124,
  "message": "Complaint registered successfully",
  "status": "SUBMITTED"
}
```

---

#### Get Area Complaints
```http
GET /api/citizen/area-complaints?wardId=1
Authorization: Bearer {token}
```
**Response:** Same structure as My Complaints

---

#### Get Officers in My Ward
```http
GET /api/citizen/officers?departmentId=1
Authorization: Bearer {token}
```
**Response:**
```json
[
  {
    "officerId": 10,
    "name": "Officer Name",
    "email": "officer@civic.com",
    "mobile": "9876543210",
    "department": "Water Supply",
    "role": "DEPARTMENT_OFFICER",
    "assignedComplaints": 12,
    "resolvedComplaints": 45
  }
]
```

---

#### Get Citizen Profile
```http
GET /api/citizen/profile
Authorization: Bearer {token}
```
**Response:**
```json
{
  "userId": 42,
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "9876543210",
  "ward": "Shivaji Nagar",
  "address": "123 Main Street",
  "totalComplaints": 15,
  "joinedDate": "2025-12-01"
}
```

---

### 📝 COMPLAINT APIs (Common)

#### Get Complaint Details
```http
GET /api/complaints/{complaintId}
Authorization: Bearer {token}
```
**Response:**
```json
{
  "complaintId": 123,
  "title": "Street light not working",
  "description": "Dark area at night",
  "status": "IN_PROGRESS",
  "priority": "MEDIUM",
  "category": "Electricity",
  "location": "Main Road",
  "latitude": 18.5204,
  "longitude": 73.8567,
  "ward": "Shivaji Nagar",
  "department": "Electricity",
  "citizen": {
    "name": "John Doe",
    "mobile": "9876543210"
  },
  "assignedOfficer": {
    "name": "Officer Name",
    "mobile": "9999999999"
  },
  "sla": {
    "status": "ACTIVE",
    "deadline": "2026-02-01T10:30:00",
    "remainingHours": 18,
    "breached": false
  },
  "images": [
    {
      "imageId": 1,
      "url": "/uploads/complaints/123/image1.jpg",
      "type": "BEFORE_WORK",
      "uploadedAt": "2026-01-30T10:30:00"
    }
  ],
  "statusHistory": [
    {
      "status": "SUBMITTED",
      "timestamp": "2026-01-30T10:30:00",
      "updatedBy": "John Doe"
    },
    {
      "status": "ASSIGNED",
      "timestamp": "2026-01-30T11:00:00",
      "updatedBy": "Ward Officer"
    }
  ],
  "createdAt": "2026-01-30T10:30:00",
  "updatedAt": "2026-01-30T15:45:00"
}
```

---

#### Upload Image to Complaint
```http
POST /api/complaints/{complaintId}/images
Authorization: Bearer {token}
Content-Type: multipart/form-data
```
**Form Data:**
```
file: image.jpg
type: BEFORE_WORK | IN_PROGRESS | AFTER_RESOLUTION
latitude: 18.5204 (optional)
longitude: 73.8567 (optional)
```

**Response:**
```json
{
  "imageId": 5,
  "url": "/uploads/complaints/123/image5.jpg",
  "message": "Image uploaded successfully"
}
```

---

#### Get Complaint Images
```http
GET /api/complaints/{complaintId}/images
Authorization: Bearer {token}
```

---

#### Reopen Complaint
```http
PUT /api/citizen/complaints/{complaintId}/reopen
Authorization: Bearer {token}
Content-Type: application/json
```
**Request Body:**
```json
{
  "reason": "Issue not fully resolved"
}
```

---

#### Submit Feedback
```http
POST /api/citizen/complaints/{complaintId}/feedback
Authorization: Bearer {token}
Content-Type: application/json
```
**Request Body:**
```json
{
  "rating": 4,
  "comment": "Good work, resolved quickly"
}
```

---

### 🏢 WARD OFFICER APIs

#### Get Ward Officer Dashboard
```http
GET /api/ward-officer/dashboard
Authorization: Bearer {token}
```
**Response:**
```json
{
  "totalComplaints": 150,
  "pendingApproval": 12,
  "assignedComplaints": 80,
  "resolvedComplaints": 45,
  "slaBreached": 5,
  "departmentWiseBreakdown": {
    "Water Supply": 30,
    "Roads": 25,
    "Electricity": 20
  }
}
```

---

#### Get Ward Complaints
```http
GET /api/ward-officer/complaints?page=0&size=10&status=SUBMITTED&slaStatus=WARNING
Authorization: Bearer {token}
```

---

#### Approve Complaint
```http
PUT /api/ward-officer/complaints/{complaintId}/approve
Authorization: Bearer {token}
Content-Type: application/json
```
**Request Body:**
```json
{
  "assignedOfficerId": 15,
  "priority": "HIGH",
  "notes": "Urgent - assign immediately"
}
```

---

#### Reject Complaint
```http
PUT /api/ward-officer/complaints/{complaintId}/reject
Authorization: Bearer {token}
Content-Type: application/json
```
**Request Body:**
```json
{
  "reason": "Duplicate complaint",
  "notes": "Already registered as complaint #120"
}
```

---

#### Assign Complaint to Department Officer
```http
PUT /api/ward-officer/complaints/{complaintId}/assign
Authorization: Bearer {token}
Content-Type: application/json
```
**Request Body:**
```json
{
  "officerId": 15,
  "priority": "HIGH"
}
```

---

#### Get Department Officers in Ward
```http
GET /api/ward-officer/officers?departmentId=1
Authorization: Bearer {token}
```

---

### 🔧 DEPARTMENT OFFICER APIs

#### Get Department Officer Dashboard
```http
GET /api/department-officer/dashboard
Authorization: Bearer {token}
```
**Response:**
```json
{
  "assignedComplaints": 25,
  "inProgressComplaints": 10,
  "resolvedComplaints": 100,
  "slaBreached": 2,
  "avgResolutionTime": 28.5,
  "todayAssigned": 5
}
```

---

#### Get Assigned Complaints
```http
GET /api/department-officer/complaints?page=0&size=10&status=ASSIGNED
Authorization: Bearer {token}
```

---

#### Mark Complaint as In Progress
```http
PUT /api/department-officer/complaints/{complaintId}/in-progress
Authorization: Bearer {token}
Content-Type: application/json
```
**Request Body:**
```json
{
  "notes": "Started work on site"
}
```

---

#### Resolve Complaint
```http
PUT /api/department-officer/complaints/{complaintId}/resolve
Authorization: Bearer {token}
Content-Type: application/json
```
**Request Body:**
```json
{
  "resolutionNotes": "Pothole filled with asphalt",
  "workDetails": "Used 2 bags of asphalt mix"
}
```

---

#### Update Complaint Status
```http
PUT /api/department-officer/complaints/{complaintId}/status
Authorization: Bearer {token}
Content-Type: application/json
```
**Request Body:**
```json
{
  "status": "IN_PROGRESS",
  "notes": "Work in progress"
}
```

---

### 👨‍💼 ADMIN APIs

#### Get Admin Dashboard
```http
GET /api/admin/dashboard
Authorization: Bearer {token}
```
**Response:**
```json
{
  "totalComplaints": 5000,
  "totalUsers": 1200,
  "totalOfficers": 150,
  "slaBreached": 50,
  "wardWiseBreakdown": {...},
  "departmentWiseBreakdown": {...},
  "monthlyTrends": [...]
}
```

---

#### Get All Complaints
```http
GET /api/admin/complaints?page=0&size=20&status=CLOSED&wardId=1
Authorization: Bearer {token}
```

---

#### Close Complaint
```http
PUT /api/admin/complaints/{complaintId}/close
Authorization: Bearer {token}
Content-Type: application/json
```
**Request Body:**
```json
{
  "closureNotes": "Verified and closed"
}
```

---

#### Get All Users
```http
GET /api/admin/users?page=0&size=20&role=CITIZEN
Authorization: Bearer {token}
```

---

#### Create User (Officer)
```http
POST /api/admin/users
Authorization: Bearer {token}
Content-Type: application/json
```
**Request Body:**
```json
{
  "name": "New Officer",
  "email": "officer@civic.com",
  "mobile": "9999999999",
  "password": "Password@123",
  "role": "WARD_OFFICER",
  "wardId": 1,
  "departmentId": null
}
```

---

#### Update User
```http
PUT /api/admin/users/{userId}
Authorization: Bearer {token}
Content-Type: application/json
```

---

#### Delete User
```http
DELETE /api/admin/users/{userId}
Authorization: Bearer {token}
```

---

#### Get System Statistics
```http
GET /api/admin/statistics
Authorization: Bearer {token}
```

---

#### Get Audit Logs
```http
GET /api/admin/logs?action=CREATE_COMPLAINT&entityType=COMPLAINT&userId=42
Authorization: Bearer {token}
```

---

### 🔔 NOTIFICATION APIs

#### Get All Notifications
```http
GET /api/notifications
Authorization: Bearer {token}
```
**Response:**
```json
[
  {
    "notificationId": 100,
    "type": "STATUS_UPDATE",
    "title": "Complaint Status Updated",
    "message": "Your complaint #123 is now IN_PROGRESS",
    "complaintId": 123,
    "isRead": false,
    "createdAt": "2026-01-30T15:30:00"
  }
]
```

---

#### Get Unread Notifications
```http
GET /api/notifications/unread
Authorization: Bearer {token}
```

---

#### Get Unread Count
```http
GET /api/notifications/unread/count
Authorization: Bearer {token}
```
**Response:**
```json
{
  "count": 5
}
```

---

#### Mark Notification as Read
```http
PUT /api/notifications/{notificationId}/read
Authorization: Bearer {token}
```

---

#### Mark All as Read
```http
PUT /api/notifications/read-all
Authorization: Bearer {token}
```

---

#### Delete Notification
```http
DELETE /api/notifications/{notificationId}
Authorization: Bearer {token}
```

---

### ⏱ SLA APIs

#### Get SLA Dashboard
```http
GET /api/sla/dashboard
Authorization: Bearer {token}
```
**Response:**
```json
{
  "ACTIVE": 45,
  "WARNING": 12,
  "BREACHED": 5,
  "COMPLETED": 200
}
```

---

### 🗺 MAP APIs

#### Get Map Complaints (Role-based)
```http
GET /api/map/complaints?status=IN_PROGRESS&wardId=1
Authorization: Bearer {token}
```
**Response:**
```json
[
  {
    "complaintId": 123,
    "latitude": 18.5204,
    "longitude": 73.8567,
    "status": "IN_PROGRESS",
    "slaStatus": "WARNING",
    "priority": "HIGH",
    "department": "Water Supply",
    "title": "Water leakage"
  }
]
```

---

#### Get City Map (Admin Only)
```http
GET /api/admin/map/city
Authorization: Bearer {token}
```

---

#### Get Ward Map (Admin Only)
```http
GET /api/admin/map/ward/{wardId}
Authorization: Bearer {token}
```

---

### 👤 PROFILE APIs

#### Get Current User Profile
```http
GET /api/profile/me
Authorization: Bearer {token}
```

---

#### Update Profile
```http
PUT /api/profile/update
Authorization: Bearer {token}
Content-Type: application/json
```
**Request Body:**
```json
{
  "name": "Updated Name",
  "address": "New Address",
  "mobile": "9999999999"
}
```

---

#### Change Password
```http
PUT /api/profile/password/change
Authorization: Bearer {token}
Content-Type: application/json
```
**Request Body:**
```json
{
  "currentPassword": "OldPassword@123",
  "newPassword": "NewPassword@123"
}
```

---

## 5️⃣ FRONTEND STRUCTURE

### 📁 Directory Structure
```
src/
├── api/
│   ├── axios.js                    # Axios instance with interceptors
│   ├── axiosConfig.js              # Axios configuration
│   └── apiService.js               # Complete API service layer
│
├── assets/                         # Images, icons, fonts
│
├── auth/
│   ├── ModernLogin.jsx             # Login page
│   ├── RegisterCitizen.jsx         # Citizen registration
│   └── ProtectedRoute.jsx          # Route protection HOC
│
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.jsx      # Auth guard
│   ├── charts/
│   │   └── AnalyticsCharts.jsx     # Reusable chart components
│   ├── citizen/
│   │   ├── CitizenSidebar.jsx
│   │   ├── CitizenTopBar.jsx
│   │   ├── ComplaintTimeline.jsx
│   │   ├── CreateComplaintModal.jsx
│   │   ├── ImageUploadComponent.jsx
│   │   ├── SLACountdown.jsx
│   │   └── StatusTimeline.jsx
│   ├── common/
│   │   ├── EnhancedTopBar.jsx
│   │   ├── PriorityBadge/
│   │   ├── SharedNotificationList.jsx
│   │   ├── StatCard/
│   │   └── StatusBadge/
│   ├── complaint/
│   │   └── ComplaintStatusBadge.jsx
│   ├── complaints/
│   │   └── ComplaintDetailView.jsx
│   ├── department/
│   │   └── DepartmentSidebar.jsx
│   ├── layout/
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── ModernHeader.jsx
│   │   ├── ModernLayout.jsx
│   │   ├── ModernSidebar.jsx
│   │   ├── PageLayout.jsx
│   │   ├── PageWrapper.jsx
│   │   ├── Sidebar.jsx
│   │   └── TopHeader.jsx
│   ├── map/
│   │   └── ComplaintMap.jsx        # Leaflet map component
│   ├── notifications/
│   │   ├── NotificationBell.jsx
│   │   └── NotificationDropdown.jsx
│   ├── profile/
│   │   ├── ChangeMobile.jsx
│   │   ├── ChangePassword.jsx
│   │   ├── MobileOTPModal.jsx
│   │   ├── PasswordChangeModal.jsx
│   │   └── WardChangeRequest.jsx
│   └── ui/
│       ├── ConfirmDialog.jsx
│       ├── EnhancedImageUpload.jsx
│       ├── GovButton.jsx
│       ├── ImageViewer.jsx
│       ├── LoadingSpinner.jsx
│       ├── Modal.jsx
│       ├── ThemeToggle.jsx
│       └── ToastProvider.jsx
│
├── constants/
│   └── index.js                    # All constants (not constants.js)
│
├── constants.js                    # Application constants
│
├── contexts/
│   ├── MasterDataContext.jsx       # Wards & Departments context
│   └── ThemeContext.jsx            # Dark/Light theme
│
├── hooks/
│   ├── useAuth.js                  # Authentication hook
│   ├── useComplaints.js            # Complaints data hook
│   ├── useMasterData.js            # Master data hook
│   ├── useNotifications.js         # Notifications hook
│   └── useTheme.js                 # Theme hook
│
├── layouts/
│   ├── AdminLayout.jsx             # Admin layout wrapper
│   ├── CitizenLayout.jsx           # Citizen layout wrapper
│   ├── DepartmentLayout.jsx        # Department officer layout
│   └── WardOfficerLayout.jsx       # Ward officer layout
│
├── pages/
│   ├── admin/
│   │   ├── AdminAnalytics.jsx
│   │   ├── AdminComplaintDetail.jsx
│   │   ├── AdminComplaints.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminMap.jsx
│   │   ├── AdminOfficerDirectory.jsx
│   │   ├── AdminProfile.jsx
│   │   ├── AdminReports.jsx
│   │   ├── AdminUserManagement.jsx
│   │   ├── AdminWardOfficerRegistration.jsx
│   │   └── ProfessionalAdminDashboard.jsx
│   ├── citizen/
│   │   ├── AreaComplaints.jsx
│   │   ├── CitizenDashboard.jsx
│   │   ├── CitizenProfile.jsx
│   │   ├── ComplaintDetail.jsx
│   │   ├── CreateComplaint.jsx
│   │   ├── FeedbackList.jsx
│   │   ├── MyComplaints.jsx
│   │   ├── Notifications.jsx
│   │   ├── OfficerDirectory.jsx
│   │   ├── Officers.jsx
│   │   ├── OfficersDirectory.jsx
│   │   ├── Profile.jsx
│   │   ├── RegisterComplaint.jsx
│   │   ├── SlaStatus.jsx
│   │   ├── SubmitFeedback.jsx
│   │   ├── WardChangeRequests.jsx
│   │   └── WardComplaints.jsx
│   ├── common/
│   │   └── NotificationsPage.jsx
│   ├── department/
│   │   ├── DepartmentAnalytics.jsx
│   │   ├── DepartmentAnalyticsEnhanced.jsx
│   │   ├── DepartmentComplaintDetail.jsx
│   │   ├── DepartmentDashboard.jsx
│   │   ├── DepartmentMap.jsx
│   │   ├── DepartmentNotifications.jsx
│   │   ├── DepartmentProfile.jsx
│   │   └── UpdateComplaintStatus.jsx
│   ├── ward/
│   │   ├── ApprovalQueue.jsx
│   │   ├── DepartmentOfficersManagement.jsx
│   │   ├── RegisterDepartmentOfficer.jsx
│   │   ├── WardAnalytics.jsx
│   │   ├── WardChangeManagement.jsx
│   │   ├── WardComplaintDetail.jsx
│   │   ├── WardComplaints.jsx
│   │   ├── WardMap.jsx
│   │   ├── WardNotifications.jsx
│   │   ├── WardOfficerDashboard.jsx
│   │   └── WardOfficerProfile.jsx
│   ├── ApiDiagnostic.jsx           # API testing page
│   ├── Home.jsx
│   ├── ProfessionalAdminDashboard.jsx
│   ├── ProfessionalCitizenDashboard.jsx
│   ├── ProfessionalDepartmentOfficerDashboard.jsx
│   └── ProfessionalWardOfficerDashboard.jsx
│
├── services/
│   ├── authService.js              # Auth-specific service
│   ├── citizenService.js           # Citizen-specific service
│   ├── departmentOfficerService.js # Dept officer service
│   ├── notificationService.js      # Notification service
│   ├── profileService.js           # Profile service
│   └── wardOfficerService.js       # Ward officer service
│
├── store/
│   └── store.js                    # Redux store configuration
│
├── styles/
│   ├── admin.css
│   ├── citizen.css
│   ├── department.css
│   ├── theme.css
│   ├── variables.css
│   └── ward.css
│
├── utils/
│   ├── dateFormatter.js            # Date formatting utilities
│   ├── errorHandler.js             # Error handling utilities
│   ├── imageUtils.js               # Image processing utilities
│   ├── slaCalculator.js            # SLA calculation utilities
│   ├── statusHelpers.js            # Status helper functions
│   └── validators.js               # Form validation utilities
│
├── App.jsx                         # Main app component
├── App.css                         # App-level styles
├── index.css                       # Global styles
└── main.jsx                        # Entry point
```

---

## 6️⃣ PAGE-TO-API MAPPING

### 🔵 Citizen Portal

| Page | Route | APIs Used |
|------|-------|-----------|
| **Login** | `/` | `POST /api/auth/login` |
| **Register** | `/register` | `POST /api/auth/register`<br>`GET /api/wards` |
| **Dashboard** | `/citizen/dashboard` | `GET /api/citizen/dashboard`<br>`GET /api/sla/dashboard`<br>`GET /api/notifications/unread/count` |
| **My Complaints** | `/citizen/complaints` | `GET /api/citizen/my-complaints` |
| **Create Complaint** | `/citizen/complaints/new` | `POST /api/citizen/complaints`<br>`GET /api/wards`<br>`GET /api/departments` |
| **Complaint Detail** | `/citizen/complaints/:id` | `GET /api/complaints/{id}`<br>`GET /api/complaints/{id}/images`<br>`PUT /api/citizen/complaints/{id}/reopen`<br>`POST /api/citizen/complaints/{id}/feedback` |
| **Area Complaints** | `/citizen/area-complaints` | `GET /api/citizen/area-complaints` |
| **Notifications** | `/citizen/notifications` | `GET /api/notifications`<br>`PUT /api/notifications/{id}/read`<br>`PUT /api/notifications/read-all`<br>`DELETE /api/notifications/{id}` |
| **SLA Status** | `/citizen/sla` | `GET /api/sla/dashboard` |
| **Officer Directory** | `/citizen/officers` | `GET /api/citizen/officers` |
| **Profile** | `/citizen/profile` | `GET /api/citizen/profile`<br>`PUT /api/profile/update`<br>`PUT /api/profile/password/change` |
| **Ward Change Requests** | `/citizen/ward-change-requests` | `GET /api/citizen/ward-change-requests`<br>`POST /api/citizen/ward-change-requests` |
| **Feedback** | `/citizen/feedback/:id` | `POST /api/citizen/complaints/{id}/feedback` |

---

### 🟢 Ward Officer Portal

| Page | Route | APIs Used |
|------|-------|-----------|
| **Dashboard** | `/ward-officer/dashboard` | `GET /api/ward-officer/dashboard`<br>`GET /api/sla/dashboard` |
| **Approval Queue** | `/ward-officer/approvals` | `GET /api/ward-officer/complaints?status=SUBMITTED` |
| **All Complaints** | `/ward-officer/complaints` | `GET /api/ward-officer/complaints` |
| **Complaint Detail** | `/ward-officer/complaints/:id` | `GET /api/complaints/{id}`<br>`PUT /api/ward-officer/complaints/{id}/approve`<br>`PUT /api/ward-officer/complaints/{id}/reject`<br>`PUT /api/ward-officer/complaints/{id}/assign` |
| **Officers Management** | `/ward-officer/officers` | `GET /api/ward-officer/officers` |
| **Register Officer** | `/ward-officer/register-officer` | `POST /api/ward-officer/register-officer` |
| **Analytics** | `/ward-officer/analytics` | `GET /api/ward-officer/dashboard`<br>`GET /api/sla/dashboard` |
| **Map** | `/ward-officer/map` | `GET /api/map/complaints` |
| **Notifications** | `/ward-officer/notifications` | `GET /api/notifications` |
| **Ward Changes** | `/ward-officer/ward-changes` | `GET /api/ward-officer/ward-change-requests`<br>`PUT /api/ward-officer/ward-change-requests/{id}/approve` |
| **Profile** | `/ward-officer/profile` | `GET /api/profile/me` |

---

### 🟡 Department Officer Portal

| Page | Route | APIs Used |
|------|-------|-----------|
| **Dashboard** | `/department/dashboard` | `GET /api/department-officer/dashboard`<br>`GET /api/sla/dashboard` |
| **My Complaints** | `/department/complaints` | `GET /api/department-officer/complaints` |
| **Complaint Detail** | `/department/complaints/:id` | `GET /api/complaints/{id}`<br>`PUT /api/department-officer/complaints/{id}/in-progress`<br>`PUT /api/department-officer/complaints/{id}/resolve`<br>`POST /api/complaints/{id}/images` |
| **Analytics** | `/department/analytics` | `GET /api/department-officer/dashboard` |
| **Map** | `/department/map` | `GET /api/map/complaints` |
| **Notifications** | `/department/notifications` | `GET /api/notifications` |
| **Profile** | `/department/profile` | `GET /api/profile/me` |

---

### 🔴 Admin Portal

| Page | Route | APIs Used |
|------|-------|-----------|
| **Dashboard** | `/admin/dashboard` | `GET /api/admin/dashboard`<br>`GET /api/admin/statistics` |
| **All Complaints** | `/admin/complaints` | `GET /api/admin/complaints` |
| **Complaint Detail** | `/admin/complaints/:id` | `GET /api/complaints/{id}`<br>`PUT /api/admin/complaints/{id}/close` |
| **User Management** | `/admin/users` | `GET /api/admin/users`<br>`POST /api/admin/users`<br>`PUT /api/admin/users/{id}`<br>`DELETE /api/admin/users/{id}` |
| **Officer Directory** | `/admin/officers` | `GET /api/admin/users?role=WARD_OFFICER,DEPARTMENT_OFFICER` |
| **Register Ward Officer** | `/admin/register-ward-officer` | `POST /api/admin/users` |
| **Analytics** | `/admin/analytics` | `GET /api/admin/statistics` |
| **Map** | `/admin/map` | `GET /api/admin/map/city`<br>`GET /api/admin/map/ward/{wardId}` |
| **Reports** | `/admin/reports` | `GET /api/admin/statistics`<br>`GET /api/admin/complaints` |
| **Profile** | `/admin/profile` | `GET /api/profile/me` |

---

## 7️⃣ DATA FLOW & STATE MANAGEMENT

### Authentication Flow
```
1. User enters credentials
   ↓
2. POST /api/auth/login
   ↓
3. Backend validates & returns JWT token
   ↓
4. Frontend stores token in localStorage
   ↓
5. Axios interceptor adds token to all requests
   ↓
6. Protected routes check token validity
```

### Complaint Creation Flow
```
1. Citizen fills form + uploads images
   ↓
2. FormData created with all fields
   ↓
3. POST /api/citizen/complaints (multipart/form-data)
   ↓
4. Backend saves complaint + images
   ↓
5. Notification sent to Ward Officer
   ↓
6. Redirect to complaint detail page
```

### Complaint Lifecycle Flow
```
SUBMITTED (Citizen creates)
   ↓
ASSIGNED (Ward Officer approves & assigns)
   ↓
IN_PROGRESS (Dept Officer starts work)
   ↓
RESOLVED (Dept Officer completes work)
   ↓
APPROVED (Ward Officer verifies)
   ↓
CLOSED (Admin closes after citizen feedback)
```

### State Management Strategy

#### 1. **Redux Toolkit** (Global State)
- User authentication state
- Master data (wards, departments)
- Current user profile

#### 2. **Context API** (Shared State)
- Theme (dark/light mode)
- Master data (wards, departments)
- Notification count

#### 3. **Local Component State** (useState)
- Form inputs
- Loading states
- Modal visibility
- Filters and pagination

#### 4. **Custom Hooks** (Reusable Logic)
- `useAuth()` - Authentication state and methods
- `useComplaints()` - Fetch and manage complaints
- `useNotifications()` - Notification management
- `useMasterData()` - Wards and departments
- `useTheme()` - Theme switching

---

## 8️⃣ FEATURES IMPLEMENTED ✅

### Core Features
✅ **Multi-role Authentication** (JWT-based)  
✅ **Role-based Access Control** (RBAC)  
✅ **Complaint Registration** with image upload  
✅ **Complaint Lifecycle Management**  
✅ **SLA Tracking** with breach alerts  
✅ **Real-time Notifications**  
✅ **Interactive Map View** (Leaflet.js)  
✅ **Image Upload** (before/during/after work)  
✅ **Feedback & Rating System**  
✅ **Officer Directory**  
✅ **Ward Change Request Workflow**  
✅ **Profile Management**  
✅ **Password Change**  
✅ **Analytics Dashboards** (all roles)  
✅ **Complaint Filtering & Pagination**  
✅ **Status Timeline**  
✅ **Dark/Light Theme Toggle**  
✅ **Responsive Design** (mobile-friendly)  
✅ **Error Handling** with user-friendly messages  
✅ **Loading States** and spinners  
✅ **Toast Notifications** for user feedback  

### Role-Specific Features

#### Citizen
✅ Register and login  
✅ Create complaints with GPS and images  
✅ View own complaints  
✅ View area complaints (same ward)  
✅ Track SLA status  
✅ Reopen closed complaints  
✅ Submit feedback  
✅ View officer directory  
✅ Request ward change  

#### Ward Officer
✅ View ward dashboard  
✅ Approve/reject complaints  
✅ Assign complaints to department officers  
✅ View all complaints in ward  
✅ Register department officers  
✅ Manage department officers  
✅ View ward analytics  
✅ Approve ward change requests  

#### Department Officer
✅ View assigned complaints  
✅ Update complaint status  
✅ Upload progress images  
✅ Resolve complaints  
✅ View department analytics  

#### Admin
✅ View system-wide dashboard  
✅ Manage all users  
✅ View all complaints  
✅ Close complaints  
✅ Register ward officers  
✅ View city-wide map  
✅ Access audit logs  
✅ Generate reports  

---

## 9️⃣ FEATURES NOT YET IMPLEMENTED ❌

### Backend Features to Add
❌ **Excel Export** (Admin reports)  
❌ **PDF Generation** (Complaint reports)  
❌ **Email Notifications** (Currently only in-app)  
❌ **SMS Notifications** (OTP, status updates)  
❌ **WebSocket** for real-time updates  
❌ **Complaint Similarity Detection** (AI/ML)  
❌ **Heatmap Clustering** (Map view)  
❌ **Scheduled SLA Breach Cron Job**  
❌ **Complaint Escalation Auto-trigger**  
❌ **Bulk Complaint Upload** (CSV import)  
❌ **Advanced Search** (full-text search)  
❌ **Complaint Categories Management** (CRUD)  
❌ **Ward/Department Management** (CRUD)  
❌ **Audit Log Filtering** (Advanced filters)  
❌ **Two-Factor Authentication** (2FA)  
❌ **Password Reset via Email**  
❌ **Social Login** (Google, Facebook)  

### Frontend Features to Add
❌ **Progressive Web App** (PWA) support  
❌ **Offline Mode** (Service Workers)  
❌ **Push Notifications** (Browser notifications)  
❌ **Voice Input** for complaint description  
❌ **Multi-language Support** (i18n)  
❌ **Accessibility** improvements (ARIA labels)  
❌ **Print-friendly Views**  
❌ **Advanced Filters** (date range, custom filters)  
❌ **Complaint Comparison** (side-by-side view)  
❌ **Complaint Templates** (Quick complaint creation)  
❌ **Saved Filters** (User preferences)  
❌ **Export to PDF/Excel** (Client-side)  
❌ **Drag-and-Drop** image upload  
❌ **Image Editing** (crop, rotate)  
❌ **Video Upload** support  
❌ **Chat/Comments** on complaints  
❌ **Complaint Sharing** (social media)  

### Nice-to-Have Features
❌ **Mobile App** (React Native)  
❌ **Chatbot** for common queries  
❌ **Predictive Analytics** (complaint trends)  
❌ **Gamification** (citizen badges, leaderboards)  
❌ **Public Dashboard** (anonymous complaint view)  
❌ **Complaint Voting** (upvote similar issues)  
❌ **Geofencing** (auto-detect ward from GPS)  
❌ **QR Code** for complaint tracking  
❌ **Integration with Google Maps**  
❌ **Integration with Municipal ERP**  

---

## 🔟 POSTMAN COLLECTION

### Setup
1. Import `CivicConnect_Postman_Collection.json` into Postman
2. Set environment variables:
   - `baseUrl`: `http://localhost:8083/api`
   - `token`: (Will be set automatically after login)

### Collection Structure
```
CivicConnect API Collection
├── Auth
│   ├── Login
│   └── Register Citizen
├── Master Data
│   ├── Get Wards
│   └── Get Departments
├── Citizen
│   ├── Get Profile
│   ├── Update Profile
│   ├── Get Officers (My Ward)
│   ├── Get My Complaints
│   └── Create Complaint
├── Complaints Generic
│   └── Get Complaint Detail
└── Notifications
    ├── Get Notifications
    └── Get Unread Count
```

### Usage Example
1. **Login First:**
   ```
   POST {{baseUrl}}/auth/login
   Body: { "email": "citizen@test.com", "password": "Test@123" }
   ```
   Copy the `token` from response

2. **Set Token:**
   - Manually: Set `{{token}}` variable
   - Auto: Use Postman test script (already included)

3. **Make Authenticated Requests:**
   All other requests automatically use `Bearer {{token}}`

---

## 1️⃣1️⃣ QUICK START GUIDE

### Prerequisites
- **Backend:** Java 17+, MySQL 8+, Maven
- **Frontend:** Node.js 18+, npm/yarn

### Backend Setup
```bash
# 1. Clone backend repository
git clone <backend-repo-url>
cd civic-connect-backend

# 2. Configure database
# Edit src/main/resources/application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/civic_connect
spring.datasource.username=root
spring.datasource.password=your_password

# 3. Run backend
mvn spring-boot:run

# Backend will start on http://localhost:8083
```

### Frontend Setup
```bash
# 1. Navigate to frontend directory
cd civic-connect-frontend

# 2. Install dependencies
npm install

# 3. Configure API base URL
# Edit .env or .env.development
VITE_API_BASE_URL=http://localhost:8083/api

# 4. Start development server
npm run dev

# Frontend will start on http://localhost:5173
```

### Default Test Users
```
Citizen:
  Email: citizen@test.com
  Password: Test@123

Ward Officer:
  Email: ward@test.com
  Password: Test@123

Department Officer:
  Email: dept@test.com
  Password: Test@123

Admin:
  Email: admin@test.com
  Password: Test@123
```

### First-Time Setup
1. **Login as Admin**
2. **Create Master Data:**
   - Add Wards (if not auto-loaded)
   - Add Departments (if not auto-loaded)
3. **Register Ward Officers**
4. **Ward Officers register Department Officers**
5. **Citizens can now register and create complaints**

---

## 📊 ADDITIONAL RESOURCES

### API Testing
- **Postman Collection:** `CivicConnect_Postman_Collection.json`
- **Swagger UI:** `http://localhost:8083/swagger-ui.html` (if enabled)
- **API Diagnostic Page:** `http://localhost:5173/diagnostic`

### Code Quality
- **ESLint:** Configured for React best practices
- **Prettier:** Code formatting (if configured)
- **Error Boundary:** Catches React errors gracefully

### Performance
- **Lazy Loading:** Routes are code-split
- **Image Optimization:** Images compressed before upload
- **Pagination:** All list views paginated
- **Caching:** Master data cached in context

### Security
- **JWT Authentication:** Token-based auth
- **CORS:** Configured for frontend origin
- **Input Validation:** Both frontend and backend
- **SQL Injection Prevention:** Parameterized queries
- **XSS Prevention:** React auto-escapes

---

## 🎯 NEXT STEPS

### For Frontend Developers
1. ✅ **Read this documentation thoroughly**
2. ✅ **Import Postman collection and test APIs**
3. ✅ **Explore existing components in `src/components/`**
4. ✅ **Check `apiService.js` for all available API methods**
5. ✅ **Review `constants.js` for status codes and enums**
6. ⏭ **Start building missing features from section 9**
7. ⏭ **Improve UI/UX based on user feedback**
8. ⏭ **Add unit tests for critical components**

### For Backend Developers
1. ✅ **Ensure all APIs documented here are implemented**
2. ✅ **Add Swagger documentation**
3. ⏭ **Implement missing features from section 9**
4. ⏭ **Add integration tests**
5. ⏭ **Optimize database queries**
6. ⏭ **Add caching layer (Redis)**

### For Project Managers
1. ✅ **Use this as the single source of truth**
2. ✅ **Share with all team members**
3. ⏭ **Prioritize features from section 9**
4. ⏭ **Plan sprints based on this documentation**
5. ⏭ **Track progress against implemented features**

---

## 📝 CHANGELOG

### Version 1.0 (January 31, 2026)
- ✅ Initial comprehensive documentation
- ✅ All implemented APIs documented
- ✅ Frontend structure mapped
- ✅ Page-to-API mapping completed
- ✅ Missing features identified

---

## 🤝 CONTRIBUTING

When adding new features:
1. **Update this documentation first**
2. **Add API endpoint details**
3. **Update Postman collection**
4. **Add to frontend page mapping**
5. **Update changelog**

---

## 📧 SUPPORT

For questions or issues:
- **Backend Issues:** Check backend logs
- **Frontend Issues:** Check browser console
- **API Issues:** Use Postman to test
- **Documentation Issues:** Refer to this file

---

**🎉 You now have EVERYTHING needed to build the complete CivicConnect frontend!**

**No more guessing. No more "what API should I call?" Just refer to this document and build! 🚀**
