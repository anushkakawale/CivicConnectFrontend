# 🚨 IMMEDIATE 403 FIX - Action Required

## ⚠️ **CRITICAL: Backend Not Restarted**

The 403 error is still occurring because **the Spring Boot backend has NOT been restarted** after the SecurityConfig fix.

---

## 🎯 **IMMEDIATE ACTIONS REQUIRED**

### **1. RESTART SPRING BOOT APPLICATION** (CRITICAL)

The SecurityConfig change from `.authenticated()` to `.hasRole("CITIZEN")` **will NOT take effect** until you restart the backend.

**How to Restart**:

#### **Option A: If running from IDE (IntelliJ/Eclipse)**
1. Stop the application (Red stop button)
2. Wait 5 seconds
3. Start the application again (Green play button)

#### **Option B: If running from terminal**
```bash
# Press Ctrl+C to stop
# Then restart with:
./mvnw spring-boot:run

# OR if using jar:
java -jar target/civic-connect-backend.jar
```

#### **Option C: If running as service**
```bash
sudo systemctl restart civic-connect
```

---

### **2. VERIFY BACKEND IS RUNNING**

After restart, check:
```
✅ Backend console shows: "Started Application in X seconds"
✅ No errors in console
✅ Port 8083 is accessible
```

Test with:
```bash
curl http://localhost:8083/api/wards
```

Should return list of wards (this is a public endpoint).

---

### **3. LOG OUT AND LOG BACK IN** (Frontend)

After backend restart:

1. **Log out** from the frontend application
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Log back in** with citizen credentials
4. **Try registering complaint** again

This ensures you get a **new JWT token** with the correct authorities from the restarted backend.

---

## 🔍 **Debugging Steps**

### **Step 1: Check Token**

Open browser console (F12) and run:

```javascript
// Copy and paste this in console
const token = localStorage.getItem('token');
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log('Token Payload:', payload);
console.log('Has ROLE_CITIZEN:', payload.authorities?.includes('ROLE_CITIZEN'));
```

**Expected Output**:
```json
{
  "sub": "citizen@example.com",
  "authorities": ["ROLE_CITIZEN"],  // ← MUST BE PRESENT
  "exp": 1707523568,
  "iat": 1707519968
}
Has ROLE_CITIZEN: true
```

**If ROLE_CITIZEN is missing**:
- Backend hasn't been restarted
- OR backend JWT generation is wrong
- OR you need to log out and log back in

---

### **Step 2: Test Endpoint with Postman**

Test the endpoint directly to isolate frontend/backend:

```http
POST http://localhost:8083/api/citizens/complaints
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: multipart/form-data

Form Data:
title: Test Complaint Title Here
description: This is a test complaint description with more than twenty characters
departmentId: 1
wardId: 1
address: Test Address, Test Street, Test City
latitude: 18.5204
longitude: 73.8567
images: [optional files]
```

**Expected**: 200 OK  
**If 403**: Backend security config still wrong or not restarted

---

### **Step 3: Check Backend Logs**

Look for these in Spring Boot console:

**Good Signs** ✅:
```
DEBUG o.s.security.web.FilterChainProxy - Securing POST /api/citizens/complaints
DEBUG o.s.s.a.i.a.MethodSecurityInterceptor - Authorized filter invocation
INFO  c.e.controller.CitizenComplaintController - Creating complaint for user: citizen@example.com
```

**Bad Signs** ❌:
```
DEBUG o.s.s.w.a.i.FilterSecurityInterceptor - Failed to authorize filter invocation
WARN  o.s.security.web.access.AccessDeniedHandlerImpl - Access is denied
```

---

## 🔧 **Alternative: Check if Backend Config is Actually Applied**

### **Verify SecurityConfig.java**

Make sure line 58 has:

```java
// ✅ CORRECT
.requestMatchers("/api/citizen/**", "/api/citizens/**").hasRole("CITIZEN")

// ❌ WRONG (if you still see this, the file wasn't saved)
.requestMatchers("/api/citizen/**", "/api/citizens/**").authenticated()
```

### **Check if File Was Saved**

1. Open `SecurityConfig.java` in your IDE
2. Check line 58
3. If it still shows `.authenticated()`, the change wasn't saved
4. Make the change again and **save the file** (Ctrl+S)
5. **Restart the backend**

---

## 📊 **Checklist**

- [ ] SecurityConfig.java line 58 changed to `.hasRole("CITIZEN")`
- [ ] File saved (Ctrl+S)
- [ ] Backend restarted (CRITICAL - this is likely missing)
- [ ] Backend console shows "Started Application"
- [ ] No errors in backend console
- [ ] Logged out from frontend
- [ ] Cleared browser cache
- [ ] Logged back in
- [ ] Got new JWT token
- [ ] Token contains "authorities": ["ROLE_CITIZEN"]
- [ ] Tried submitting complaint
- [ ] Got 200 OK response

---

## 🎯 **Most Likely Issue**

Based on the error still occurring, the **most likely issue** is:

### **Backend Has NOT Been Restarted**

The SecurityConfig change requires a **full application restart** to take effect. Simply saving the file is not enough.

**Solution**: **RESTART THE SPRING BOOT APPLICATION NOW**

---

## 📞 **If Still Not Working After Restart**

### **1. Check Backend Logs for Exact Error**

The backend logs will show the exact reason for the 403:
- Missing authority?
- Wrong role?
- Token validation failed?
- CORS issue?

### **2. Verify JWT Token Generation**

The backend must generate tokens with:
```java
claims.put("authorities", Arrays.asList("ROLE_CITIZEN"));
```

Not:
```java
claims.put("authorities", Arrays.asList("CITIZEN")); // ❌ Missing ROLE_ prefix
```

### **3. Check JwtAuthenticationFilter**

The filter must extract authorities and set them in the Authentication object:

```java
List<GrantedAuthority> authorities = getAuthoritiesFromToken(jwt);
UsernamePasswordAuthenticationToken auth = 
    new UsernamePasswordAuthenticationToken(email, null, authorities);
```

---

## ✅ **Success Criteria**

When everything is working:

```
✅ Backend restarted
✅ SecurityConfig has .hasRole("CITIZEN")
✅ JWT token has "authorities": ["ROLE_CITIZEN"]
✅ POST /api/citizens/complaints returns 200 OK
✅ Complaint created in database
✅ Frontend shows success message
✅ Redirects to complaints list
```

---

## 🚀 **NEXT STEP**

**RESTART THE SPRING BOOT BACKEND APPLICATION NOW**

Then:
1. Log out from frontend
2. Log back in
3. Try submitting complaint
4. Should work! ✅

---

**Status**: ⚠️ **WAITING FOR BACKEND RESTART**

**Critical Action**: Restart Spring Boot application

**Expected Time**: 30 seconds to restart + 10 seconds to test = 40 seconds total

---

© 2026 PMC Municipal Administration - Immediate Fix Guide
