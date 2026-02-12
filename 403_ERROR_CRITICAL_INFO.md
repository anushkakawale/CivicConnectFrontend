# 🚨 403 Error - Critical Information

## **THIS IS A BACKEND ISSUE, NOT FRONTEND**

The 403 Forbidden error when submitting complaints is caused by **Spring Security configuration on the backend**. The frontend is working correctly.

---

## 🎯 **Quick Action Required**

### **1. Use the Diagnostic Tool** (FIRST STEP)
Navigate to: **http://localhost:5173/backend-diagnostic**

This will show you:
- ✅ Your JWT token details
- ✅ Whether ROLE_CITIZEN is present
- ✅ Exact backend configuration needed

### **2. Fix the Backend** (REQUIRED)
The backend needs these changes:

#### **A. Enable Method Security**
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)  // ← ADD THIS LINE
public class SecurityConfig { }
```

#### **B. Add Controller Annotation**
```java
@PostMapping("/complaints")
@PreAuthorize("hasRole('CITIZEN')")  // ← ADD THIS LINE
public ResponseEntity<?> createComplaint(...) { }
```

#### **C. Configure Security Rules**
```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/citizens/**").hasRole("CITIZEN")  // ← ADD THIS
    // ... other rules
)
```

#### **D. Ensure JWT Token Has Authorities**
```json
{
  "authorities": ["ROLE_CITIZEN"],  // ← MUST BE PRESENT
  "sub": "citizen@example.com",
  "exp": 1707523568
}
```

---

## 📊 **Evidence This is Backend Issue**

From your console logs:
```
✅ Frontend: Token is present
✅ Frontend: Auth header sent correctly
✅ Frontend: Request data is valid
❌ Backend: Returns 403 Forbidden
❌ Backend: Empty response body
❌ Backend: No error message
```

This pattern indicates **Spring Security is blocking the request** before it reaches your controller.

---

## 🔍 **What's Happening**

1. **Frontend** creates complaint with all correct data ✅
2. **Frontend** sends JWT token in Authorization header ✅
3. **Backend** receives request ✅
4. **Spring Security** checks permissions ❌
5. **Spring Security** blocks request with 403 ❌
6. **Controller** never executes ❌

---

## 📚 **Complete Documentation**

### **For Detailed Backend Fixes**:
Read: `BACKEND_403_FIX_GUIDE.md`

This includes:
- Complete Spring Security configuration
- JWT token generation fixes
- Controller annotations
- Authentication filter setup
- Common mistakes to avoid
- Testing with Postman
- Debugging checklist

### **For Diagnostic Tool**:
Navigate to: `/backend-diagnostic`

Or manually check:
```javascript
// In browser console
console.log('Token:', localStorage.getItem('token'));
console.log('Role:', localStorage.getItem('role'));
```

---

## ✅ **Quick Fix Checklist**

### **Backend Changes Required**:
- [ ] Add `@EnableMethodSecurity(prePostEnabled = true)` to SecurityConfig
- [ ] Add `@PreAuthorize("hasRole('CITIZEN')")` to createComplaint method
- [ ] Add `.requestMatchers("/api/citizens/**").hasRole("CITIZEN")` to SecurityConfig
- [ ] Ensure JWT token includes `"authorities": ["ROLE_CITIZEN"]`
- [ ] Ensure JwtAuthenticationFilter sets authorities in Authentication object
- [ ] Restart Spring Boot application

### **Frontend Testing**:
- [ ] Log out and log back in (to get new token with authorities)
- [ ] Navigate to `/backend-diagnostic` to verify token
- [ ] Try submitting complaint again
- [ ] Check console for success message

---

## 🧪 **Testing Steps**

### **1. Check Token (Frontend)**
```
1. Open browser DevTools (F12)
2. Go to Console tab
3. Type: localStorage.getItem('token')
4. Copy the token
5. Go to: https://jwt.io
6. Paste token
7. Check if "authorities": ["ROLE_CITIZEN"] is present
```

### **2. Test with Postman (Backend)**
```
POST http://localhost:8083/api/citizens/complaints
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: multipart/form-data

Form Data:
- title: Test Complaint
- description: This is a test with more than 20 characters
- departmentId: 1
- wardId: 1
- address: Test Address
```

**Expected**: 200 OK  
**If 403**: Backend security configuration is wrong

---

## 🚫 **Common Backend Mistakes**

### **1. Missing ROLE_ Prefix**
```java
// ❌ WRONG
"authorities": ["CITIZEN"]

// ✅ CORRECT
"authorities": ["ROLE_CITIZEN"]
```

### **2. Not Enabling Method Security**
```java
// ❌ WRONG
@EnableWebSecurity
public class SecurityConfig { }

// ✅ CORRECT
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig { }
```

### **3. Wrong hasRole() Usage**
```java
// ❌ WRONG
.hasRole("ROLE_CITIZEN")

// ✅ CORRECT
.hasRole("CITIZEN")  // Spring adds ROLE_ automatically
```

---

## 📞 **Need Help?**

### **1. Use Diagnostic Tool**
http://localhost:5173/backend-diagnostic

### **2. Read Full Guide**
BACKEND_403_FIX_GUIDE.md

### **3. Check Backend Logs**
Look for Spring Security errors in console

### **4. Test with Postman**
Isolate whether it's frontend or backend issue

---

## 🎯 **Bottom Line**

**The frontend code is correct.** The issue is in the backend Spring Security configuration. The backend needs to:

1. **Enable method security**
2. **Add @PreAuthorize annotation**
3. **Include ROLE_CITIZEN in JWT token**
4. **Set authorities in Authentication object**

Once these backend changes are made and the Spring Boot app is restarted, the 403 error will be resolved.

---

**Status**: ⚠️ **BACKEND FIX REQUIRED**

**Next Step**: Fix backend Spring Security configuration

**Diagnostic Tool**: http://localhost:5173/backend-diagnostic

---

© 2026 PMC Municipal Administration
