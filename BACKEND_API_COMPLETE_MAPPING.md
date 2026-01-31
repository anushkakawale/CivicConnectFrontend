# 🔍 CIVICCONNECT BACKEND API COMPLETE MAPPING

> **Last Updated:** January 31, 2026  
> **Purpose:** Complete mapping of all backend controllers to API endpoints  
> **Base URL:** `http://localhost:8083/api`

---

## 📋 TABLE OF CONTENTS

1. [Authentication & Authorization](#1-authentication--authorization)
2. [Citizen APIs](#2-citizen-apis)
3. [Ward Officer APIs](#3-ward-officer-apis)
4. [Department Officer APIs](#4-department-officer-apis)
5. [Admin APIs](#5-admin-apis)
6. [Common/Shared APIs](#6-commonshared-apis)
7. [Analytics APIs](#7-analytics-apis)
8. [Map APIs](#8-map-apis)
9. [Notification APIs](#9-notification-apis)
10. [Profile Management APIs](#10-profile-management-apis)
11. [Master Data APIs](#11-master-data-apis)
12. [Missing/Incomplete APIs](#12-missingincomplete-apis)

---

## 1️⃣ AUTHENTICATION & AUTHORIZATION

### Controller: `AuthController`
**Base Path:** `/api/auth`

#### 1.1 Login
```http
POST /api/auth/login
Content-Type: application/json
```
**Request:**
```json
{
  "email": "user@example.com",
  "password": "Password@123"
}
```
**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "CITIZEN",
  "userId": 42,
  "name": "John Doe"
}
```

---

## 2️⃣ CITIZEN APIs

### 2.1 Citizen Registration
**Controller:** `CitizenRegistrationController`  
**Base Path:** `/api/citizens`

#### Register New Citizen
```http
POST /api/citizens/register
Content-Type: application/json
```
**Request:**
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

### 2.2 Citizen Complaints
**Controller:** `CitizenComplaintController`  
**Base Path:** `/api/citizen/complaints`

#### Create Complaint
```http
POST /api/citizen/complaints
Authorization: Bearer {token}
Content-Type: multipart/form-data
```
**Form Data:**
- `title`: String
- `description`: String
- `category`: String
- `priority`: HIGH | MEDIUM | LOW | CRITICAL
- `location`: String
- `latitude`: Double
- `longitude`: Double
- `wardId`: Long
- `departmentId`: Long
- `images`: File[] (optional)

**Response:**
```json
{
  "complaintId": 124,
  "message": "Complaint registered successfully",
  "status": "SUBMITTED"
}
```

#### Get My Complaints (Paginated)
```http
GET /api/citizen/complaints?page=0&size=10&status=IN_PROGRESS&priority=HIGH
Authorization: Bearer {token}
```
**Query Parameters:**
- `page`: Integer (default: 0)
- `size`: Integer (default: 10)
- `status`: ComplaintStatus (optional)
- `priority`: Priority (optional)
- `slaStatus`: SLAStatus (optional)

**Response:**
```json
{
  "content": [
    {
      "complaintId": 123,
      "title": "Street light not working",
      "status": "IN_PROGRESS",
      "priority": "MEDIUM",
      "slaStatus": "ACTIVE",
      "createdAt": "2026-01-30T10:30:00",
      "department": "Electricity",
      "ward": "Shivaji Nagar",
      "assignedOfficer": "Officer Name"
    }
  ],
  "totalElements": 15,
  "totalPages": 2,
  "currentPage": 0
}
```

---

### 2.3 Citizen Area Complaints
**Controller:** `CitizenAreaComplaintsController`  
**Base Path:** `/api/citizen/area-complaints`

#### Get Area Complaints
```http
GET /api/citizen/area-complaints?page=0&size=10
Authorization: Bearer {token}
```
**Description:** Returns complaints from the same ward as the citizen

---

### 2.4 Citizen Dashboard
**Controller:** `CitizenDashboardController`  
**Base Path:** `/api/citizen/dashboard`

#### Get Dashboard Stats
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
  "slaBreached": 1,
  "avgResolutionTime": 36.5,
  "recentComplaints": [...]
}
```

---

### 2.5 Citizen Profile
**Controller:** `CitizenProfileController`  
**Base Path:** `/api/profile/citizen`

#### Get Profile
```http
GET /api/profile/citizen
Authorization: Bearer {token}
Role: CITIZEN
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

#### Update Ward
```http
PUT /api/profile/citizen/ward
Authorization: Bearer {token}
Content-Type: application/json
```
**Request:**
```json
{
  "wardId": 2
}
```
**Response:**
```json
{
  "message": "Ward change request submitted"
}
```

#### Update Address
```http
PUT /api/profile/citizen/address
Authorization: Bearer {token}
Content-Type: application/json
```
**Request:**
```json
{
  "address": "New Address, Pune"
}
```

---

### 2.6 Citizen Officer Directory
**Controller:** `CitizenOfficerController` & `CitizenOfficerDirectoryController`  
**Base Path:** `/api/citizen/officers`

#### Get Ward Officer
```http
GET /api/citizen/officers/ward-officer
Authorization: Bearer {token}
```
**Response:**
```json
{
  "officerId": 10,
  "name": "Ward Officer Name",
  "email": "officer@civic.com",
  "mobile": "9876543210",
  "department": "Ward Office",
  "role": "WARD_OFFICER"
}
```

#### Get Department Officers
```http
GET /api/citizen/officers/department-officers
Authorization: Bearer {token}
```

#### Get All Officers in Ward
```http
GET /api/citizens/officers
Authorization: Bearer {token}
```

#### Get Officer Details
```http
GET /api/citizens/officers/{officerUserId}
Authorization: Bearer {token}
```

---

### 2.7 Citizen Map
**Controller:** `CitizenMapController`  
**Base Path:** `/api/citizens/map`

#### Get Ward Map Data
```http
GET /api/citizens/map/ward
Authorization: Bearer {token}
```
**Response:**
```json
{
  "wardId": 1,
  "wardName": "Shivaji Nagar",
  "complaints": [
    {
      "complaintId": 123,
      "title": "Street light issue",
      "latitude": 18.5204,
      "longitude": 73.8567,
      "status": "IN_PROGRESS",
      "priority": "MEDIUM"
    }
  ]
}
```

---

## 3️⃣ WARD OFFICER APIs

### 3.1 Ward Officer Dashboard
**Controller:** `WardOfficerDashboardController`  
**Base Path:** `/api/ward-officer/dashboard`

#### Get Dashboard Stats
```http
GET /api/ward-officer/dashboard
Authorization: Bearer {token}
Role: WARD_OFFICER
```

#### Get Pending Approvals
```http
GET /api/ward-officer/dashboard/pending-approvals
Authorization: Bearer {token}
```
**Response:**
```json
[
  {
    "complaintId": 123,
    "title": "Pothole on Main Road",
    "status": "SUBMITTED",
    "priority": "HIGH",
    "submittedAt": "2026-01-30T10:30:00",
    "citizenName": "John Doe"
  }
]
```

---

### 3.2 Ward Officer Complaints
**Controller:** `WardOfficerComplaintController`  
**Base Path:** `/api/ward-officer/complaints`

#### Get Ward Complaints
```http
GET /api/ward-officer/complaints?page=0&size=10&status=SUBMITTED
Authorization: Bearer {token}
```

#### Approve Complaint
```http
PUT /api/ward-officer/complaints/{complaintId}/approve
Authorization: Bearer {token}
Content-Type: application/json
```
**Request:**
```json
{
  "assignedOfficerId": 15,
  "priority": "HIGH",
  "notes": "Urgent - assign immediately"
}
```

#### Reject Complaint
```http
PUT /api/ward-officer/complaints/{complaintId}/reject
Authorization: Bearer {token}
Content-Type: application/json
```
**Request:**
```json
{
  "reason": "Duplicate complaint",
  "notes": "Already registered as #120"
}
```

#### Assign Complaint
```http
PUT /api/ward-officer/complaints/{complaintId}/assign
Authorization: Bearer {token}
Content-Type: application/json
```
**Request:**
```json
{
  "officerId": 15,
  "priority": "HIGH"
}
```

---

### 3.3 Ward Officer - Officer Management
**Controller:** `WardOfficerController`  
**Base Path:** `/api/ward-officer`

#### Register Department Officer
```http
POST /api/ward-officer/register/department-officer
Authorization: Bearer {token}
Content-Type: application/json
```
**Request:**
```json
{
  "name": "New Officer",
  "email": "officer@civic.com",
  "mobile": "9999999999",
  "password": "Password@123",
  "departmentId": 1,
  "wardId": 1
}
```

#### Get Department Officers
```http
GET /api/ward-officer/department-officers
Authorization: Bearer {token}
```

#### Approve Ward Change
```http
PUT /api/ward-officer/ward-change/{requestId}/approve
Authorization: Bearer {token}
```

---

### 3.4 Ward Officer Map
**Controller:** `WardMapController`  
**Base Path:** `/api/ward/map`

#### Get Ward Map View
```http
GET /api/ward/map
Authorization: Bearer {token}
```

---

### 3.5 Ward Officer Analytics
**Controller:** `WardOfficerAnalyticsController`  
**Base Path:** `/api/ward-officer/analytics`

#### Get Dashboard Analytics
```http
GET /api/ward-officer/analytics/dashboard
Authorization: Bearer {token}
Role: WARD_OFFICER
```
**Response:**
```json
{
  "wardName": "Shivaji Nagar",
  "wardOfficer": "Officer Name",
  "overallStatistics": {
    "totalComplaints": 150,
    "pending": 30,
    "resolved": 80,
    "approved": 20,
    "closed": 20,
    "pendingApprovals": 12,
    "slaBreached": 5
  },
  "departmentPerformance": [
    {
      "department": "Water Supply",
      "total": 50,
      "pending": 10,
      "resolved": 35,
      "completionRate": "70.0%"
    }
  ],
  "officerPerformance": [...],
  "recentActivity": {
    "last7Days": 25,
    "closedLast7Days": 15
  }
}
```

#### Get Department Distribution
```http
GET /api/ward-officer/analytics/department-distribution
Authorization: Bearer {token}
```

#### Get Monthly Trends
```http
GET /api/ward-officer/analytics/monthly-trends
Authorization: Bearer {token}
```

---

## 4️⃣ DEPARTMENT OFFICER APIs

### 4.1 Department Officer Dashboard
**Controller:** `DepartmentDashboardController`  
**Base Path:** `/api/department/dashboard`

#### Get Dashboard Summary
```http
GET /api/department/dashboard/summary
Authorization: Bearer {token}
Role: DEPARTMENT_OFFICER
```
**Response:**
```json
{
  "totalAssigned": 25,
  "pending": 5,
  "inProgress": 10,
  "resolved": 100,
  "slaBreached": 2,
  "avgResolutionTime": 28.5
}
```

#### Get Assigned Complaints
```http
GET /api/department/dashboard/assigned?page=0&size=10
Authorization: Bearer {token}
```

---

### 4.2 Department Officer Complaints
**Controller:** `DepartmentComplaintController`  
**Base Path:** `/api/department/complaints`

#### Get My Complaints
```http
GET /api/department/complaints?page=0&size=10&status=ASSIGNED
Authorization: Bearer {token}
```

#### Mark as In Progress
```http
PUT /api/department/complaints/{complaintId}/in-progress
Authorization: Bearer {token}
Content-Type: application/json
```
**Request:**
```json
{
  "notes": "Started work on site"
}
```

#### Resolve Complaint
```http
PUT /api/department/complaints/{complaintId}/resolve
Authorization: Bearer {token}
Content-Type: application/json
```
**Request:**
```json
{
  "resolutionNotes": "Pothole filled with asphalt",
  "workDetails": "Used 2 bags of asphalt mix"
}
```

---

### 4.3 Department Officer Map
**Controller:** `DepartmentMapController`  
**Base Path:** `/api/department/map`

#### Get Department Map View
```http
GET /api/department/map
Authorization: Bearer {token}
```
**Description:** Returns complaints for the officer's ward and department

---

### 4.4 Department Officer - Officers
**Controller:** `DepartmentOfficerController`  
**Base Path:** `/api/department/officers`

#### Get Ward Officer
```http
GET /api/department/officers/ward-officer
Authorization: Bearer {token}
```

---

### 4.5 Department Officer Analytics
**Controller:** `DepartmentAnalyticsController`  
**Base Path:** `/api/department/analytics`

#### Get Dashboard Analytics
```http
GET /api/department/analytics/dashboard
Authorization: Bearer {token}
Role: DEPARTMENT_OFFICER
```
**Response:**
```json
{
  "officerName": "Officer Name",
  "department": "Water Supply",
  "ward": "Shivaji Nagar",
  "statistics": {
    "totalAssigned": 25,
    "pending": 5,
    "inProgress": 10,
    "resolved": 8,
    "approved": 1,
    "closed": 1,
    "completionRate": "8.0%",
    "avgResolutionTimeHours": "28.5"
  },
  "sla": {
    "breached": 2,
    "warning": 3,
    "onTrack": 20
  },
  "recentActivity": {
    "last7Days": 5,
    "resolvedLast7Days": 2
  }
}
```

#### Get Pending Work
```http
GET /api/department/analytics/pending-work
Authorization: Bearer {token}
```

#### Get Trends
```http
GET /api/department/analytics/trends
Authorization: Bearer {token}
```

---

## 5️⃣ ADMIN APIs

### 5.1 Admin Dashboard
**Controller:** `AdminDashboardController`  
**Base Path:** `/api/admin/dashboard`

#### Get Ready to Close Complaints
```http
GET /api/admin/dashboard/ready-to-close
Authorization: Bearer {token}
Role: ADMIN
```
**Response:**
```json
[
  {
    "complaintId": 123,
    "title": "Street light issue",
    "status": "APPROVED",
    "approvedAt": "2026-01-30T15:00:00",
    "ward": "Shivaji Nagar",
    "department": "Electricity"
  }
]
```

---

### 5.2 Admin Complaints
**Controller:** `AdminComplaintController`  
**Base Path:** `/api/admin/complaints`

#### Get All Complaints
```http
GET /api/admin/complaints?page=0&size=20
Authorization: Bearer {token}
```

#### Close Complaint
```http
PUT /api/admin/complaints/{complaintId}/close
Authorization: Bearer {token}
Content-Type: application/json
```
**Request:**
```json
{
  "closureNotes": "Verified and closed"
}
```

#### Get Escalated Complaints
```http
GET /api/admin/complaints/escalated
Authorization: Bearer {token}
Role: ADMIN
```

---

### 5.3 Admin Officer Management
**Controller:** `AdminOfficerController`  
**Base Path:** `/api/admin`

#### Register Ward Officer
```http
POST /api/admin/register/ward-officer
Authorization: Bearer {token}
Content-Type: application/json
```
**Request:**
```json
{
  "name": "New Ward Officer",
  "email": "wardofficer@civic.com",
  "mobile": "9999999999",
  "password": "Password@123",
  "wardId": 1
}
```

#### Get All Officers
```http
GET /api/admin/officers
Authorization: Bearer {token}
```

---

### 5.4 Admin Map
**Controller:** `AdminMapController`  
**Base Path:** `/api/admin/map`

#### Get City Map
```http
GET /api/admin/map/city
Authorization: Bearer {token}
Role: ADMIN
```

#### Get Ward Map
```http
GET /api/admin/map/ward/{wardId}
Authorization: Bearer {token}
```

---

### 5.5 Admin Charts
**Controller:** `AdminChartController`  
**Base Path:** `/api/admin/charts`

#### Get Complaints by Ward
```http
GET /api/admin/charts/complaints-by-ward
Authorization: Bearer {token}
```
**Response:**
```json
[
  {
    "label": "Shivaji Nagar",
    "value": 150
  },
  {
    "label": "Kothrud",
    "value": 120
  }
]
```

#### Get Complaints by Department
```http
GET /api/admin/charts/complaints-by-department
Authorization: Bearer {token}
```

#### Get SLA Stats
```http
GET /api/admin/charts/sla-stats
Authorization: Bearer {token}
```

---

### 5.6 Admin Analytics
**Controller:** `AdminAnalyticsController`  
**Base Path:** `/api/admin/analytics`

#### Get City-Wide Dashboard
```http
GET /api/admin/analytics/dashboard
Authorization: Bearer {token}
Role: ADMIN
```
**Response:**
```json
{
  "overallStatistics": {
    "totalComplaints": 5000,
    "assigned": 500,
    "inProgress": 800,
    "resolved": 1200,
    "approved": 800,
    "closed": 1700,
    "completionRate": "50.0%",
    "pendingApprovals": 1200,
    "readyToClose": 800
  },
  "slaStatistics": {
    "breached": 150,
    "warning": 200,
    "onTrack": 3500,
    "total": 3850
  },
  "wardPerformance": [
    {
      "wardName": "Shivaji Nagar",
      "total": 150,
      "pending": 30,
      "closed": 100,
      "completionRate": "66.7%"
    }
  ],
  "departmentPerformance": [...],
  "recentActivity": {
    "last7Days": 250,
    "closedLast7Days": 180
  },
  "resources": {
    "totalWards": 15,
    "totalDepartments": 8,
    "wardOfficers": 15,
    "departmentOfficers": 120
  }
}
```

#### Get Monthly Trends
```http
GET /api/admin/analytics/monthly-trends
Authorization: Bearer {token}
```

#### Get Priority Distribution
```http
GET /api/admin/analytics/priority-distribution
Authorization: Bearer {token}
```

#### Get Top Performers
```http
GET /api/admin/analytics/top-performers
Authorization: Bearer {token}
```

---

### 5.7 Admin SLA
**Controller:** `AdminSlaController`  
**Base Path:** `/api/admin/sla`

#### Check SLA for Complaint
```http
GET /api/admin/sla/{complaintId}
Authorization: Bearer {token}
```
**Response:**
```json
{
  "complaintId": 123,
  "status": "ACTIVE",
  "slaStart": "2026-01-30T10:30:00",
  "slaDeadline": "2026-02-01T10:30:00",
  "escalated": false
}
```

#### Get Remaining Time
```http
GET /api/admin/sla/{complaintId}/remaining
Authorization: Bearer {token}
```
**Response:**
```json
{
  "complaintId": 123,
  "remainingMinutes": 1080
}
```

---

### 5.8 Admin SLA Analytics
**Controller:** `SlaAnalyticsController`  
**Base Path:** `/api/admin/analytics/sla`

#### Get Overall SLA Report
```http
GET /api/admin/analytics/sla/overall
Authorization: Bearer {token}
```

#### Get Department SLA Report
```http
GET /api/admin/analytics/sla/department/{departmentId}
Authorization: Bearer {token}
```

---

### 5.9 Admin Audit
**Controller:** `AdminAuditController`  
**Base Path:** `/api/admin/audit`

#### Get Audit Logs
```http
GET /api/admin/audit/logs?action=CREATE&entityType=COMPLAINT&userId=42&page=0&size=20
Authorization: Bearer {token}
Role: ADMIN
```
**Query Parameters:**
- `action`: String (optional) - e.g., CREATE, UPDATE, DELETE
- `entityType`: String (optional) - e.g., COMPLAINT, USER
- `userId`: Long (optional)
- `page`, `size`: Pagination

#### Get Audit Summary
```http
GET /api/admin/audit/summary
Authorization: Bearer {token}
```

---

### 5.10 Admin Export
**Controller:** `AdminExportController`  
**Base Path:** `/api/admin/export`

#### Export Complaints to Excel
```http
GET /api/admin/export/complaints/excel?wardId=1&departmentId=2&status=CLOSED
Authorization: Bearer {token}
```
**Query Parameters:**
- `wardId`: Long (optional)
- `departmentId`: Long (optional)
- `status`: ComplaintStatus (optional)

**Response:** Excel file download

---

## 6️⃣ COMMON/SHARED APIs

### 6.1 Complaint Details
**Controller:** `ComplaintDetailsController`  
**Base Path:** `/api/complaints`

#### Get Complaint Details
```http
GET /api/complaints/{complaintId}/details
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
  "wardName": "Shivaji Nagar",
  "departmentName": "Electricity",
  "citizenName": "John Doe",
  "citizenEmail": "john@example.com",
  "assignedOfficer": "Officer Name",
  "createdAt": "2026-01-30T10:30:00",
  "updatedAt": "2026-01-30T15:45:00",
  "latitude": 18.5204,
  "longitude": 73.8567,
  "images": [
    {
      "id": 1,
      "imageUrl": "/api/images/123/image1.jpg",
      "imageStage": "BEFORE_WORK",
      "uploadedBy": "John Doe",
      "uploadedByRole": "CITIZEN",
      "uploadedAt": "2026-01-30T10:30:00",
      "latitude": 18.5204,
      "longitude": 73.8567
    }
  ],
  "timeline": [
    {
      "status": "SUBMITTED",
      "changedAt": "2026-01-30T10:30:00",
      "changedBy": "John Doe",
      "remarks": ""
    },
    {
      "status": "ASSIGNED",
      "changedAt": "2026-01-30T11:00:00",
      "changedBy": "Ward Officer",
      "remarks": "Assigned to department officer"
    }
  ],
  "feedback": {
    "rating": 4,
    "comment": "Good work",
    "submittedAt": "2026-02-01T10:00:00"
  },
  "canReopen": true,
  "slaDeadline": "2026-02-01T10:30:00",
  "slaStatus": "ACTIVE"
}
```

#### Reopen Complaint
```http
PUT /api/complaints/{complaintId}/reopen
Authorization: Bearer {token}
Content-Type: application/json
```
**Request:**
```json
{
  "reason": "Issue not fully resolved"
}
```

#### Submit Feedback
```http
POST /api/complaints/{complaintId}/feedback
Authorization: Bearer {token}
Content-Type: application/json
```
**Request:**
```json
{
  "rating": 4,
  "comment": "Good work, resolved quickly"
}
```

---

### 6.2 Complaint Images
**Controller:** `ComplaintImageController`  
**Base Path:** `/api/complaints`

#### Upload Image
```http
POST /api/complaints/{complaintId}/images
Authorization: Bearer {token}
Content-Type: multipart/form-data
```
**Form Data:**
- `file`: File
- `stage`: BEFORE_WORK | IN_PROGRESS | AFTER_RESOLUTION (default: AFTER_RESOLUTION)

**Response:**
```json
{
  "message": "Image uploaded",
  "imageUrl": "/api/images/123/image_xyz.jpg"
}
```

#### List Images
```http
GET /api/complaints/{complaintId}/images
Authorization: Bearer {token}
```
**Response:**
```json
[
  {
    "imageId": 1,
    "stage": "BEFORE_WORK",
    "uploadedBy": "John Doe",
    "uploadedAt": "2026-01-30T10:30:00",
    "url": "/api/images/123/image1.jpg"
  }
]
```

---

### 6.3 Image Serving
**Controller:** `ImageServeController`  
**Base Path:** `/api/images`

#### Get Image
```http
GET /api/images/{complaintId}/{fileName}
Authorization: Bearer {token}
```
**Response:** Image file (JPEG, PNG, GIF, WEBP, BMP)

---

### 6.4 Complaint Map
**Controller:** `ComplaintMapController`  
**Base Path:** `/api/complaints/map`

#### Get Map Data
```http
GET /api/complaints/map?status=IN_PROGRESS
Authorization: Bearer {token}
```
**Query Parameters:**
- `status`: ComplaintStatus (optional)

**Response:**
```json
[
  {
    "complaintId": 123,
    "title": "Street light issue",
    "latitude": 18.5204,
    "longitude": 73.8567,
    "status": "IN_PROGRESS",
    "priority": "MEDIUM",
    "ward": "Shivaji Nagar",
    "department": "Electricity"
  }
]
```

---

### 6.5 Map View
**Controller:** `MapViewController`  
**Base Path:** `/api/map`

#### Get Active Complaints for Map
```http
GET /api/map/active-complaints?wardId=1&departmentId=2
Authorization: Bearer {token}
```
**Query Parameters:**
- `wardId`: Long (optional)
- `departmentId`: Long (optional)

**Response:**
```json
{
  "count": 25,
  "complaints": [
    {
      "complaintId": 123,
      "title": "Street light not working",
      "description": "Dark area at night...",
      "status": "IN_PROGRESS",
      "priority": "MEDIUM",
      "latitude": 18.5204,
      "longitude": 73.8567,
      "wardName": "Shivaji Nagar",
      "departmentName": "Electricity",
      "createdAt": "2026-01-30T10:30:00",
      "assignedOfficer": "Officer Name",
      "slaStatus": "ACTIVE"
    }
  ]
}
```

#### Get Map Statistics
```http
GET /api/map/statistics?wardId=1&departmentId=2
Authorization: Bearer {token}
```
**Response:**
```json
{
  "total": 150,
  "assigned": 30,
  "inProgress": 50,
  "resolved": 40,
  "approved": 15,
  "closed": 15,
  "activeOnMap": 80
}
```

#### Get Hotspots
```http
GET /api/map/hotspots
Authorization: Bearer {token}
```
**Response:**
```json
{
  "hotspots": [
    {
      "wardName": "Shivaji Nagar",
      "activeComplaints": 45
    },
    {
      "wardName": "Kothrud",
      "activeComplaints": 38
    }
  ]
}
```

---

## 7️⃣ ANALYTICS APIs

### Dashboard Count Service
**Controller:** `DashboardController`  
**Base Path:** `/api/dashboard`

#### Get Dashboard Counts
```http
GET /api/dashboard/counts
Authorization: Bearer {token}
```
**Description:** Returns role-specific dashboard counts

**Response (varies by role):**
```json
{
  "totalComplaints": 15,
  "pending": 5,
  "inProgress": 3,
  "resolved": 5,
  "closed": 2
}
```

---

### SLA Dashboard
**Controller:** `SlaDashboardController`  
**Base Path:** `/api/dashboard/sla`

#### Get SLA Stats
```http
GET /api/dashboard/sla
Authorization: Bearer {token}
```
**Response:**
```json
{
  "active": 10,
  "warning": 3,
  "breached": 2,
  "completed": 50
}
```

---

## 8️⃣ MAP APIs

All map-related APIs are covered in sections 2.7, 3.4, 4.3, 5.4, and 6.4-6.5.

---

## 9️⃣ NOTIFICATION APIs

### Controller: `NotificationController`  
**Base Path:** `/api/notifications`

#### Get All Notifications
```http
GET /api/notifications
Authorization: Bearer {token}
```
**Response:**
```json
[
  {
    "notificationId": 1,
    "title": "Complaint Assigned",
    "message": "Your complaint #123 has been assigned",
    "type": "ASSIGNED",
    "read": false,
    "createdAt": "2026-01-30T11:00:00",
    "complaintId": 123
  }
]
```

#### Get Unread Notifications
```http
GET /api/notifications/unread
Authorization: Bearer {token}
```

#### Get Unread Count
```http
GET /api/notifications/unread/count
Authorization: Bearer {token}
```
**Response:**
```json
{
  "unreadCount": 5
}
```

#### Mark as Read
```http
PUT /api/notifications/{id}/read
Authorization: Bearer {token}
```

#### Mark All as Read
```http
PUT /api/notifications/read-all
Authorization: Bearer {token}
```
**Response:**
```json
{
  "message": "All notifications marked as read",
  "updatedCount": 8,
  "unreadCount": 0
}
```

#### Delete Notification
```http
DELETE /api/notifications/{id}
Authorization: Bearer {token}
```

#### Clear Read Notifications
```http
DELETE /api/notifications/clear-read
Authorization: Bearer {token}
```

---

## 🔟 PROFILE MANAGEMENT APIs

### 10.1 General Profile
**Controller:** `ProfileController`  
**Base Path:** `/api/profile`

#### View Profile
```http
GET /api/profile
Authorization: Bearer {token}
```
**Response:**
```json
{
  "userId": 42,
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "9876543210",
  "role": "CITIZEN",
  "ward": "Shivaji Nagar",
  "department": null,
  "address": "123 Main Street",
  "joinedDate": "2025-12-01"
}
```

#### Update Name
```http
PUT /api/profile/name
Authorization: Bearer {token}
Content-Type: application/json
```
**Request:**
```json
{
  "name": "John Updated Doe"
}
```

#### Change Password
```http
PUT /api/profile/password
Authorization: Bearer {token}
Content-Type: application/json
```
**Request:**
```json
{
  "currentPassword": "OldPassword@123",
  "newPassword": "NewPassword@123"
}
```

---

### 10.2 Mobile OTP
**Controller:** `MobileOtpController`  
**Base Path:** `/api/profile/mobile`

#### Request OTP (sent to old mobile)
```http
POST /api/profile/mobile/request-otp
Authorization: Bearer {token}
Content-Type: application/json
```
**Request:**
```json
{
  "newMobile": "9999999999"
}
```
**Response:**
```json
{
  "message": "OTP sent to registered mobile number"
}
```

#### Verify OTP & Update Mobile
```http
POST /api/profile/mobile/verify-otp
Authorization: Bearer {token}
Content-Type: application/json
```
**Request:**
```json
{
  "otp": "123456"
}
```
**Response:**
```json
{
  "message": "Mobile number updated successfully"
}
```

---

## 1️⃣1️⃣ MASTER DATA APIs

### 11.1 Wards
**Controller:** `WardController`  
**Base Path:** `/api/wards`

#### Get All Wards
```http
GET /api/wards
```
**Response:**
```json
[
  {
    "wardId": 1,
    "wardNumber": 1,
    "areaName": "Shivaji Nagar",
    "zone": "Central",
    "population": 50000
  }
]
```

---

### 11.2 Departments
**Controller:** `DepartmentController`  
**Base Path:** `/api/departments`

#### Get All Departments
```http
GET /api/departments
```
**Response:**
```json
[
  {
    "departmentId": 1,
    "name": "Water Supply"
  }
]
```

---

## 1️⃣2️⃣ WARD CHANGE APIs

### Controller: `WardChangeController`  
**Base Path:** `/api/ward-change`

#### Create Ward Change Request (Citizen)
```http
POST /api/ward-change/request
Authorization: Bearer {token}
Role: CITIZEN
Content-Type: application/json
```
**Request:**
```json
{
  "wardId": 2
}
```

#### Get My Requests (Citizen)
```http
GET /api/ward-change/my-requests
Authorization: Bearer {token}
```
**Response:**
```json
[
  {
    "requestId": 1,
    "citizenName": "John Doe",
    "citizenEmail": "john@example.com",
    "citizenMobile": "9876543210",
    "oldWardNumber": 1,
    "requestedWardNumber": 2,
    "status": "PENDING",
    "requestedAt": "2026-01-30T10:00:00",
    "decidedAt": null,
    "decidedBy": null,
    "remarks": null
  }
]
```

#### Get Pending Requests (Ward Officer)
```http
GET /api/ward-change/pending
Authorization: Bearer {token}
Role: WARD_OFFICER
```

#### Approve Request (Ward Officer)
```http
PUT /api/ward-change/{requestId}/approve
Authorization: Bearer {token}
Role: WARD_OFFICER
Content-Type: application/json
```
**Request:**
```json
{
  "remarks": "Approved - address verified"
}
```

#### Reject Request (Ward Officer)
```http
PUT /api/ward-change/{requestId}/reject
Authorization: Bearer {token}
Role: WARD_OFFICER
Content-Type: application/json
```
**Request:**
```json
{
  "remarks": "Rejected - address not in requested ward"
}
```

---

## 1️⃣3️⃣ SEARCH APIs

### Controller: `GlobalSearchController`  
**Base Path:** `/api/search`

#### Search Complaints
```http
GET /api/search/complaints?query=pothole&wardId=1&departmentId=2&page=0&size=10
Authorization: Bearer {token}
```
**Query Parameters:**
- `query`: String (required) - Search term
- `wardId`: Long (optional)
- `departmentId`: Long (optional)
- `page`, `size`: Pagination

**Response:** Paginated complaint results (scope based on user role)

---

## 📊 SUMMARY OF ALL ENDPOINTS

### Total Endpoints by Category:
- **Authentication:** 1 endpoint
- **Citizen APIs:** ~20 endpoints
- **Ward Officer APIs:** ~15 endpoints
- **Department Officer APIs:** ~10 endpoints
- **Admin APIs:** ~25 endpoints
- **Common/Shared APIs:** ~15 endpoints
- **Notifications:** 7 endpoints
- **Profile Management:** 5 endpoints
- **Master Data:** 2 endpoints
- **Ward Change:** 5 endpoints
- **Search:** 1 endpoint
- **Analytics:** ~15 endpoints

**Total: ~120+ API endpoints**

---

## 🔍 MISSING/INCOMPLETE APIS

Based on the controller analysis, the following features may need attention:

### 1. **Citizen Registration Response**
- ✅ Implemented: `POST /api/citizens/register`
- ⚠️ Note: Returns basic response, may need enhanced DTO

### 2. **Officer Directory APIs**
- ✅ Multiple implementations exist
- ⚠️ Potential duplication between:
  - `CitizenOfficerController`
  - `CitizenOfficerDirectoryController`
- **Recommendation:** Consolidate into single controller

### 3. **Complaint Status Updates**
- ✅ Implemented for all roles
- ⚠️ Ensure consistent response DTOs across all endpoints

### 4. **Image Upload**
- ✅ Implemented
- ⚠️ Verify file size limits and supported formats are documented

### 5. **SLA Monitoring**
- ✅ Multiple SLA endpoints exist
- ✅ Real-time SLA tracking implemented
- ⚠️ Ensure SLA breach notifications are working

### 6. **Export Functionality**
- ✅ Excel export implemented
- ❌ PDF export removed (as per recent changes)

### 7. **Audit Logs**
- ✅ Implemented
- ⚠️ Verify all critical actions are being logged

### 8. **Analytics**
- ✅ Comprehensive analytics for all roles
- ✅ Charts and trends implemented

---

## 🎯 RECOMMENDATIONS

### 1. **API Consistency**
- Ensure all endpoints return consistent error responses
- Standardize pagination across all list endpoints
- Use consistent DTO naming conventions

### 2. **Documentation**
- Add Swagger/OpenAPI annotations to all controllers
- Document all query parameters and their constraints
- Include example requests/responses

### 3. **Security**
- Verify all endpoints have proper role-based access control
- Ensure sensitive data is not exposed in responses
- Implement rate limiting for public endpoints

### 4. **Performance**
- Add caching for master data (wards, departments)
- Optimize queries with proper indexing
- Implement pagination for all list endpoints

### 5. **Error Handling**
- Implement global exception handler
- Return meaningful error messages
- Include error codes for client-side handling

---

## 📝 NOTES

1. **Base URL:** All endpoints assume `http://localhost:8083/api` as the base URL
2. **Authentication:** Most endpoints require JWT token in `Authorization: Bearer {token}` header
3. **Content-Type:** Use `application/json` for JSON requests, `multipart/form-data` for file uploads
4. **Pagination:** Default page size is typically 10, page numbers start from 0
5. **Date Format:** ISO 8601 format (e.g., `2026-01-30T10:30:00`)

---

**End of Document**
