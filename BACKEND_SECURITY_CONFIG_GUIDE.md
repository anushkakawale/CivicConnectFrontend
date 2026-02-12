# 🔧 Backend Security Configuration Guide

## 🚨 CRITICAL: Fix 403 Forbidden Error for Citizen Complaints

This guide will help you verify and fix the Spring Security configuration in your backend to allow citizens to submit complaints.

---

## 📋 Quick Checklist

### **Before You Start:**
- [ ] Backend is running
- [ ] You have access to the backend source code
- [ ] You can restart the backend server

---

## 🔍 Step 1: Locate SecurityConfig.java

The file is typically located at:
```
src/main/java/com/yourpackage/config/SecurityConfig.java
```

Or search for files containing `@EnableWebSecurity` annotation.

---

## ✅ Step 2: Verify Security Configuration

### **Required Configuration for Citizen Complaints:**

Your `SecurityConfig.java` should have the following configuration:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                // ========================================
                // PUBLIC ENDPOINTS (No authentication)
                // ========================================
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/citizens/register").permitAll()
                .requestMatchers("/api/wards").permitAll()
                .requestMatchers("/api/departments").permitAll()
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("/api/diagnostics/**").permitAll()
                
                // ========================================
                // CITIZEN ENDPOINTS (ROLE_CITIZEN required)
                // ========================================
                .requestMatchers(HttpMethod.POST, "/api/citizens/complaints").hasRole("CITIZEN")
                .requestMatchers(HttpMethod.GET, "/api/citizens/complaints").hasRole("CITIZEN")
                .requestMatchers(HttpMethod.GET, "/api/citizens/complaints/**").hasRole("CITIZEN")
                .requestMatchers("/api/citizens/**").hasRole("CITIZEN")
                .requestMatchers("/api/citizen/**").hasRole("CITIZEN")
                
                // ========================================
                // WARD OFFICER ENDPOINTS
                // ========================================
                .requestMatchers("/api/ward-officer/**").hasRole("WARD_OFFICER")
                
                // ========================================
                // DEPARTMENT OFFICER ENDPOINTS
                // ========================================
                .requestMatchers("/api/department-officer/**").hasRole("DEPARTMENT_OFFICER")
                
                // ========================================
                // ADMIN ENDPOINTS
                // ========================================
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // ========================================
                // COMMON AUTHENTICATED ENDPOINTS
                // ========================================
                .requestMatchers("/api/profile/**").authenticated()
                .requestMatchers("/api/notifications/**").authenticated()
                .requestMatchers("/api/complaints/*/images").authenticated()
                
                // All other requests require authentication
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

---

## 🚨 Common Mistakes to Avoid

### ❌ **WRONG - Too Permissive:**
```java
.requestMatchers("/api/citizens/complaints").authenticated()  // BAD!
```
**Problem:** Any authenticated user can access, including ADMIN, WARD_OFFICER, etc.

### ❌ **WRONG - Wrong Role Name:**
```java
.requestMatchers("/api/citizens/complaints").hasRole("USER")  // BAD!
```
**Problem:** Role should be "CITIZEN", not "USER"

### ❌ **WRONG - Missing ROLE_ Prefix:**
```java
.requestMatchers("/api/citizens/complaints").hasAuthority("CITIZEN")  // BAD!
```
**Problem:** Use `.hasRole("CITIZEN")` which automatically adds "ROLE_" prefix

### ✅ **CORRECT:**
```java
.requestMatchers(HttpMethod.POST, "/api/citizens/complaints").hasRole("CITIZEN")
```

---

## 🔑 Step 3: Verify JWT Token Generation

### **Check JwtTokenProvider.java or JwtService.java:**

Your token generation should include the role with "ROLE_" prefix:

```java
public String generateToken(UserDetails userDetails) {
    Map<String, Object> claims = new HashMap<>();
    
    // Get role from authorities
    String role = userDetails.getAuthorities().stream()
        .findFirst()
        .map(GrantedAuthority::getAuthority)
        .orElse("ROLE_CITIZEN");
    
    // Add role to claims (with ROLE_ prefix)
    claims.put("role", role);
    
    // Also add authorities array
    List<String> authorities = userDetails.getAuthorities().stream()
        .map(GrantedAuthority::getAuthority)
        .collect(Collectors.toList());
    claims.put("authorities", authorities);
    
    return Jwts.builder()
        .setClaims(claims)
        .setSubject(userDetails.getUsername())
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
        .signWith(getSigningKey(), SignatureAlgorithm.HS256)
        .compact();
}
```

### **Verify User Entity:**

```java
@Entity
@Table(name = "users")
public class User implements UserDetails {
    
    @Enumerated(EnumType.STRING)
    private UserRole role;  // Should be CITIZEN, ADMIN, WARD_OFFICER, DEPARTMENT_OFFICER
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_" + role.name())
        );
    }
}
```

**Key Points:**
- Role enum should have values: `CITIZEN`, `ADMIN`, `WARD_OFFICER`, `DEPARTMENT_OFFICER`
- `getAuthorities()` should return `"ROLE_CITIZEN"` for citizens
- JWT token should contain this role in claims

---

## 🔄 Step 4: Restart Backend

**CRITICAL:** After making any changes to SecurityConfig, you MUST restart the backend:

### **Option 1: Maven**
```bash
# Stop current server (Ctrl+C)
./mvnw spring-boot:run
```

### **Option 2: Gradle**
```bash
# Stop current server (Ctrl+C)
./gradlew bootRun
```

### **Option 3: IDE**
1. Click **Stop** button (red square)
2. Wait 5 seconds
3. Click **Run** button (green play)

### **Verify Restart:**
Look for this in console:
```
Started CivicConnectApplication in X.XXX seconds (JVM running for X.XXX)
```

---

## 🧪 Step 5: Test the Fix

### **A. Clear Frontend Session**
1. Log out from frontend
2. Clear browser cache: `Ctrl+Shift+Delete`
3. Close all browser tabs
4. Open new tab: `http://localhost:5173`

### **B. Use Security Diagnostic Tool**
1. Navigate to: `http://localhost:5173/security-diagnostic`
2. Click **"Run Diagnostics"**
3. Check for:
   - ✅ Token is valid
   - ✅ Has CITIZEN role
   - ✅ Token not expired

### **C. Log In Fresh**
1. Log in with citizen credentials
2. You'll get a **new JWT token** with correct role

### **D. Test Complaint Submission**
1. Navigate to: **Register Complaint**
2. Fill out the form
3. Click **Submit**
4. **Expected:** ✅ 200 OK - Success!

---

## 🔍 Debugging

### **Check Backend Logs:**

Enable debug logging in `application.properties`:
```properties
logging.level.org.springframework.security=DEBUG
logging.level.com.yourpackage=DEBUG
```

**Look for:**
```
DEBUG o.s.security.web.FilterChainProxy - Securing POST /api/citizens/complaints
DEBUG o.s.s.a.i.a.MethodSecurityInterceptor - Authorized filter invocation
INFO  c.e.controller.CitizenComplaintController - Creating complaint
```

**If you see:**
```
WARN o.s.security.web.access.AccessDeniedHandlerImpl - Access is denied
```
Then SecurityConfig is still wrong or backend wasn't restarted.

### **Check Frontend Console:**

After submitting complaint, check browser console (F12):
```
🔐 Security Diagnostics
  📤 Submitting complaint: {...}
  🔑 Token Present: Yes
  👤 Role: CITIZEN
  🎫 Token Payload: {
    sub: "user@example.com",
    role: "ROLE_CITIZEN",
    authorities: ["ROLE_CITIZEN"],
    exp: "2026-02-10 18:30:00",
    iat: "2026-02-10 10:30:00"
  }
  ✅ Token is valid and has CITIZEN role
```

---

## 📊 Expected Behavior

### **Before Fix:**
```
POST /api/citizens/complaints
Status: 403 Forbidden ❌
Response: Access Denied
```

### **After Fix:**
```
POST /api/citizens/complaints
Status: 200 OK ✅
Response: {
  complaintId: 123,
  title: "Street Light Issue",
  status: "PENDING",
  createdAt: "2026-02-10T10:30:00"
}
```

---

## 🎯 Summary

**Three things must be correct:**

1. **SecurityConfig.java**
   - `/api/citizens/complaints` must have `.hasRole("CITIZEN")`
   - NOT `.authenticated()` or `.hasRole("USER")`

2. **JWT Token**
   - Must contain `"role": "ROLE_CITIZEN"` or `"authorities": ["ROLE_CITIZEN"]`
   - Must not be expired

3. **Backend Restart**
   - SecurityConfig changes only take effect after restart
   - Must wait for "Started Application" message

**After fixing all three, the 403 error will be resolved!** ✅

---

## 🆘 Still Not Working?

If you've done all the above and still getting 403:

1. **Share backend logs** - Look for security-related errors
2. **Share SecurityConfig.java** - Verify the exact configuration
3. **Share JWT token payload** - Use the security diagnostic tool
4. **Check database** - Verify user role is "CITIZEN" in database

---

© 2026 CivicConnect - Backend Security Configuration Guide v1.0
