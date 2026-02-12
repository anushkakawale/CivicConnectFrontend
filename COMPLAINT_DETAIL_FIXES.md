# 🔧 Urgent Fixes for Complaint Detail Page

## Issues Identified:

1. ❌ **Ward & Department showing "N/A"** - Backend not returning proper data
2. ❌ **SLA not tracking** - SLA endpoint failing or returning incomplete data  
3. ❌ **Submitted date showing "N/A"** - createdAt field missing/incorrect format
4. ❌ **Location showing "N/A"** - address field missing
5. ❌ **Notification bell turning white on hover** - CSS issue
6. ❌ **403 errors on citizen endpoints** - Backend security config (already documented)

---

## 🎯 Fix 1: Backend - Ensure Complete Data Return

### Issue:
The API `/api/citizen/complaints/{id}` is not returning complete data fields.

### Required JSON Response Format:
```json
{
  "complaintId": 4,
  "title": "Street Light Not Working in Kasba Peth Area",
  "description": "I am a resident of Kasba Peth...",
  "status": "SUBMITTED",
  "category": "STREETLIGHT",
  "priority": "MEDIUM",
  "wardId": 1,
  "wardName": "Kasba Peth",
  "departmentId": 3,
  "departmentName": "Electrical Department",
  "address": "Near Main Square, Kasba Peth, Pune - 411011",
  "latitude": 18.5204,
  "longitude": 73.8567,
  "createdAt": "2026-02-10T15:30:00",
  "updatedAt": "2026-02-10T15:30:00",
  "assignedOfficer": "Ramesh Kumar",
  "images": [
    "uploads/complaints/4/image1.jpg",
    "uploads/complaints/4/image2.jpg"
  ],
  "feedback": null
}
```

### Backend Controller Fix:

```java
@GetMapping("/citizen/complaints/{id}")
@PreAuthorize("hasRole('CITIZEN')")
public ResponseEntity<?> getComplaintDetails(@PathVariable Long id, Authentication auth) {
    String email = auth.getName();
    
    ComplaintReport complaint = complaintRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
    
    // Verify citizen owns this complaint
    if (!complaint.getCitizen().getEmail().equals(email)) {
        throw new AccessDeniedException("Access denied");
    }
    
    ComplaintDetailDTO dto = ComplaintDetailDTO.builder()
        .complaintId(complaint.getComplaintId())
        .title(complaint.getTitle())
        .description(complaint.getDescription())
        .status(complaint.getStatus())
        .category(complaint.getCategory())
        .priority(complaint.getPriority())
        
        // ✅ IMPORTANT: Include ward info
        .wardId(complaint.getWard() != null ? complaint.getWard().getWardId() : null)
        .wardName(complaint.getWard() != null ? complaint.getWard().getWardName() : null)
        
        // ✅ IMPORTANT: Include department info
        .departmentId(complaint.getDepartment() != null ? complaint.getDepartment().getDepartmentId() : null)
        .departmentName(complaint.getDepartment() != null ? complaint.getDepartment().getDepartmentName() : null)
        
        // ✅ IMPORTANT: Include location
        .address(complaint.getAddress())
        .latitude(complaint.getLatitude())
        .longitude(complaint.getLongitude())
        
        // ✅ IMPORTANT: Include dates
        .createdAt(complaint.getCreatedAt())
        .updatedAt(complaint.getUpdatedAt())
        
        // ✅ Include officer if assigned
        .assignedOfficer(complaint.getAssignedOfficer() != null ? 
            complaint.getAssignedOfficer().getName() : null)
        
        // ✅ Include images
        .images(complaint.getImages() != null ? complaint.getImages() : new ArrayList<>())
        
        // ✅ Include feedback if exists
        .feedback(complaint.getFeedback())
        
        .build();
    
    return ResponseEntity.ok(dto);
}
```

---

## 🎯 Fix 2: Backend - SLA Tracking Endpoint

### Issue:
The `/api/citizen/complaints/{id}/sla` endpoint is not returning proper SLA data.

### Required SLA Response Format:
```json
{
  "status": "ACTIVE",
  "expectedResolutionDate": "2026-02-15T15:30:00",
  "elapsedHours": 24,
  "remainingHours": 96,
  "isBreach": false,
  "slaDeadline": "2026-02-15T15:30:00"
}
```

### Backend Controller:

```java
@GetMapping("/citizen/complaints/{id}/sla")
@PreAuthorize("hasRole('CITIZEN')")
public ResponseEntity<?> getSlaCountdown(@PathVariable Long id) {
    ComplaintReport complaint = complaintRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
    
    // Calculate SLA based on priority
    int slaHours = switch (complaint.getPriority()) {
        case "HIGH" -> 24;
        case "MEDIUM" -> 120;
        case "LOW" -> 168;
        default -> 120;
    };
    
    ZonedDateTime createdAt = complaint.getCreatedAt().atZone(ZoneId.systemDefault());
    ZonedDateTime expectedResolution = createdAt.plusHours(slaHours);
    ZonedDateTime now = ZonedDateTime.now();
    
    long elapsedHours = ChronoUnit.HOURS.between(createdAt, now);
    long remainingHours = ChronoUnit.HOURS.between(now, expectedResolution);
    boolean isBreach = remainingHours < 0;
    
    SlaInfoDTO sla = SlaInfoDTO.builder()
        .status(isBreach ? "BREACHED" : "ACTIVE")
        .expectedResolutionDate(expectedResolution.toLocalDateTime())
        .elapsedHours(elapsedHours)
        .remainingHours(Math.max(0, remainingHours))
        .isBreach(isBreach)
        .slaDeadline(expectedResolution.toLocalDateTime())
        .build();
    
    return ResponseEntity.ok(sla);
}
```

---

## 🎯 Fix 3: Frontend - Notification Bell Hover Issue

### Problem:
When hovering over the notification bell in a dark header, it turns into the wrong color.

### File: `src/components/notifications/NotificationBell.css`

**Current Code (Line 22-27):**
```css
.notification-bell-button:hover {
    background: #F8FAFC;
    color: #173470;  /* ← This makes it blue on hover */
    border-color: #E2E8F0;
    transform: translateY(-2px);
}
```

**Fixed Code:**
```css
.notification-bell-button:hover {
    background: rgba(255, 255, 255, 0.1);  /* ← Subtle white overlay */
    backdrop-filter: blur(8px);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    /* Color is inherited from parent style prop, not forced */
}

/* For dark icon mode (dashboards with white background) */
.notification-bell-button.dark-mode:hover {
    background: #F8FAFC;
    color: #173470;
    border-color: #E2E8F0;
}
```

---

## 🎯 Fix 4: Frontend - Better Error Handling & Data Display

### File: `src/pages/citizen/ComplaintDetail.jsx`

The frontend is already well-built, but let's add console logs to debug what data is actually being received:

**Add after line 46:**
```javascript
console.log('📦 Complaint Data Received:', data);
console.log('🏛️ Ward ID:', data.wardId, 'Ward Name:', data.wardName);
console.log('🏢 Dept ID:', data.departmentId, 'Dept Name:', data.departmentName);
console.log('📅 Created At:', data.createdAt);
console.log('📍 Address:', data.address);
console.log('🖼️ Images:', data.images);
```

**Add after line 48:**
```javascript
if (slaRes) {
    console.log('⏱️ SLA Data Received:', slaRes);
} else {
    console.warn('⚠️ SLA data not available for this complaint');
}
```

This will help you see EXACTLY what the backend is sending vs what the frontend expects.

---

## 🎯 Fix 5: Frontend - Fallback for Missing Data

### Update ComplaintDetail.jsx Display Logic

**For Ward (line 194):**
```javascript
<p className="text-dark mb-0">
    {wardInfo?.areaName || wardInfo?.wardName || complaint.wardName || 
     (complaint.wardId ? `Ward ${complaint.wardId}` : 'Not Assigned')}
</p>
```

**For Department (line 198-201):**
```javascript
<p className="text-dark mb-0 d-flex align-items-center gap-2">
    <Building2 size={16} style={{ color: PRIMARY_COLOR }} />
    {deptInfo?.departmentName || complaint.departmentName || 
     (complaint.departmentId ? `Department ${complaint.departmentId}` : 'Not Assigned')}
</p>
```

**For SLA Display (add after existing SLA card):**
```javascript
{!slaInfo && (
    <div className="alert alert-warning d-flex align-items-center gap-2">
        <Info size={20} />
        <span>SLA tracking not available for this complaint status.</span>
    </div>
)}
```

---

## 🧪 Testing Checklist

### Backend Testing (Postman):

**1. Test Complaint Detail Endpoint**
```
GET http://localhost:8083/api/citizen/complaints/4
Headers: Authorization: Bearer <citizen_token>

Expected Response:
✅ wardId: notnil
✅ wardName: not_null
✅ departmentId: not null
✅ departmentName: not null
✅ address: not null
✅ createdAt: ISO 8601 format
✅ images: array (can be empty)
```

**2. Test SLA Endpoint**
```
GET http://localhost:8083/api/citizen/complaints/4/sla
Headers: Authorization: Bearer <citizen_token>

Expected Response:
✅ status: "ACTIVE" or "BREACHED"
✅ expectedResolutionDate: ISO 8601 format
✅ elapsedHours: number > 0
✅ remainingHours: number >= 0
```

### Frontend Testing:

1. ✅ Open browser console (F12)
2. ✅ Navigate to `/citizen/complaints/4`
3. ✅ Check console logs for received data
4. ✅ Verify Ward shows ward name (not "N/A")
5. ✅ Verify Department shows department name (not "N/A")
6. ✅ Verify Submitted On shows formatted date (not "N/A")
7. ✅ Verify Location shows address (not "N/A")
8. ✅ Verify SLA section shows:
   - Status: ACTIVE/BREACHED
   - Expected Resolution: Date
   - Time Elapsed: X hours
9. ✅ Hover over notification bell → Should NOT turn white/invisible
10. ✅ Images display correctly in gallery

---

## 📋 Quick Fix Priority Order:

### Priority 1: CRITICAL (Do This First)
1. ✅ Fix backend `ComplaintDetailDTO` to include all fields
2. ✅ Test endpoint returns complete data
3. ✅ Fix SLA endpoint to return proper data

### Priority 2: IMPORTANT (Do After Backend)
4. ✅ Add console logs to frontend for debugging
5. ✅ Test frontend with complete backend data
6. ✅ Fix notification bell hover CSS

### Priority 3: NICE TO HAVE
7. ✅ Add better error messages for missing data
8. ✅ Add fallback displays
9. ✅ Add loading skeletons

---

## 🔍 Root Cause Analysis:

### Why Ward/Department shows "N/A":
- Backend `ComplaintDetailDTO` is missing `wardName` and `departmentName` fields
- OR the entity relationships (`@ManyToOne`) are not eagerly loaded
- OR the DTO mapping is not including these fields

### Why SLA shows "N/A" / "0 hours":
- SLA endpoint is either:
  - Not implemented
  - Returning 403 (needs security config fix - already documented)
  - Returning null/empty response
  - Using wrong date format

### Why Notification Bell turns white:
- CSS `:hover` rule forces `color: #173470` (blue)
- This conflicts with the inline style `color: #FFFFFF` from parent
- Need to respect parent color or use backdrop filter instead

---

## ✅ Expected Final State:

After all fixes:

```
Complaint Detail Page:
├── Header: "Complaint #4"
├── Ward: "Kasba Peth" ✅ (not "N/A")
├── Status Banner: "SUBMITTED" (blue color)
├── Details Card:
│   ├── Title: ✅ "Street Light Not Working..."
│   ├── Description: ✅ Full text
│   ├── Location: ✅ "Near Main Square, Kasba Peth, Pune - 411011"
│   ├── Submitted On: ✅ "10 Feb 2026, 3:30 PM"
│   ├── Ward: ✅ "Kasba Peth"
│   └── Department: ✅ "Electrical Department"
├── Image Gallery: ✅ 2 images visible & clickable
├── SLA Tracker:
│   ├── Status: ✅ "ACTIVE"
│   ├── Expected Resolution: ✅ "15 Feb 2026, 3:30 PM"
│   └── Time Elapsed: ✅ "24 hours"
├── Quick Info:
│   ├── Status: ✅ "SUBMITTED"
│   ├── Assigned To: "Not assigned yet" ✅
│   └── Priority: ✅ "MEDIUM"
└── Notification Bell: ✅ Stays white on hover (in dark header)
```

---

## 📞 Need Help?

Check these conversations for related fixes:
- **f4bb913a** - Fixing 403 Complaint Error
- **31b62ea8** - Enhancing Complaint Features
- **8019e18b** - Admin & Ward Officer Features

---

**Once the backend properly returns `wardName`, `departmentName`, `address`, `createdAt`, and SLA data, the frontend will display everything perfectly!** 🎯
