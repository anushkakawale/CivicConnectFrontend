# 🔧 Citizen Profile - Ward & Address Not Showing

## ❌ Current Issues:

Your citizen profile is showing:
- ❌ **Ward:** "Not Assigned"
- ❌ **Address:** "Address not added"

This means the backend `/api/profile` and `/api/profile/citizen` endpoints are NOT returning `wardId`, `wardName`, or `address` fields for the logged-in citizen.

---

## 🔍 Root Cause Analysis

### Frontend Expectations (ProfilePage.jsx):

The profile page fetches data from TWO endpoints:

1. **Primary Profile:** `GET /api/profile`
   ```javascript
   response = await apiService.profile.getProfile();
   ```

2. **Citizen-Specific:** `GET /api/profile/citizen` (for CITIZEN role only)
   ```javascript
   const citRes = await apiService.profile.getCitizenProfile();
   ```

### What Frontend Expects in Response:

```json
{
  "name": "Anushka",
  "email": "anushka@gmail.com",
  "mobile": "7890909090",
  "role": "ROLE_CITIZEN",
  
  // ❌ MISSING - That's why ward shows "Not Assigned"
  "wardId": 1,
  "wardName": "Kasba Peth",
  
  // ❌ MISSING - That's why address shows "Address not added"
  "address": "123 Main Street, Kasba Peth",
  "addressLine1": "123 Main Street",
  "addressLine2": "Near Bus Stop",
  "city": "Pune",
  "pincode": "411011"
}
```

---

## 🎯 Backend Fixes Required

### Fix 1: Update `UserProfileDTO.java`

**Location:** `src/main/java/com/civicconnect/dto/UserProfileDTO.java`

**Add these fields:**
```java
@Data
@Builder
public class UserProfileDTO {
    private Long userId;
    private String name;
    private String email;
    private String mobile;
    private String role;
    private LocalDateTime createdAt;
    
    // ✅ ADD THESE FOR CITIZEN
    private Long wardId;
    private String wardName;
    private String wardNumber;
    
    // ✅ ADD THESE FOR ADDRESS
    private String address;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String pincode;
    
    // For officers
    private Long departmentId;
    private String departmentName;
}
```

---

### Fix 2: Update Profile Controller

**Location:** `src/main/java/com/civicconnect/controller/ProfileController.java`

**Current (Probably):**
```java
@GetMapping("/profile")
public ResponseEntity<?> getProfile(Authentication auth) {
    String email = auth.getName();
    User user = userRepository.findByEmail(email);
    
    UserProfileDTO dto = UserProfileDTO.builder()
        .userId(user.getUserId())
        .name(user.getName())
        .email(user.getEmail())
        .mobile(user.getMobile())
        .role(user.getRole().name())
        .createdAt(user.getCreatedAt())
        .build();
    
    return ResponseEntity.ok(dto);
}
```

**Fixed (Complete):**
```java
@GetMapping("/profile")
public ResponseEntity<?> getProfile(Authentication auth) {
    String email = auth.getName();
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    
    UserProfileDTO.UserProfileDTOBuilder dtoBuilder = UserProfileDTO.builder()
        .userId(user.getUserId())
        .name(user.getName())
        .email(user.getEmail())
        .mobile(user.getMobile())
        .role(user.getRole().name())
        .createdAt(user.getCreatedAt());
    
    // ✅ FOR CITIZEN - Add Ward and Address
    if (user.getRole() == Role.ROLE_CITIZEN) {
        Citizen citizen = citizenRepository.findByUserId(user.getUserId())
            .orElse(null);
        
        if (citizen != null) {
            // Ward Information
            if (citizen.getWard() != null) {
                dtoBuilder.wardId(citizen.getWard().getWardId());
                dtoBuilder.wardName(citizen.getWard().getWardName());
                dtoBuilder.wardNumber(citizen.getWard().getWardNumber());
            }
            
            // Address Information
            if (citizen.getAddress() != null) {
                Address address = citizen.getAddress();
                dtoBuilder.address(address.getFullAddress());
                dtoBuilder.addressLine1(address.getAddressLine1());
                dtoBuilder.addressLine2(address.getAddressLine2());
                dtoBuilder.city(address.getCity());
                dtoBuilder.pincode(address.getPincode());
            }
        }
    }
    
    // ✅ FOR WARD OFFICER - Add Ward
    else if (user.getRole() == Role.ROLE_WARD_OFFICER) {
        WardOfficer officer = wardOfficerRepository.findByUserId(user.getUserId())
            .orElse(null);
        
        if (officer != null && officer.getWard() != null) {
            dtoBuilder.wardId(officer.getWard().getWardId());
            dtoBuilder.wardName(officer.getWard().getWardName());
            dtoBuilder.wardNumber(officer.getWard().getWardNumber());
        }
    }
    
    // ✅ FOR DEPARTMENT OFFICER - Add Ward and Department
    else if (user.getRole() == Role.ROLE_DEPARTMENT_OFFICER) {
        DepartmentOfficer officer = departmentOfficerRepository.findByUserId(user.getUserId())
            .orElse(null);
        
        if (officer != null) {
            if (officer.getDepartment() != null) {
                dtoBuilder.departmentId(officer.getDepartment().getDepartmentId());
                dtoBuilder.departmentName(officer.getDepartment().getDepartmentName());
            }
            if (officer.getWard() != null) {
                dtoBuilder.wardId(officer.getWard().getWardId());
                dtoBuilder.wardName(officer.getWard().getWardName());
                dtoBuilder.wardNumber(officer.getWard().getWardNumber());
            }
        }
    }
    
    return ResponseEntity.ok(dtoBuilder.build());
}
```

---

### Fix 3: Citizen Entity - Ensure Proper Relationships

**Location:** `src/main/java/com/civicconnect/entity/Citizen.java`

**Verify these relationships exist:**
```java
@Entity
@Table(name = "citizens")
public class Citizen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long citizenId;
    
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    // ✅ VERIFY: Ward relationship exists
    @ManyToOne(fetch = FetchType.EAGER)  // ← Important: EAGER fetch
    @JoinColumn(name = "ward_id")
    private Ward ward;
    
    // ✅ VERIFY: Address relationship exists
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)  // ← Important: EAGER fetch
    @JoinColumn(name = "address_id")
    private Address address;
    
    // Getters and Setters
}
```

---

### Fix 4: Address Entity

**Location:** `src/main/java/com/civicconnect/entity/Address.java`

**Verify this entity exists:**
```java
@Entity
@Table(name = "addresses")
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long addressId;
    
    @Column(name = "address_line_1")
    private String addressLine1;
    
    @Column(name = "address_line_2")
    private String addressLine2;
    
    private String city;
    
    private String pincode;
    
    @Column(name = "full_address", length = 500)
    private String fullAddress;
    
    // Getters and Setters
}
```

---

## 🧪 Testing Guide

### Step 1: Test Profile Endpoint in Postman

**Request:**
```http
GET http://localhost:8083/api/profile
Headers:
  Authorization: Bearer <your_citizen_token>
```

**Expected Response:**
```json
{
  "userId": 123,
  "name": "Anushka",
  "email": "anushka@gmail.com",
  "mobile": "7890909090",
  "role": "ROLE_CITIZEN",
  "createdAt": "2026-02-01T10:00:00",
  
  // ✅ THESE MUST BE PRESENT:
  "wardId": 1,
  "wardName": "Kasba Peth",
  "wardNumber": "1",
  
  // ✅ THESE MUST BE PRESENT:
  "address": "123 Main Street, Near Bus Stop, Pune - 411011",
  "addressLine1": "123 Main Street",
  "addressLine2": "Near Bus Stop",
  "city": "Pune",
  "pincode": "411011"
}
```

**If wardName is null:**
- Check if the citizen record has `ward_id` set in the database
- Verify the Ward entity relationship is properly loaded (EAGER fetch)

**If address is null:**
- Check if the citizen record has `address_id` set in the database
- Verify the Address entity relationship is properly loaded (EAGER fetch)

---

### Step 2: Check Database

**Query 1: Check if citizen has ward assigned**
```sql
SELECT c.citizen_id, c.user_id, c.ward_id, w.ward_name, w.ward_number
FROM citizens c
LEFT JOIN wards w ON c.ward_id = w.ward_id
INNER JOIN users u ON c.user_id = u.user_id
WHERE u.email = 'anushka@gmail.com';
```

**Expected Result:**
```
citizen_id | user_id | ward_id | ward_name   | ward_number
-----------+---------+---------+-------------+-------------
5          | 10      | 1       | Kasba Peth  | 1
```

**If ward_id is NULL:**
- You need to update the citizen record to assign a ward
- Run: `UPDATE citizens SET ward_id = 1 WHERE citizen_id = 5;`

---

**Query 2: Check if citizen has address assigned**
```sql
SELECT c.citizen_id, c.address_id, a.address_line_1, a.city, a.pincode
FROM citizens c
LEFT JOIN addresses a ON c.address_id = a.address_id
INNER JOIN users u ON c.user_id = u.user_id
WHERE u.email = 'anushka@gmail.com';
```

**Expected Result:**
```
citizen_id | address_id | address_line_1  | city | pincode
-----------+------------+-----------------+------+---------
5          | 20         | 123 Main Street | Pune | 411011
```

**If address_id is NULL:**
- You need to create an address and link it to the citizen
- See "Fix 5" below for SQL commands

---

## 🔧 Fix 5: Manually Assign Ward & Address (If Database is Empty)

### Scenario: Citizen registered but doesn't have ward/address

**Step 1: Find your citizen ID**
```sql
SELECT c.citizen_id, c.user_id, u.email
FROM citizens c
INNER JOIN users u ON c.user_id = u.user_id
WHERE u.email = 'anushka@gmail.com';

-- Result: citizen_id = 5, user_id = 10
```

**Step 2: Assign a ward**
```sql
-- Option 1: Update existing citizen record
UPDATE citizens 
SET ward_id = 1 
WHERE citizen_id = 5;

-- Verify
SELECT c.*, w.ward_name 
FROM citizens c
LEFT JOIN wards w ON c.ward_id = w.ward_id
WHERE c.citizen_id = 5;
```

**Step 3: Create and assign address**
```sql
-- Create address
INSERT INTO addresses (address_line_1, address_line_2, city, pincode, full_address)
VALUES (
    '123 Main Street',
    'Near Bus Stop',
    'Pune',
    '411011',
    '123 Main Street, Near Bus Stop, Pune - 411011'
);

-- Get the newly created address ID
SELECT LAST_INSERT_ID();  -- Let's say it returns 20

-- Link address to citizen
UPDATE citizens
SET address_id = 20
WHERE citizen_id = 5;

-- Verify
SELECT c.*, a.full_address
FROM citizens c
LEFT JOIN addresses a ON c.address_id = a.address_id
WHERE c.citizen_id = 5;
```

---

## 🎯 Frontend Testing

Once backend is fixed:

### Step 1: Clear Browser Cache
```
1. Open Browser Console (F12)
2. Right-click refresh button → "Empty Cache and Hard Reload"
3. Or: Ctrl+Shift+Delete → Clear cache
```

### Step 2: Check Console Logs
```
1. Open /citizen/profile page
2. Check console (F12)
3. Look for the API response
```

**Expected Console Output:**
```javascript
// GET /api/profile response:
{
  "wardId": 1,
  "wardName": "Kasba Peth",  // ✅ Not null
  "address": "123 Main Street, Near Bus Stop, Pune - 411011",  // ✅ Not null
  "addressLine1": "123 Main Street",
  "city": "Pune",
  ...
}
```

### Step 3: Verify UI Display
```
Profile Page Should Show:
├── Ward: "Kasba Peth" ✅ (not "Not Assigned")
├── Address: "123 Main Street..." ✅ (not "Address not added")
└──city: "Pune, 411011" ✅
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Ward still showing "Not Assigned" after backend fix

**Cause:** Frontend caching or token has old data

**Solution:**
```bash
1. Logout
2. Clear browser local storage:
   - Open Console (F12)
   - Run: localStorage.clear()
3. Login again
4. Navigate to profile
```

---

### Issue 2: Address Still Shows "Address not added"

**Cause:** Address entity is not linked to citizen in database

**Check Database:**
```sql
SELECT c.address_id, a.full_address
FROM citizens c
LEFT JOIN addresses a ON c.address_id = a.address_id
WHERE c.citizen_id = 5;
```

**If address_id is NULL:**
- Create address (see Fix 5, Step 3)
- Link to citizen

**If address exists but fullAddress is null:**
```sql
UPDATE addresses
SET full_address = CONCAT(address_line_1, ', ', address_line_2, ', ', city, ' - ', pincode)
WHERE address_id = 20;
```

---

### Issue 3: Ward Name Shows Number Instead of Name

**Cause:** Ward entity doesn't have `wardName`, only `wardNumber`

**Check:**
```sql
SELECT * FROM wards WHERE ward_id = 1;
```

**Fix:**
```sql
UPDATE wards 
SET ward_name = 'Kasba Peth', 
    area_name = 'Kasba Peth'
WHERE ward_id = 1;
```

---

## 📊 Data Flow Diagram

```
┌──────────────────┐
│   Frontend       │
│   ProfilePage    │
└────────┬─────────┘
         │
         │ GET /api/profile
         ↓
┌──────────────────┐
│  ProfileController│
│  getProfile()    │
└────────┬─────────┘
         │
         ├─→ userRepository.findByEmail()
         │   └─→ Get User entity
         │
         ├─→ citizenRepository.findByUserId()
         │   └─→ Get Citizen entity
         │
         ├─→ citizen.getWard()
         │   └─→ Ward entity (EAGER fetch)
         │       └─→ wardName ✅
         │
         └─→ citizen.getAddress()
             └─→ Address entity (EAGER fetch)
                 └─→ fullAddress ✅
                 └─→ addressLine1, city, pincode ✅
                 │
                 ↓
         ┌──────────────────┐
         │ UserProfileDTO   │
         │  - wardName ✅    │
         │  - address ✅     │
         └──────┬───────────┘
                │
                ↓ JSON Response
         ┌──────────────────┐
         │   Frontend       │
         │   Displays       │
         │   Ward & Address │
         └──────────────────┘
```

---

## ✅ Quick Checklist

### Backend Tasks:
- [ ] Add `wardId`, `wardName` fields to `UserProfileDTO`
- [ ] Add `address`, `addressLine1`, `city`, `pincode` to `UserProfileDTO`
- [ ] Update `ProfileController.getProfile()` to populate these fields
- [ ] Verify `Citizen` entity has `@ManyToOne` relationship with `Ward`
- [ ] Verify `Citizen` entity has `@OneToOne` relationship with `Address`
- [ ] Set fetch type to `EAGER` for both relationships
- [ ] Test endpoint in Postman
- [ ] Verify ward_id is not null in database
- [ ] Verify address_id is not null in database
- [ ] Restart Spring Boot application

### Database Tasks:
- [ ] Check if citizen has ward_id assigned
- [ ] Check if citizen has address_id assigned
- [ ] If missing, manually assign ward_id
- [ ] If missing, create address and assign address_id
- [ ] Verify ward has proper ward_name value
- [ ] Verify address has proper full_address value

### Frontend Tasks:
- [ ] Clear browser cache
- [ ] Logout and login again
- [ ] Navigate to profile page
- [ ] Check console for API response data
- [ ] Verify Ward displays ward name (not "Not Assigned")
- [ ] Verify Address displays full address (not "Address not added")

---

## 🎯 Expected Final State

```
Profile Page:
├── Name: Anushka ✅
├── Email: anushka@gmail.com ✅
├── Phone: 7890909090 ✅
├── Ward: Kasba Peth ✅ (not "Not Assigned")
├── Address: 123 Main Street, Near Bus Stop ✅ (not "Address not added")
└── City: Pune, 411011 ✅

Profile Completion Score: 90% ✅
```

---

**Once you fix the backend to return wardName and address in the /api/profile response, the frontend will automatically display them!** 🎉
