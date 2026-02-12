# 🔧 Backend 403 Error Fix - Complete Guide

## 🚨 **CRITICAL: This is a Backend Issue, Not Frontend**

The 403 Forbidden error is caused by **Spring Security configuration** on the backend. The frontend is working correctly - it's sending the authentication token, but the backend is rejecting it.

---

## 🎯 **Quick Diagnosis**

### **Use the Diagnostic Tool**
Navigate to: **http://localhost:5173/backend-diagnostic**

This tool will:
- ✅ Decode your JWT token
- ✅ Check if ROLE_CITIZEN is present
- ✅ Verify token expiration
- ✅ Show exact backend configuration needed

---

## 🔍 **Root Cause Analysis**

### **What's Happening**:
1. Frontend sends POST request to `/api/citizens/complaints`
2. Request includes valid JWT token in Authorization header
3. Backend Spring Security **blocks** the request with 403
4. No response data returned (empty response body)

### **Why It's Happening**:
One or more of these backend issues:

1. **Missing @PreAuthorize annotation** on the controller method
2. **Incorrect Spring Security configuration** for the endpoint
3. **JWT token doesn't contain ROLE_CITIZEN** authority
4. **Role mapping issue** in JWT authentication filter
5. **CORS configuration** blocking the request

---

## ✅ **Backend Fixes Required**

### **Fix 1: Controller Annotation**

**File**: `CitizenComplaintController.java` or similar

```java
package com.civicconnect.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/citizens")
@CrossOrigin(origins = "http://localhost:5173")
public class CitizenComplaintController {

    @PostMapping("/complaints")
    @PreAuthorize("hasRole('CITIZEN')")  // ← ADD THIS
    public ResponseEntity<?> createComplaint(
        @RequestParam("title") String title,
        @RequestParam("description") String description,
        @RequestParam("departmentId") Long departmentId,
        @RequestParam("wardId") Long wardId,
        @RequestParam("address") String address,
        @RequestParam(value = "latitude", required = false) Double latitude,
        @RequestParam(value = "longitude", required = false) Double longitude,
        @RequestParam(value = "images", required = false) MultipartFile[] images,
        Authentication authentication  // ← ADD THIS to get current user
    ) {
        // Get current user from authentication
        String email = authentication.getName();
        
        // Your existing implementation
        // ...
        
        return ResponseEntity.ok(complaint);
    }
}
```

---

### **Fix 2: Spring Security Configuration**

**File**: `SecurityConfig.java`

```java
package com.civicconnect.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)  // ← IMPORTANT: Enable @PreAuthorize
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/register/**").permitAll()
                
                // Citizen endpoints - MUST have ROLE_CITIZEN
                .requestMatchers("/api/citizens/**").hasRole("CITIZEN")  // ← ADD THIS
                
                // Ward Officer endpoints
                .requestMatchers("/api/ward-officer/**").hasRole("WARD_OFFICER")
                
                // Department Officer endpoints
                .requestMatchers("/api/department/**").hasRole("DEPARTMENT_OFFICER")
                
                // Admin endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // Any other request must be authenticated
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter(), 
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

---

### **Fix 3: JWT Token Generation**

**File**: `JwtTokenProvider.java` or `AuthService.java`

**CRITICAL**: The JWT token **MUST** include `ROLE_CITIZEN` in the authorities claim.

```java
public String generateToken(User user) {
    Map<String, Object> claims = new HashMap<>();
    
    // ← CRITICAL: Add ROLE_ prefix to authorities
    List<String> authorities = user.getAuthorities().stream()
        .map(authority -> {
            String auth = authority.getAuthority();
            // Ensure ROLE_ prefix
            return auth.startsWith("ROLE_") ? auth : "ROLE_" + auth;
        })
        .collect(Collectors.toList());
    
    claims.put("authorities", authorities);
    claims.put("email", user.getEmail());
    claims.put("role", user.getRole().name());  // e.g., "CITIZEN"
    
    return Jwts.builder()
        .setClaims(claims)
        .setSubject(user.getEmail())
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
        .signWith(getSigningKey(), SignatureAlgorithm.HS256)
        .compact();
}
```

**Example JWT Token Payload**:
```json
{
  "sub": "citizen@example.com",
  "authorities": ["ROLE_CITIZEN"],  // ← MUST have ROLE_ prefix
  "email": "citizen@example.com",
  "role": "CITIZEN",
  "iat": 1707519968,
  "exp": 1707523568
}
```

---

### **Fix 4: JWT Authentication Filter**

**File**: `JwtAuthenticationFilter.java`

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) 
            throws ServletException, IOException {
        
        try {
            String jwt = extractJwtFromRequest(request);
            
            if (jwt != null && jwtTokenProvider.validateToken(jwt)) {
                String email = jwtTokenProvider.getEmailFromToken(jwt);
                
                // ← CRITICAL: Extract authorities from token
                List<String> authorities = jwtTokenProvider.getAuthoritiesFromToken(jwt);
                
                // Convert to GrantedAuthority objects
                List<GrantedAuthority> grantedAuthorities = authorities.stream()
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());
                
                // Create authentication object
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(
                        email, 
                        null, 
                        grantedAuthorities  // ← MUST include authorities
                    );
                
                authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
                );
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication", ex);
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

---

### **Fix 5: User Entity & Role**

**File**: `User.java`

```java
@Entity
@Table(name = "users")
public class User implements UserDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String email;
    private String password;
    
    @Enumerated(EnumType.STRING)
    private Role role;  // CITIZEN, WARD_OFFICER, DEPARTMENT_OFFICER, ADMIN
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // ← CRITICAL: Return ROLE_ prefixed authority
        return Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_" + role.name())
        );
    }
    
    // Other UserDetails methods...
}
```

**File**: `Role.java`

```java
public enum Role {
    CITIZEN,
    WARD_OFFICER,
    DEPARTMENT_OFFICER,
    ADMIN
}
```

---

## 🧪 **Testing the Fix**

### **1. Check JWT Token**
Use the diagnostic tool at `/backend-diagnostic` to verify:
- Token contains `"authorities": ["ROLE_CITIZEN"]`
- Token is not expired
- Role is set to "CITIZEN"

### **2. Test with Postman**

```http
POST http://localhost:8083/api/citizens/complaints
Content-Type: multipart/form-data
Authorization: Bearer YOUR_JWT_TOKEN_HERE

Form Data:
- title: Test Complaint
- description: This is a test complaint with more than 20 characters
- departmentId: 1
- wardId: 1
- address: Test Address, Test Street
- latitude: 18.5204
- longitude: 73.8567
- images: [file1.jpg, file2.jpg]
```

**Expected Response**: `200 OK` with complaint data

**If Still 403**: Check backend logs for exact error

### **3. Check Backend Logs**

Look for these in your Spring Boot console:
```
DEBUG o.s.security.web.FilterChainProxy - Securing POST /api/citizens/complaints
DEBUG o.s.s.a.i.a.MethodSecurityInterceptor - Authorized filter invocation
```

If you see:
```
DEBUG o.s.s.w.a.i.FilterSecurityInterceptor - Failed to authorize filter invocation
```
Then the security configuration is still wrong.

---

## 🔍 **Debugging Checklist**

### **Backend**:
- [ ] `@EnableMethodSecurity(prePostEnabled = true)` in SecurityConfig
- [ ] `@PreAuthorize("hasRole('CITIZEN')")` on createComplaint method
- [ ] `.requestMatchers("/api/citizens/**").hasRole("CITIZEN")` in SecurityConfig
- [ ] JWT token includes `"authorities": ["ROLE_CITIZEN"]`
- [ ] JwtAuthenticationFilter extracts and sets authorities
- [ ] User.getAuthorities() returns `ROLE_CITIZEN`
- [ ] CORS configured to allow `http://localhost:5173`

### **Frontend**:
- [ ] Token present in localStorage
- [ ] Token sent in Authorization header
- [ ] Role is "CITIZEN"
- [ ] FormData created correctly

---

## 📊 **Common Mistakes**

### **Mistake 1: Missing ROLE_ Prefix**
```java
// ❌ WRONG
authorities: ["CITIZEN"]

// ✅ CORRECT
authorities: ["ROLE_CITIZEN"]
```

### **Mistake 2: Not Enabling Method Security**
```java
// ❌ WRONG
@Configuration
@EnableWebSecurity
public class SecurityConfig { }

// ✅ CORRECT
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)  // ← ADD THIS
public class SecurityConfig { }
```

### **Mistake 3: Wrong hasRole() Usage**
```java
// ❌ WRONG
.hasRole("ROLE_CITIZEN")  // Don't include ROLE_ prefix in hasRole()

// ✅ CORRECT
.hasRole("CITIZEN")  // Spring adds ROLE_ prefix automatically
```

### **Mistake 4: Not Setting Authorities in Authentication**
```java
// ❌ WRONG
UsernamePasswordAuthenticationToken authentication = 
    new UsernamePasswordAuthenticationToken(email, null, null);

// ✅ CORRECT
UsernamePasswordAuthenticationToken authentication = 
    new UsernamePasswordAuthenticationToken(email, null, grantedAuthorities);
```

---

## 🚀 **Quick Fix Steps**

1. **Add @EnableMethodSecurity** to SecurityConfig
2. **Add @PreAuthorize("hasRole('CITIZEN')")** to createComplaint method
3. **Ensure JWT token has "authorities": ["ROLE_CITIZEN"]**
4. **Restart Spring Boot application**
5. **Log out and log back in** on frontend (to get new token)
6. **Try submitting complaint again**

---

## 📞 **Still Not Working?**

### **Check These**:

1. **Backend Console Logs**: Look for security-related errors
2. **JWT Token**: Use `/backend-diagnostic` to decode and verify
3. **Postman Test**: Test endpoint directly to isolate frontend/backend
4. **Database**: Verify user has role "CITIZEN" in database
5. **Spring Boot Version**: Ensure compatible with security configuration

### **Get Help**:
- Check Spring Security documentation
- Review backend logs carefully
- Test with Postman to confirm backend issue
- Share backend logs for further diagnosis

---

## ✅ **Success Criteria**

When fixed, you should see:
- ✅ **200 OK** response from `/api/citizens/complaints`
- ✅ Complaint created in database
- ✅ Success message on frontend
- ✅ Redirect to complaints list
- ✅ New complaint visible in list

---

## 📚 **Additional Resources**

- [Spring Security Reference](https://docs.spring.io/spring-security/reference/)
- [Method Security](https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html)
- [JWT Authentication](https://www.baeldung.com/spring-security-oauth-jwt)

---

**Remember**: This is a **backend configuration issue**. The frontend is working correctly! 🎯

© 2026 PMC Municipal Administration - Backend Fix Guide v2.5.1
