# 🗺️ Ward Change Identity System - Backend Implementation Guide

## 🎯 Feature Overview
Citizens can request to change their registered ward if they move house. This requires approval from the Ward Officer of the *new* ward.

---

## 💾 1. Database Schema

```sql
CREATE TABLE ward_change_requests (
    request_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    citizen_id BIGINT NOT NULL,
    current_ward_id BIGINT NOT NULL,
    requested_ward_id BIGINT NOT NULL,
    reason TEXT,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    admin_remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    FOREIGN KEY (citizen_id) REFERENCES citizens(citizen_id),
    FOREIGN KEY (current_ward_id) REFERENCES wards(ward_id),
    FOREIGN KEY (requested_ward_id) REFERENCES wards(ward_id)
);
```

---

## ⚙️ 2. Security Configuration (SecurityConfig.java)

**CRITICAL:** You must add these to allow the frontend to communicate:

```java
.requestMatchers(HttpMethod.POST, "/api/citizens/ward-change-request").hasRole("CITIZEN")
.requestMatchers(HttpMethod.GET, "/api/ward/change-requests/**").hasRole("WARD_OFFICER")
.requestMatchers(HttpMethod.PUT, "/api/ward/change-requests/**").hasRole("WARD_OFFICER")
```

---

## 🎮 3. Citizen Controller Implementation

```java
@RestController
@RequestMapping("/api/citizens")
public class WardChangeController {

    @PostMapping("/ward-change-request")
    public ResponseEntity<?> requestWardChange(@RequestBody WardChangeRequestDTO dto, Authentication auth) {
        // 1. Get Citizen from Security Context
        // 2. Map DTO to Entity
        // 3. Save with PENDING status
        // 4. Return 201 Created
        return ResponseEntity.status(HttpStatus.CREATED).body("Request submitted for approval");
    }
}
```

---

## 👮 4. Ward Officer Controller (Approvals)

```java
@RestController
@RequestMapping("/api/ward/change-requests")
public class WardOfficerApprovalController {

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingRequests(Authentication auth) {
        // Return list of requests where requested_ward_id matches officer's ward
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long id, @RequestBody String remarks) {
        // 1. Update request status to APPROVED
        // 2. IMPORTANT: Update the Citizen's ward_id in the 'citizens' table
        // 3. Create a notification for the Citizen
        return ResponseEntity.ok("Ward updated successfully");
    }
}
```

---

## 📊 5. Citizen Profile DTO Update

To stop the "Not Assigned" issue, ensure your profile DTO returns these:

```java
public class UserProfileDTO {
    private String name;
    private String email;
    private String wardName; // 👈 Populated from Citizen.getWard().getAreaName()
    private String address;  // 👈 Populated from Citizen.getAddress().getFullAddress()
    // ... other fields
}
```

---

## 🧪 Testing Checklist

1. **Submit Request:** Citizen POSTs to `/api/citizens/ward-change-request`
2. **Verify Block:** Citizen cannot POST to `/api/ward/change-requests` (403 expected)
3. **Officer Login:** Ward Officer of the *new* ward logs in.
4. **Approve:** Officer PUTs to `/api/ward/change-requests/{id}/approve`.
5. **Verify Change:** Citizen profile now shows the NEW ward name.

---

**This system ensures data integrity while giving citizens the flexibility to move within the city.** 🏛️
