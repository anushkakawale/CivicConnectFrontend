# 🚨 Backend 403 Errors - Security Configuration Fix

## ❌ Current Issues

Multiple citizen endpoints are returning **403 Forbidden** errors because Spring Security is blocking CITIZEN role access.

### Failing Endpoints:

1. ✅ `GET /citizen/map/ward` - **For ward complaints map**
2. ✅ `GET /notifications` - **For notification system**
3. ✅ `GET /citizen/my-complaints` - **For SLA status**
4. ✅ `GET /citizen/officers/ward-officer` - **For officer directory**
5. ✅ `GET /citizen/officers/department-officers` - **For officer directory**
6. ✅ `GET /profile` - **For user profile**

---

## 🔧 Backend Fix Required

### File: `SecurityConfig.java`

You need to update the Spring Security configuration to allow CITIZEN role access to these endpoints.

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/wards").permitAll()
                .requestMatchers("/api/departments").permitAll()
                
                // ✅ CITIZEN ENDPOINTS - ADD THESE
                .requestMatchers("/api/citizen/**").hasRole("CITIZEN")
                .requestMatchers("/api/notifications").authenticated()  // All authenticated users
                .requestMatchers("/api/profile").authenticated()  // All authenticated users
                
                // Admin endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // Ward Officer endpoints
                .requestMatchers("/api/ward/**").hasRole("WARD_OFFICER")
                
                // Department Officer endpoints
                .requestMatchers("/api/department/**").hasRole("DEPT_OFFICER")
                
                // Any other request must be authenticated
                .anyRequest().authenticated()
            )
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

---

## 📋 Detailed Endpoint Requirements

### 1. `/api/citizen/map/ward`
**Purpose:** Get all complaints for citizen's ward to display on map  
**Required Role:** `CITIZEN`  
**Controller Method:**
```java
@GetMapping("/citizen/map/ward")
@PreAuthorize("hasRole('CITIZEN')")
public ResponseEntity<?> getWardComplaintsForMap(Authentication auth) {
    String email = auth.getName();
    // Get citizen's ward and return all complaints in that ward with coordinates
    return ResponseEntity.ok(citizenService.getWardComplaintsForMap(email));
}
```

### 2. `/api/notifications`
**Purpose:** Get all notifications for logged-in user  
**Required Role:** `Any authenticated user`  
**Controller Method:**
```java
@GetMapping("/notifications")
public ResponseEntity<?> getNotifications(Authentication auth) {
    String email = auth.getName();
    return ResponseEntity.ok(notificationService.getUserNotifications(email));
}
```

### 3. `/api/citizen/my-complaints`
**Purpose:** Get all complaints submitted by citizen (for SLA status tracking)  
**Required Role:** `CITIZEN`  
**Controller Method:**
```java
@GetMapping("/citizen/my-complaints")
@PreAuthorize("hasRole('CITIZEN')")
public ResponseEntity<?> getMyComplaints(Authentication auth) {
    String email = auth.getName();
    return ResponseEntity.ok(citizenService.getMyComplaints(email));
}
```

### 4. `/api/citizen/officers/ward-officer`
**Purpose:** Get ward officer details for citizen's ward  
**Required Role:** `CITIZEN`  
**Controller Method:**
```java
@GetMapping("/citizen/officers/ward-officer")
@PreAuthorize("hasRole('CITIZEN')")
public ResponseEntity<?> getWardOfficer(Authentication auth) {
    String email = auth.getName();
    return ResponseEntity.ok(citizenService.getWardOfficerForCitizen(email));
}
```

### 5. `/api/citizen/officers/department-officers`
**Purpose:** Get all department officers for citizen's ward  
**Required Role:** `CITIZEN`  
**Controller Method:**
```java
@GetMapping("/citizen/officers/department-officers")
@PreAuthorize("hasRole('CITIZEN')")
public ResponseEntity<?> getDepartmentOfficers(Authentication auth) {
    String email = auth.getName();
    return ResponseEntity.ok(citizenService.getDepartmentOfficersForWard(email));
}
```

### 6. `/api/profile`
**Purpose:** Get user profile details  
**Required Role:** `Any authenticated user`  
**Controller Method:**
```java
@GetMapping("/profile")
public ResponseEntity<?> getProfile(Authentication auth) {
    String email = auth.getName();
    return ResponseEntity.ok(userService.getProfile(email));
}
```

---

## 🎯 Service Layer Implementation

### CitizenService.java

```java
@Service
public class CitizenService {

    @Autowired
    private CitizenRepository citizenRepository;
    
    @Autowired
    private ComplaintRepository complaintRepository;
    
    @Autowired
    private WardOfficerRepository wardOfficerRepository;
    
    @Autowired
    private DepartmentOfficerRepository departmentOfficerRepository;

    /**
     * Get all complaints in citizen's ward for map display
     */
    public List<ComplaintMapDTO> getWardComplaintsForMap(String email) {
        Citizen citizen = citizenRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Citizen not found"));
        
        List<ComplaintReport> complaints = complaintRepository
            .findByWardId(citizen.getWard().getWardId());
        
        return complaints.stream()
            .filter(c -> c.getLatitude() != null && c.getLongitude() != null)
            .map(this::toComplaintMapDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get all complaints submitted by citizen
     */
    public List<ComplaintDTO> getMyComplaints(String email) {
        Citizen citizen = citizenRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Citizen not found"));
        
        List<ComplaintReport> complaints = complaintRepository
            .findByCitizenId(citizen.getCitizenId());
        
        return complaints.stream()
            .map(this::toComplaintDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get ward officer for citizen's ward
     */
    public WardOfficerDTO getWardOfficerForCitizen(String email) {
        Citizen citizen = citizenRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Citizen not found"));
        
        WardOfficer officer = wardOfficerRepository
            .findByWardId(citizen.getWard().getWardId())
            .orElse(null);
        
        return officer != null ? toWardOfficerDTO(officer) : null;
    }

    /**
     * Get all department officers for citizen's ward
     */
    public List<DepartmentOfficerDTO> getDepartmentOfficersForWard(String email) {
        Citizen citizen = citizenRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Citizen not found"));
        
        List<DepartmentOfficer> officers = departmentOfficerRepository
            .findByWardId(citizen.getWard().getWardId());
        
        return officers.stream()
            .map(this::toDepartmentOfficerDTO)
            .collect(Collectors.toList());
    }

    // DTOs mapping methods
    private ComplaintMapDTO toComplaintMapDTO(ComplaintReport complaint) {
        return ComplaintMapDTO.builder()
            .complaintId(complaint.getComplaintId())
            .title(complaint.getTitle())
            .status(complaint.getStatus())
            .latitude(complaint.getLatitude())
            .longitude(complaint.getLongitude())
            .category(complaint.getCategory())
            .priority(complaint.getPriority())
            .createdAt(complaint.getCreatedAt())
            .build();
    }

    private ComplaintDTO toComplaintDTO(ComplaintReport complaint) {
        return ComplaintDTO.builder()
            .complaintId(complaint.getComplaintId())
            .title(complaint.getTitle())
            .description(complaint.getDescription())
            .status(complaint.getStatus())
            .category(complaint.getCategory())
            .priority(complaint.getPriority())
            .latitude(complaint.getLatitude())
            .longitude(complaint.getLongitude())
            .address(complaint.getAddress())
            .createdAt(complaint.getCreatedAt())
            .updatedAt(complaint.getUpdatedAt())
            .wardId(complaint.getWard().getWardId())
            .wardName(complaint.getWard().getWardName())
            .departmentId(complaint.getDepartment() != null ? complaint.getDepartment().getDepartmentId() : null)
            .departmentName(complaint.getDepartment() != null ? complaint.getDepartment().getDepartmentName() : null)
            .assignedOfficer(complaint.getAssignedOfficer())
            .build();
    }

    private WardOfficerDTO toWardOfficerDTO(WardOfficer officer) {
        return WardOfficerDTO.builder()
            .officerId(officer.getOfficerId())
            .name(officer.getName())
            .email(officer.getEmail())
            .phone(officer.getPhone())
            .wardId(officer.getWard().getWardId())
            .wardName(officer.getWard().getWardName())
            .build();
    }

    private DepartmentOfficerDTO toDepartmentOfficerDTO(DepartmentOfficer officer) {
        return DepartmentOfficerDTO.builder()
            .officerId(officer.getOfficerId())
            .name(officer.getName())
            .email(officer.getEmail())
            .phone(officer.getPhone())
            .departmentId(officer.getDepartment().getDepartmentId())
            .departmentName(officer.getDepartment().getDepartmentName())
            .wardId(officer.getWard() != null ? officer.getWard().getWardId() : null)
            .wardName(officer.getWard() != null ? officer.getWard().getWardName() : null)
            .build();
    }
}
```

---

## 📦 Required DTOs

### ComplaintMapDTO.java
```java
@Data
@Builder
public class ComplaintMapDTO {
    private Long complaintId;
    private String title;
    private String status;
    private Double latitude;
    private Double longitude;
    private String category;
    private String priority;
    private LocalDateTime createdAt;
}
```

### WardOfficerDTO.java
```java
@Data
@Builder
public class WardOfficerDTO {
    private Long officerId;
    private String name;
    private String email;
    private String phone;
    private Long wardId;
    private String wardName;
}
```

### DepartmentOfficerDTO.java
```java
@Data
@Builder
public class DepartmentOfficerDTO {
    private Long officerId;
    private String name;
    private String email;
    private String phone;
    private Long departmentId;
    private String departmentName;
    private Long wardId;
    private String wardName;
}
```

---

## 🔍 Testing Checklist

### Test with Postman:

1. **Login as Citizen**
```
POST http://localhost:8083/api/auth/login
Body: { "email": "citizen@example.com", "password": "password" }
Response: { "token": "..." }
```

2. **Test Notifications Endpoint**
```
GET http://localhost:8083/api/notifications
Headers: Authorization: Bearer <token>
Expected: 200 OK with notifications array
```

3. **Test My Complaints**
```
GET http://localhost:8083/api/citizen/my-complaints
Headers: Authorization: Bearer <token>
Expected: 200 OK with complaints array
```

4. **Test Ward Map**
```
GET http://localhost:8083/api/citizen/map/ward
Headers: Authorization: Bearer <token>
Expected: 200 OK with ward complaints with coordinates
```

5. **Test Ward Officer**
```
GET http://localhost:8083/api/citizen/officers/ward-officer
Headers: Authorization: Bearer <token>
Expected: 200 OK with ward officer details
```

6. **Test Department Officers**
```
GET http://localhost:8083/api/citizen/officers/department-officers
Headers: Authorization: Bearer <token>
Expected: 200 OK with department officers array
```

7. **Test Profile**
```
GET http://localhost:8083/api/profile
Headers: Authorization: Bearer <token>
Expected: 200 OK with user profile
```

---

## 🚀 Quick Fix Steps

1. **Update SecurityConfig.java**
   - Add `.requestMatchers("/api/citizen/**").hasRole("CITIZEN")`
   - Add `.requestMatchers("/api/notifications").authenticated()`
   - Add `.requestMatchers("/api/profile").authenticated()`

2. **Create/Update CitizenService.java**
   - Implement all the methods listed above

3. **Create Controllers** (if not exist)
   - `CitizenMapController.java` for `/api/citizen/map/ward`
   - `CitizenOfficerController.java` for officer endpoints
   - `NotificationController.java` for `/api/notifications`
   - `ProfileController.java` for `/api/profile`

4. **Create DTOs**
   - `ComplaintMapDTO.java`
   - `WardOfficerDTO.java`
   - `DepartmentOfficerDTO.java`

5. **Restart Spring Boot Application**

6. **Test All Endpoints**

---

## 📊 Expected Frontend Behavior After Fix

### SLA Status Page
- ✅ Loads all citizen's complaints
- ✅ Shows SLA countdown for each complaint
- ✅ Displays status badges
- ✅ Shows ward name

### Ward Map Page
- ✅ Loads all complaints in citizen's ward
- ✅ Displays markers on map
- ✅ Shows complaint details on marker click
- ✅ Filters by status/category

### Officer Directory
- ✅ Shows ward officer details (name, phone, email)
- ✅ Shows all department officers for the ward
- ✅ Contact buttons working

### Profile Page
- ✅ Loads user profile data
- ✅ Shows citizen details
- ✅ Allows profile editing

### Notifications
- ✅ Bell icon shows unread count
- ✅ Dropdown shows notification list
- ✅ Mark as read functionality works

---

## ⚠️ Important Notes

1. **Role Names:** Ensure JWT token contains role with "ROLE_" prefix
   - Token should have: `ROLE_CITIZEN`, not just `CITIZEN`
   - Spring Security automatically adds "ROLE_" but check your JWT implementation

2. **Authentication:** All endpoints require valid JWT token in `Authorization: Bearer <token>` header

3. **CORS:** Ensure CORS is configured to allow requests from `http://localhost:5173`

4. **Database:** Ensure:
   - Citizens have `wardId` set
   - Complaints have `latitude` and `longitude` for map
   - Ward officers and department officers exist in database

---

## 🎯 Success Criteria

After implementing these fixes, you should see:

- ✅ **No more 403 errors** in browser console
- ✅ **SLA Status page** shows all complaints with countdown
- ✅ **Ward Map page** shows all complaintsfor citizen's ward
- ✅ **Officer Directory** shows ward officer and department officers
- ✅ **Profile page** loads successfully
- ✅ **Notifications** work properly
- ✅ **All data loads** without errors

---

## 🔗 Related Conversation

This issue was discussed in conversation: **f4bb913a-fda7-429f-a436-74f589c5a9e2 - Fixing 403 Complaint Error**

The solution there was similar - you need to update Spring Security configuration to allow CITIZEN role access.

---

**Once the backend is fixed, all the frontend pages will work perfectly with no 403 errors!** 🎉
