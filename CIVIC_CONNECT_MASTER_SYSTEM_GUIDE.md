# 🏙️ CIVIC CONNECT: MASTER SYSTEM & INTEGRATION GUIDE
## High-Fidelity Tactical Governance Platform • PMC Integrated

This document serves as the **Single Source of Truth** for the Civic Connect frontend-backend integration. It details the complete complaint lifecycle, role-based orchestration, and the Unified Intelligence Schema (UIS).

---

## 🛡️ 1. SYSTEM CORE ARCHITECTURE

### Tactical Aesthetic Principles
- **Theme**: Premium Tactical (Deep Navy `#173470`, Institutional Grey, Signal Red, Success Green).
- **Typography**: `Outfit` (Headings), `Inter` (Body).
- **Elements**: Glassmorphism, Rounded (2rem+), Drop Shadows (Premium), Micro-animations.

### Security Framework
- **Auth**: JWT (Stateless).
- **Roles**: `CITIZEN`, `WARD_OFFICER`, `DEPARTMENT_OFFICER`, `ADMIN`.
- **Encryption**: Citizen Identity Masking in Public Views.

---

## 🔄 2. THE COMPLAINT LIFECYCLE (TACTICAL WORKFLOW)

| Status | Phase | Actor | Description |
| :--- | :--- | :--- | :--- |
| **SUBMITTED** | Initialization | Citizen | Complaint registered with initial image/geolocation. |
| **ASSIGNED** | Dispatch | Ward Officer | Ward Officer reviews and assigns to a Department Officer. |
| **IN_PROGRESS** | Operations | Dept Officer | Officer "Starts Work". Can upload Progress Evidence. |
| **RESOLVED** | Validation | Dept Officer | Officer uploads Final Proof and marks as Resolved. |
| **APPROVED** | Verification | Ward Officer | Ward Officer reviews proof; approves or rejects (re-opens). |
| **CLOSED** | Archival | Admin | Admin authorizes final closure after cooling period. |
| **REOPENED** | Re-Deploy | Citizen | Citizen rejects resolution within 7 days. |

---

## 📡 3. UNIFIED API ARCHITECURE (REST COMMANDS)

### 3.1. Citizen Operations
- **Filing**: `POST /api/complaints` (Multipart: `title`, `description`, `categoryId`, `wardId`, `images[]`)
- **Intelligence**: `GET /api/complaints/{id}/details` (Returns Full Dossier)
- **Tracking**: `GET /api/complaints/my`
- **Sentiment**: `POST /api/feedback/{id}` (`{ "rating": 5, "comments": "Excellent" }`)
- **Reactive**: `POST /api/complaints/{id}/reopen` (`{ "reason": "Not fixed" }`)

### 3.2. Ward Officer (Command & Control)
- **Sector Intel**: `GET /api/ward-officer/complaints`
- **Dispatch**: `POST /api/ward-officer/complaints/{id}/assign` (`{ "officerId": 101 }`)
- **Verification**: `POST /api/ward-officer/complaints/{id}/approve` (`{ "remarks": "Verified" }`)
- **Rejection**: `POST /api/ward-officer/complaints/{id}/reject` (`{ "remarks": "Fix again" }`)
- **Recruitment**: `POST /api/ward-officer/management/officers` (Register Dept Officer)

### 3.3. Department Officer (Field Operations)
- **Dossier Queue**: `GET /api/department/complaints`
- **Activation**: `POST /api/department/complaints/{id}/start`
- **Evidence**: `POST /api/department/complaints/{id}/progress` (Images + Remark)
- **Objective Met**: `POST /api/department/complaints/{id}/resolve` (Images + Remark)

### 3.4. Administrator (Institutional Audit)
- **Global Audit**: `GET /api/admin/reports/ledger`
- **Closure**: `POST /api/admin/complaints/{id}/close` (`{ "remarks": "Audit Pass" }`)
- **Analytics**: `GET /api/admin/analytics/ward-performance`

---

## 📦 4. DATA MODEL: UNIFIED COMPLAINT DOSSIER (JSON)

Every `/details` request returns this structure to ensure UI consistency across all roles:

```json
{
  "id": 5001,
  "title": "Main Junction Pipe Leakage",
  "description": "Critical water wastage at Sector 7 junction.",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "wardName": "Kothrud South",
  "departmentName": "WATER_SUPPLY",
  "citizenName": "Anushka K.",
  "wardOfficerName": "Commander Rajesh V.",
  "assignedOfficerName": "Operative Suresh P.",
  "images": [
    { "imageUrl": "...", "stage": "INITIAL", "uploadedAt": "..." },
    { "imageUrl": "...", "stage": "IN_PROGRESS", "uploadedAt": "..." }
  ],
  "history": [
    { "status": "SUBMITTED", "changedBy": "CITIZEN", "remarks": "Filed case.", "changedAt": "..." },
    { "status": "ASSIGNED", "changedBy": "WARD_OFFICER", "remarks": "Assigned to Water Unit.", "changedAt": "..." }
  ],
  "slaDetails": {
    "status": "ON_TRACK",
    "deadline": "2024-03-15T10:00:00",
    "remainingHours": 14,
    "totalHoursAllocated": 24
  },
  "feedback": {
    "rating": 5,
    "comment": "Pending Resolution"
  }
}
```

---

## 🛠️ 5. FRONTEND INTEGRATION CHECKLIST

1. **DashboardHeader**: Use on every page for consistent context (Role, Ward, Dossier ID).
2. **StatusBadge**: Centralized component for all visual status indicators.
3. **SlaCard**: Mandatory for detail views to track institutional performance.
4. **ImageManager**: Multi-stage upload with `progress` and `resolution` slots.
5. **OperationalRegistry**: The timeline/audit log view for accountability.

---

## 🔒 6. SECURITY & PERMISSIONS

- **CITIZEN**: Can only see own complaints + Public metrics of their ward.
- **WARD_OFFICER**: Can see all complaints in their specifically assigned ward.
- **DEPT_OFFICER**: Can only see complaints assigned to them by their Ward Commander.
- **ADMIN**: Global read/write access for audit and institutional closure.

---
**End of Master Guide**
