# 🔧 CivicConnect - 403 Forbidden Error Troubleshooting Guide

## ❌ Current Issue
**Error:** `403 Forbidden` when submitting a complaint  
**Endpoint:** `POST /citizens/complaints`  
**URL:** `http://localhost:8083/api/citizens/complaints`

---

## 🔍 Root Cause Analysis

The **403 Forbidden** error indicates that:
1. ✅ The user is **authenticated** (token is valid)
2. ❌ The user **lacks permission** to access this specific endpoint
3. 🔐 The backend **Spring Security** configuration is blocking the request

---

## 🛠️ Backend Fixes Required

### 1. **Check Spring Security Configuration**

The backend needs to allow `CITIZEN` role to access `/citizens/complaints` endpoint.

**File:** `SecurityConfig.java` or similar

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**", "/api/citizens/register", "/api/wards", "/api/departments").permitAll()
                
                // Citizen endpoints - MUST ALLOW CITIZEN ROLE
                .requestMatchers(HttpMethod.POST, "/api/citizens/complaints").hasRole("CITIZEN")
                .requestMatchers(HttpMethod.GET, "/api/citizens/complaints/**").hasRole("CITIZEN")
                .requestMatchers("/api/citizens/**").hasRole("CITIZEN")
                
                // Ward Officer endpoints
                .requestMatchers("/api/ward-officer/**").hasRole("WARD_OFFICER")
                
                // Department Officer endpoints
                .requestMatchers("/api/department/**").hasRole("DEPARTMENT_OFFICER")
                
                // Admin endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // All other requests require authentication
                .anyRequest().authenticated()
            )
            .csrf(csrf -> csrf.disable()) // Disable CSRF for API
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

### 2. **Verify JWT Token Contains Correct Role**

**File:** `JwtAuthenticationFilter.java` or `JwtTokenProvider.java`

Ensure the JWT token includes the role with the `ROLE_` prefix:

```java
public String generateToken(Authentication authentication) {
    UserDetails userDetails = (UserDetails) authentication.getPrincipal();
    
    // Extract role and ensure it has ROLE_ prefix
    String role = userDetails.getAuthorities().stream()
        .findFirst()
        .map(GrantedAuthority::getAuthority)
        .orElse("ROLE_CITIZEN");
    
    // If role doesn't have ROLE_ prefix, add it
    if (!role.startsWith("ROLE_")) {
        role = "ROLE_" + role;
    }
    
    return Jwts.builder()
        .setSubject(userDetails.getUsername())
        .claim("role", role)  // Include role in token
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
        .signWith(SignatureAlgorithm.HS512, jwtSecret)
        .compact();
}
```

### 3. **Check Controller Annotations**

**File:** `CitizenComplaintController.java`

```java
@RestController
@RequestMapping("/api/citizens")
@PreAuthorize("hasRole('CITIZEN')") // Class-level authorization
public class CitizenComplaintController {
    
    @PostMapping("/complaints")
    @PreAuthorize("hasRole('CITIZEN')") // Method-level authorization
    public ResponseEntity<?> createComplaint(
        @Valid @ModelAttribute ComplaintRequest request,
        @RequestParam(value = "images", required = false) MultipartFile[] images,
        Authentication authentication
    ) {
        // Implementation
        return ResponseEntity.ok(complaintService.createComplaint(request, images, authentication));
    }
}
```

### 4. **Verify User Role in Database**

Check that the citizen user has the correct role:

```sql
-- Check user role
SELECT u.user_id, u.email, u.role, c.name 
FROM users u 
LEFT JOIN citizens c ON u.user_id = c.user_id 
WHERE u.email = 'citizen@example.com';

-- Expected output:
-- role should be 'CITIZEN' or 'ROLE_CITIZEN'
```

If the role is incorrect, update it:

```sql
UPDATE users SET role = 'CITIZEN' WHERE email = 'citizen@example.com';
```

---

## 🔐 Frontend Improvements (Already Implemented)

### 1. **Enhanced Error Handling**

The frontend now provides clear, actionable error messages:

```javascript
// In RegisterComplaint.jsx
catch (err) {
    if (err.response?.status === 403 || err.status === 403) {
        setError("🔒 Access Denied: You don't have permission to submit complaints. Please log out and log back in, or contact support if the issue persists.");
    } else if (err.response?.status === 401 || err.status === 401) {
        setError("🔑 Session Expired: Please log in again to submit your complaint.");
        setTimeout(() => {
            localStorage.clear();
            navigate('/');
        }, 2000);
    } else {
        setError(err.response?.data?.message || err.message || "❌ Something went wrong. Please try again or contact support.");
    }
}
```

### 2. **Proper Redirect After Success**

```javascript
// Redirect to /citizen/complaints after successful submission
setSuccess("✅ Report submitted successfully! Redirecting to your complaints...");
setTimeout(() => {
    navigate('/citizen/complaints');
}, 2000);
```

### 3. **Updated Color Scheme**

All colors updated to `#244799` for consistency:
- Primary buttons
- Icons and badges
- Progress indicators
- Accent colors

---

## 🧪 Testing Steps

### 1. **Test Backend Endpoint Directly**

Use Postman or curl to test the endpoint:

```bash
# Get the token from localStorage after login
TOKEN="your_jwt_token_here"

# Test complaint submission
curl -X POST http://localhost:8083/api/citizens/complaints \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "title=Test Complaint" \
  -F "description=This is a test complaint description with more than 20 characters" \
  -F "departmentId=1" \
  -F "wardId=1" \
  -F "address=Test Address" \
  -F "latitude=18.5204" \
  -F "longitude=73.8567"
```

**Expected Response:**
- ✅ **200 OK** or **201 Created** - Success
- ❌ **403 Forbidden** - Backend authorization issue
- ❌ **401 Unauthorized** - Token issue

### 2. **Verify Token in Browser**

Open browser console and check:

```javascript
// Check if token exists
console.log('Token:', localStorage.getItem('token'));

// Check role
console.log('Role:', localStorage.getItem('role'));

// Decode JWT token (use jwt.io or a decoder)
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token Payload:', payload);
```

**Expected Payload:**
```json
{
  "sub": "citizen@example.com",
  "role": "ROLE_CITIZEN",
  "iat": 1707552000,
  "exp": 1707638400
}
```

### 3. **Test Login Flow**

1. **Clear Storage:**
   ```javascript
   localStorage.clear();
   ```

2. **Login Again:**
   - Navigate to `/`
   - Login with citizen credentials
   - Check if token and role are stored

3. **Try Submitting Complaint:**
   - Navigate to `/citizen/register-complaint`
   - Fill out the form
   - Submit

---

## 📋 Quick Checklist

### Backend
- [ ] SecurityConfig allows `ROLE_CITIZEN` for `/api/citizens/complaints`
- [ ] JWT token includes `role` claim with `ROLE_` prefix
- [ ] Controller has correct `@PreAuthorize` annotations
- [ ] User role in database is `CITIZEN` or `ROLE_CITIZEN`
- [ ] CORS is configured to allow frontend origin
- [ ] CSRF is disabled for API endpoints

### Frontend
- [ ] Token is stored in localStorage after login
- [ ] Token is sent in Authorization header
- [ ] Error handling provides clear messages
- [ ] Redirect to `/citizen/complaints` works after success
- [ ] UI uses consistent color scheme (#244799)

---

## 🎯 Most Likely Solutions

### Solution 1: Update SecurityConfig (Most Common)

Add this to your SecurityConfig:

```java
.requestMatchers(HttpMethod.POST, "/api/citizens/complaints").hasRole("CITIZEN")
```

### Solution 2: Fix JWT Role Claim

Ensure JWT includes role:

```java
.claim("role", "ROLE_" + user.getRole())
```

### Solution 3: Update User Role in Database

```sql
UPDATE users SET role = 'CITIZEN' WHERE user_id = <your_user_id>;
```

---

## 🔍 Debugging Commands

### Check Backend Logs

Look for these patterns in backend logs:

```
Access Denied
403 Forbidden
PreAuthorize
hasRole
ROLE_CITIZEN
```

### Enable Debug Logging

Add to `application.properties`:

```properties
logging.level.org.springframework.security=DEBUG
logging.level.org.springframework.web=DEBUG
```

### Check Network Tab

In browser DevTools → Network:
1. Find the `POST /citizens/complaints` request
2. Check **Request Headers** → `Authorization: Bearer ...`
3. Check **Response** → Status code and body

---

## 📞 Support

If the issue persists after trying these solutions:

1. **Check Backend Logs** for detailed error messages
2. **Verify Database** user role is correct
3. **Test with Postman** to isolate frontend vs backend issue
4. **Contact Backend Team** with:
   - Error logs
   - JWT token payload
   - User role from database
   - SecurityConfig settings

---

## ✅ Success Indicators

You'll know it's fixed when:

1. ✅ Complaint submission returns **200 OK** or **201 Created**
2. ✅ Success message appears: "✅ Report submitted successfully!"
3. ✅ Redirect to `/citizen/complaints` happens automatically
4. ✅ New complaint appears in the complaints list

---

**Last Updated:** February 10, 2026  
**Version:** 1.0  
**Status:** Awaiting Backend Fix
