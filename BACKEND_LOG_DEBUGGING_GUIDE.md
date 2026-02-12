# 🔍 Backend Log Debugging Guide

## 📊 How to Debug Backend Logs After Restart

After restarting your backend, you need to verify that the SecurityConfig is working correctly.

---

## 1️⃣ **Enable Debug Logging**

### **Option A: application.properties**
Add these lines to `src/main/resources/application.properties`:

```properties
# Enable Spring Security debug logging
logging.level.org.springframework.security=DEBUG

# Enable your application debug logging
logging.level.com.civicconnect=DEBUG

# Enable web request logging
logging.level.org.springframework.web=DEBUG

# Enable filter chain logging
logging.level.org.springframework.security.web.FilterChainProxy=DEBUG
```

### **Option B: application.yml**
Add these lines to `src/main/resources/application.yml`:

```yaml
logging:
  level:
    org.springframework.security: DEBUG
    com.civicconnect: DEBUG
    org.springframework.web: DEBUG
    org.springframework.security.web.FilterChainProxy: DEBUG
```

---

## 2️⃣ **Restart Backend**

```bash
# Stop backend (Ctrl+C)

# Restart with debug logging
./mvnw spring-boot:run

# OR with Gradle
./gradlew bootRun
```

---

## 3️⃣ **What to Look For in Logs**

### **✅ GOOD LOGS (Success)**

When you try to submit a complaint, you should see:

```
DEBUG o.s.security.web.FilterChainProxy - Securing POST /api/citizens/complaints
DEBUG o.s.s.w.a.i.FilterSecurityInterceptor - Authorized filter invocation [POST /api/citizens/complaints] with attributes [hasRole('ROLE_CITIZEN')]
DEBUG o.s.s.access.vote.AffirmativeBased - Voter: org.springframework.security.access.vote.RoleVoter@... access granted
DEBUG o.s.s.w.a.i.FilterSecurityInterceptor - Authorization successful
DEBUG o.s.s.w.c.SecurityContextPersistenceFilter - Cleared SecurityContextHolder
INFO  c.c.controller.CitizenComplaintController - Creating complaint for user: anushka@gmail.com
INFO  c.c.service.ComplaintService - Complaint created successfully with ID: 123
```

**Key indicators:**
- ✅ `Authorization successful`
- ✅ `access granted`
- ✅ Controller method is called
- ✅ Service method is called

---

### **❌ BAD LOGS (Still 403)**

If you still get 403, you'll see:

```
DEBUG o.s.security.web.FilterChainProxy - Securing POST /api/citizens/complaints
DEBUG o.s.s.w.a.i.FilterSecurityInterceptor - Authorized filter invocation [POST /api/citizens/complaints] with attributes [authenticated]
DEBUG o.s.s.access.vote.AffirmativeBased - Voter: org.springframework.security.access.vote.RoleVoter@... access denied
WARN  o.s.s.w.access.AccessDeniedHandlerImpl - Access is denied (user is not anonymous); delegating to AccessDeniedHandler
DEBUG o.s.s.w.access.AccessDeniedHandlerImpl - Responding with 403 status code
```

**Key indicators:**
- ❌ `access denied`
- ❌ `Responding with 403 status code`
- ❌ `attributes [authenticated]` instead of `attributes [hasRole('ROLE_CITIZEN')]`
- ❌ Controller method is NOT called

**This means:**
- SecurityConfig is still using `.authenticated()` instead of `.hasRole("CITIZEN")`
- OR backend wasn't restarted properly
- OR SecurityConfig changes didn't take effect

---

## 4️⃣ **Common Log Patterns**

### **Pattern 1: Token Not Found**
```
DEBUG o.s.s.w.a.AnonymousAuthenticationFilter - Set SecurityContextHolder to anonymous SecurityContext
```
**Meaning:** JWT token is not being sent or extracted
**Fix:** Check frontend is sending Authorization header

---

### **Pattern 2: Token Invalid**
```
ERROR c.c.security.JwtAuthenticationFilter - JWT token validation failed: JWT signature does not match
```
**Meaning:** Token signature is invalid
**Fix:** Check JWT secret key matches between login and validation

---

### **Pattern 3: Role Not Found**
```
DEBUG o.s.s.access.vote.RoleVoter - Voter: RoleVoter, returned: -1
```
**Meaning:** User doesn't have required role
**Fix:** Check JWT token has `ROLE_CITIZEN` in authorities

---

### **Pattern 4: Wrong Endpoint Matcher**
```
DEBUG o.s.s.w.a.i.FilterSecurityInterceptor - Authorized filter invocation [POST /api/citizens/complaints] with attributes [authenticated]
```
**Meaning:** SecurityConfig is using `.authenticated()` instead of `.hasRole("CITIZEN")`
**Fix:** Update SecurityConfig and restart

---

## 5️⃣ **Step-by-Step Debugging**

### **Step 1: Check Backend Started Successfully**
```
INFO  c.c.CivicConnectApplication - Started CivicConnectApplication in 5.234 seconds
```

### **Step 2: Check Security Filter Chain Loaded**
```
INFO  o.s.s.web.DefaultSecurityFilterChain - Will secure any request with [
  DisableEncodeUrlFilter,
  WebAsyncManagerIntegrationFilter,
  SecurityContextPersistenceFilter,
  HeaderWriterFilter,
  CorsFilter,
  LogoutFilter,
  JwtAuthenticationFilter,
  RequestCacheAwareFilter,
  SecurityContextHolderAwareRequestFilter,
  AnonymousAuthenticationFilter,
  SessionManagementFilter,
  ExceptionTranslationFilter,
  FilterSecurityInterceptor
]
```

**Look for:** `JwtAuthenticationFilter` in the list

### **Step 3: Try to Submit Complaint**

From frontend, submit a complaint and watch backend logs in real-time.

### **Step 4: Analyze the Logs**

Look for the patterns mentioned above.

---

## 6️⃣ **Quick Diagnosis Table**

| Log Message | Meaning | Fix |
|-------------|---------|-----|
| `Authorization successful` | ✅ Working! | None needed |
| `access denied` | ❌ Wrong role config | Update SecurityConfig |
| `attributes [authenticated]` | ❌ Using `.authenticated()` | Change to `.hasRole("CITIZEN")` |
| `JWT token validation failed` | ❌ Invalid token | Check JWT secret |
| `anonymous SecurityContext` | ❌ No token sent | Check frontend Authorization header |
| `Responding with 403` | ❌ Access denied | Check role in token |

---

## 7️⃣ **Example: Complete Success Flow**

```
2026-02-10 10:55:00.123  DEBUG o.s.s.w.FilterChainProxy - Securing POST /api/citizens/complaints
2026-02-10 10:55:00.125  DEBUG c.c.s.JwtAuthenticationFilter - JWT token found in request
2026-02-10 10:55:00.127  DEBUG c.c.s.JwtAuthenticationFilter - JWT token validated successfully for user: anushka@gmail.com
2026-02-10 10:55:00.128  DEBUG c.c.s.JwtAuthenticationFilter - User authorities: [ROLE_CITIZEN]
2026-02-10 10:55:00.130  DEBUG o.s.s.w.a.i.FilterSecurityInterceptor - Authorized filter invocation [POST /api/citizens/complaints] with attributes [hasRole('ROLE_CITIZEN')]
2026-02-10 10:55:00.132  DEBUG o.s.s.a.v.AffirmativeBased - Voter: RoleVoter, returned: 1
2026-02-10 10:55:00.133  DEBUG o.s.s.w.a.i.FilterSecurityInterceptor - Authorization successful
2026-02-10 10:55:00.135  INFO  c.c.c.CitizenComplaintController - Creating complaint for user: anushka@gmail.com
2026-02-10 10:55:00.145  INFO  c.c.s.ComplaintService - Saving complaint: Street Light Issue
2026-02-10 10:55:00.167  INFO  c.c.s.ComplaintService - Complaint created with ID: 123
2026-02-10 10:55:00.170  DEBUG o.s.s.w.c.SecurityContextPersistenceFilter - Cleared SecurityContextHolder
```

**This is what you want to see!** ✅

---

## 8️⃣ **Example: Failure Flow (403)**

```
2026-02-10 10:55:00.123  DEBUG o.s.s.w.FilterChainProxy - Securing POST /api/citizens/complaints
2026-02-10 10:55:00.125  DEBUG c.c.s.JwtAuthenticationFilter - JWT token found in request
2026-02-10 10:55:00.127  DEBUG c.c.s.JwtAuthenticationFilter - JWT token validated successfully for user: anushka@gmail.com
2026-02-10 10:55:00.128  DEBUG c.c.s.JwtAuthenticationFilter - User authorities: [ROLE_CITIZEN]
2026-02-10 10:55:00.130  DEBUG o.s.s.w.a.i.FilterSecurityInterceptor - Authorized filter invocation [POST /api/citizens/complaints] with attributes [authenticated]
2026-02-10 10:55:00.132  DEBUG o.s.s.a.v.AffirmativeBased - Voter: RoleVoter, returned: -1
2026-02-10 10:55:00.133  WARN  o.s.s.w.a.AccessDeniedHandlerImpl - Access is denied (user is not anonymous); delegating to AccessDeniedHandler
2026-02-10 10:55:00.135  DEBUG o.s.s.w.a.AccessDeniedHandlerImpl - Responding with 403 status code
```

**Problem:** Line 5 shows `attributes [authenticated]` instead of `attributes [hasRole('ROLE_CITIZEN')]`

**Fix:** SecurityConfig is using `.authenticated()` instead of `.hasRole("CITIZEN")`

---

## 9️⃣ **Disable Debug Logging After Fix**

Once everything is working, disable debug logging to reduce log noise:

```properties
# application.properties
logging.level.org.springframework.security=INFO
logging.level.com.civicconnect=INFO
logging.level.org.springframework.web=INFO
```

---

## 🎯 **Quick Reference**

### **Enable Debug Logging:**
```properties
logging.level.org.springframework.security=DEBUG
```

### **Look For:**
```
✅ Authorization successful
✅ access granted
✅ Controller method called
```

### **Avoid:**
```
❌ access denied
❌ Responding with 403
❌ attributes [authenticated]
```

### **Fix:**
```java
.requestMatchers(HttpMethod.POST, "/api/citizens/complaints").hasRole("CITIZEN")
```

---

**Use this guide to debug backend logs and verify the fix!** 🔍

© 2026 CivicConnect - Backend Log Debugging Guide
