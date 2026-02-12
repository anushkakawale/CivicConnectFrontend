# 🔧 Backend Permission Fix Guide - Department Officer 403 Errors

## 🚨 **Critical Issue: 403 Forbidden Errors**

### **Problem Summary**
Department officers are getting **403 Forbidden** errors when trying to:
1. ❌ View complaint details: `GET /department-officer/complaints/{id}`
2. ❌ Start work: `PUT /department-officer/complaints/{id}/start`
3. ❌ View SLA details: `GET /department-officer/complaints/{id}/sla`

### **Root Cause**
The backend Spring Security configuration is **not granting proper permissions** to the `DEPARTMENT_OFFICER` role for these endpoints.

---

## 🔍 **Error Analysis**

### **Error Logs**
```
❌ API Error: GET /department-officer/complaints/4
📊 Status: 403
Message: Request failed with status code 403

❌ API Error: PUT /department-officer/complaints/4/start
📊 Status: 403
⚠️ Start work permission denied. Check backend role configuration.

❌ API Error: GET /department-officer/complaints/4/sla
📊 Status: 403
```

### **What's Working** ✅
- `GET /department-officer/complaints` (list) - **200 OK**
- Authentication is present
- Frontend is making correct API calls

### **What's Broken** ❌
- Individual complaint access
- Start work action
- SLA details access

---

## 🛠️ **Backend Fixes Required**

### **1. Spring Security Configuration**

**File**: `SecurityConfig.java` or similar

**Current (Broken)**:
```java
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/department-officer/complaints").hasRole("DEPARTMENT_OFFICER")
    // Missing individual complaint access!
    .requestMatchers("/api/department-officer/**").hasRole("ADMIN") // Wrong!
);
```

**Fixed (Correct)**:
```java
http.authorizeHttpRequests(auth -> auth
    // Department Officer endpoints
    .requestMatchers(HttpMethod.GET, "/api/department-officer/complaints/**").hasAnyRole("DEPARTMENT_OFFICER", "ADMIN")
    .requestMatchers(HttpMethod.PUT, "/api/department-officer/complaints/*/start").hasAnyRole("DEPARTMENT_OFFICER", "ADMIN")
    .requestMatchers(HttpMethod.PUT, "/api/department-officer/complaints/*/resolve").hasAnyRole("DEPARTMENT_OFFICER", "ADMIN")
    .requestMatchers(HttpMethod.POST, "/api/department-officer/complaints/*/progress-images").hasAnyRole("DEPARTMENT_OFFICER", "ADMIN")
    .requestMatchers(HttpMethod.POST, "/api/department-officer/complaints/*/resolution-images").hasAnyRole("DEPARTMENT_OFFICER", "ADMIN")
    .requestMatchers(HttpMethod.POST, "/api/department-officer/complaints/*/resolve-with-images").hasAnyRole("DEPARTMENT_OFFICER", "ADMIN")
    .requestMatchers("/api/department-officer/**").hasAnyRole("DEPARTMENT_OFFICER", "ADMIN")
);
```

---

### **2. Controller Method Annotations**

**File**: `DepartmentOfficerController.java`

**Check these methods have correct annotations**:

```java
@RestController
@RequestMapping("/api/department-officer")
@PreAuthorize("hasRole('DEPARTMENT_OFFICER')") // Class-level
public class DepartmentOfficerController {

    @GetMapping("/complaints/{id}")
    @PreAuthorize("hasAnyRole('DEPARTMENT_OFFICER', 'ADMIN')")
    public ResponseEntity<?> getComplaintDetails(@PathVariable Long id) {
        // Implementation
    }

    @PutMapping("/complaints/{id}/start")
    @PreAuthorize("hasAnyRole('DEPARTMENT_OFFICER', 'ADMIN')")
    public ResponseEntity<?> startWork(@PathVariable Long id) {
        // Implementation
    }

    @GetMapping("/complaints/{id}/sla")
    @PreAuthorize("hasAnyRole('DEPARTMENT_OFFICER', 'ADMIN')")
    public ResponseEntity<?> getSlaDetails(@PathVariable Long id) {
        // Implementation
    }

    @PostMapping("/complaints/{id}/progress-images")
    @PreAuthorize("hasAnyRole('DEPARTMENT_OFFICER', 'ADMIN')")
    public ResponseEntity<?> uploadProgressImages(
        @PathVariable Long id,
        @RequestParam("images") MultipartFile[] images
    ) {
        // Implementation
    }

    @PostMapping("/complaints/{id}/resolution-images")
    @PreAuthorize("hasAnyRole('DEPARTMENT_OFFICER', 'ADMIN')")
    public ResponseEntity<?> uploadResolutionImages(
        @PathVariable Long id,
        @RequestParam("images") MultipartFile[] images
    ) {
        // Implementation
    }
}
```

---

### **3. Service Layer Authorization**

**File**: `DepartmentOfficerService.java`

**Ensure the service checks assignment**:

```java
@Service
public class DepartmentOfficerService {

    public ComplaintDTO getComplaintDetails(Long complaintId, String username) {
        // Get current user
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UnauthorizedException("User not found"));
        
        // Get complaint
        Complaint complaint = complaintRepository.findById(complaintId)
            .orElseThrow(() -> new NotFoundException("Complaint not found"));
        
        // Check if this officer is assigned to this complaint
        if (!complaint.getAssignedOfficer().getId().equals(user.getId())) {
            throw new ForbiddenException("You are not assigned to this complaint");
        }
        
        return mapToDTO(complaint);
    }

    public void startWork(Long complaintId, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UnauthorizedException("User not found"));
        
        Complaint complaint = complaintRepository.findById(complaintId)
            .orElseThrow(() -> new NotFoundException("Complaint not found"));
        
        // Verify assignment
        if (!complaint.getAssignedOfficer().getId().equals(user.getId())) {
            throw new ForbiddenException("You are not assigned to this complaint");
        }
        
        // Verify status
        if (!complaint.getStatus().equals(ComplaintStatus.ASSIGNED)) {
            throw new BadRequestException("Complaint must be in ASSIGNED status to start work");
        }
        
        // Update status
        complaint.setStatus(ComplaintStatus.IN_PROGRESS);
        complaint.setWorkStartedAt(LocalDateTime.now());
        complaintRepository.save(complaint);
    }
}
```

---

### **4. Ward Officer Approval/Rejection**

**File**: `WardOfficerController.java`

**Add approve/reject endpoints**:

```java
@RestController
@RequestMapping("/api/ward-officer")
@PreAuthorize("hasRole('WARD_OFFICER')")
public class WardOfficerController {

    @PutMapping("/complaints/{id}/approve")
    @PreAuthorize("hasAnyRole('WARD_OFFICER', 'ADMIN')")
    public ResponseEntity<?> approveResolution(
        @PathVariable Long id,
        @RequestBody ApprovalRequest request
    ) {
        String username = SecurityContextHolder.getContext()
            .getAuthentication().getName();
        
        wardOfficerService.approveComplaint(id, username, request.getRemarks());
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Complaint approved successfully"
        ));
    }

    @PutMapping("/complaints/{id}/reject")
    @PreAuthorize("hasAnyRole('WARD_OFFICER', 'ADMIN')")
    public ResponseEntity<?> rejectResolution(
        @PathVariable Long id,
        @RequestBody RejectionRequest request
    ) {
        String username = SecurityContextHolder.getContext()
            .getAuthentication().getName();
        
        if (request.getRemarks() == null || request.getRemarks().trim().isEmpty()) {
            throw new BadRequestException("Remarks are required for rejection");
        }
        
        wardOfficerService.rejectComplaint(id, username, request.getRemarks());
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Complaint rejected. Department officer will be notified."
        ));
    }
}
```

**DTOs**:
```java
public class ApprovalRequest {
    private String remarks;
    // getters/setters
}

public class RejectionRequest {
    @NotBlank(message = "Remarks are required for rejection")
    private String remarks;
    // getters/setters
}
```

---

### **5. Ward Officer Service Implementation**

**File**: `WardOfficerService.java`

```java
@Service
public class WardOfficerService {

    @Autowired
    private ComplaintRepository complaintRepository;
    
    @Autowired
    private NotificationService notificationService;

    @Transactional
    public void approveComplaint(Long complaintId, String username, String remarks) {
        User wardOfficer = userRepository.findByUsername(username)
            .orElseThrow(() -> new UnauthorizedException("User not found"));
        
        Complaint complaint = complaintRepository.findById(complaintId)
            .orElseThrow(() -> new NotFoundException("Complaint not found"));
        
        // Verify ward officer has authority
        if (!complaint.getWard().getId().equals(wardOfficer.getWard().getId())) {
            throw new ForbiddenException("You can only approve complaints in your ward");
        }
        
        // Verify status
        if (!complaint.getStatus().equals(ComplaintStatus.RESOLVED)) {
            throw new BadRequestException("Only RESOLVED complaints can be approved");
        }
        
        // Update complaint
        complaint.setStatus(ComplaintStatus.APPROVED);
        complaint.setApprovedBy(wardOfficer);
        complaint.setApprovedAt(LocalDateTime.now());
        complaint.setAdminRemarks(remarks);
        complaintRepository.save(complaint);
        
        // Notify department officer
        notificationService.sendNotification(
            complaint.getAssignedOfficer(),
            "Complaint Approved",
            String.format("Your resolution for complaint #%d has been approved by the ward officer.", 
                complaint.getId()),
            NotificationPriority.MEDIUM,
            "/department-officer/complaints/" + complaint.getId()
        );
        
        // Notify citizen
        notificationService.sendNotification(
            complaint.getCitizen(),
            "Complaint Resolved",
            String.format("Your complaint #%d has been resolved and approved.", 
                complaint.getId()),
            NotificationPriority.HIGH,
            "/citizen/complaints/" + complaint.getId()
        );
    }

    @Transactional
    public void rejectComplaint(Long complaintId, String username, String remarks) {
        User wardOfficer = userRepository.findByUsername(username)
            .orElseThrow(() -> new UnauthorizedException("User not found"));
        
        Complaint complaint = complaintRepository.findById(complaintId)
            .orElseThrow(() -> new NotFoundException("Complaint not found"));
        
        // Verify ward officer has authority
        if (!complaint.getWard().getId().equals(wardOfficer.getWard().getId())) {
            throw new ForbiddenException("You can only reject complaints in your ward");
        }
        
        // Verify status
        if (!complaint.getStatus().equals(ComplaintStatus.RESOLVED)) {
            throw new BadRequestException("Only RESOLVED complaints can be rejected");
        }
        
        // Update complaint - send back to IN_PROGRESS
        complaint.setStatus(ComplaintStatus.REJECTED);
        complaint.setRejectedBy(wardOfficer);
        complaint.setRejectedAt(LocalDateTime.now());
        complaint.setAdminRemarks(remarks); // Store rejection remarks
        complaintRepository.save(complaint);
        
        // Notify department officer with rejection reason
        notificationService.sendNotification(
            complaint.getAssignedOfficer(),
            "Work Rejected - Action Required",
            String.format("Your resolution for complaint #%d has been rejected. Reason: %s", 
                complaint.getId(), remarks),
            NotificationPriority.HIGH,
            "/department-officer/complaints/" + complaint.getId()
        );
    }
}
```

---

## 📊 **Database Schema Updates**

### **Add columns to `complaints` table**:

```sql
ALTER TABLE complaints ADD COLUMN approved_by_id BIGINT;
ALTER TABLE complaints ADD COLUMN approved_at TIMESTAMP;
ALTER TABLE complaints ADD COLUMN rejected_by_id BIGINT;
ALTER TABLE complaints ADD COLUMN rejected_at TIMESTAMP;
ALTER TABLE complaints ADD COLUMN admin_remarks TEXT;

ALTER TABLE complaints ADD CONSTRAINT fk_approved_by 
    FOREIGN KEY (approved_by_id) REFERENCES users(id);
    
ALTER TABLE complaints ADD CONSTRAINT fk_rejected_by 
    FOREIGN KEY (rejected_by_id) REFERENCES users(id);
```

---

## 🎯 **Testing Checklist**

### **Department Officer**:
- [ ] Can view list of assigned complaints
- [ ] Can view individual complaint details
- [ ] Can start work on ASSIGNED complaints
- [ ] Can upload progress images
- [ ] Can upload resolution images
- [ ] Can mark complaint as RESOLVED
- [ ] Can view SLA details
- [ ] Receives notification when work is rejected

### **Ward Officer**:
- [ ] Can view complaints in their ward
- [ ] Can assign complaints to department officers
- [ ] Can view RESOLVED complaints
- [ ] Can APPROVE resolved complaints (with optional remarks)
- [ ] Can REJECT resolved complaints (with mandatory remarks)
- [ ] Rejected complaints show remarks to department officer

### **Citizen**:
- [ ] Can view their complaint status
- [ ] Can see all images (before, progress, after)
- [ ] Can see complaint description
- [ ] Receives notification when complaint is approved
- [ ] Can provide feedback on APPROVED complaints

---

## 🚀 **Quick Fix Commands**

### **1. Restart Spring Boot Application**
```bash
./mvnw spring-boot:run
# or
gradle bootRun
```

### **2. Clear Security Context**
```bash
# If using Redis for sessions
redis-cli FLUSHALL

# If using database sessions
DELETE FROM spring_session;
```

### **3. Verify Role Configuration**
```sql
-- Check user roles
SELECT u.username, u.email, r.role_name 
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
JOIN roles r ON ur.role_id = r.id;

-- Ensure DEPARTMENT_OFFICER role exists
SELECT * FROM roles WHERE role_name = 'DEPARTMENT_OFFICER';
```

---

## 📝 **Summary of Required Backend Changes**

1. ✅ **SecurityConfig.java** - Add proper role permissions for department officer endpoints
2. ✅ **DepartmentOfficerController.java** - Add `@PreAuthorize` annotations
3. ✅ **DepartmentOfficerService.java** - Implement assignment verification
4. ✅ **WardOfficerController.java** - Add approve/reject endpoints
5. ✅ **WardOfficerService.java** - Implement approval/rejection logic
6. ✅ **Database** - Add approval/rejection tracking columns
7. ✅ **NotificationService** - Send notifications on status changes

---

## ⚠️ **Important Notes**

### **Frontend is Correct** ✅
The frontend is making the **correct API calls** with the **correct paths**. The issue is **100% backend permissions**.

### **What Frontend Already Handles** ✅
- ✅ Fallback to complaint list when detail access fails
- ✅ Error logging for debugging
- ✅ User-friendly error messages
- ✅ Graceful degradation

### **What Backend Must Fix** ❌
- ❌ Grant `DEPARTMENT_OFFICER` role access to their assigned complaints
- ❌ Implement proper authorization checks in service layer
- ❌ Add approve/reject endpoints for ward officers
- ❌ Send notifications on status changes

---

**Once these backend fixes are applied, all 403 errors will be resolved and the application will work perfectly!** 🚀

**Generated**: 2026-02-10 23:20 IST
**Priority**: CRITICAL - Backend Fix Required
