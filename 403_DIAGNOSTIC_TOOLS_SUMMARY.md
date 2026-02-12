# 🛠️ 403 Error Diagnostic Tools - Setup Complete

## ✅ What Has Been Created

I've set up comprehensive diagnostic and debugging tools to help you fix the 403 Forbidden error when submitting complaints.

---

## 🎯 New Tools Available

### 1️⃣ **Security Diagnostic Tool** (NEW!)
**URL:** `http://localhost:5173/security-diagnostic`

**Features:**
- ✅ Analyzes JWT token structure and validity
- ✅ Checks token expiration
- ✅ Verifies CITIZEN role is present
- ✅ Shows token payload details
- ✅ Provides actionable recommendations
- ✅ One-click session clear and reload

**How to Use:**
1. Navigate to `http://localhost:5173/security-diagnostic`
2. Click "Run Diagnostics"
3. Review security checks and recommendations
4. Follow the suggested actions

---

### 2️⃣ **Enhanced Error Logging** (UPDATED!)
**File:** `src/pages/citizen/RegisterComplaintEnhanced.jsx`

**New Features:**
- ✅ Detailed token payload logging
- ✅ Automatic token expiration check
- ✅ Role verification before submission
- ✅ Clear error messages for role mismatches
- ✅ Grouped console output for easy reading

**How to Use:**
1. Open browser console (F12)
2. Try to submit a complaint
3. Look for "🔐 Security Diagnostics" section
4. Review token details and validation results

---

### 3️⃣ **Backend Configuration Guide** (NEW!)
**File:** `BACKEND_SECURITY_CONFIG_GUIDE.md`

**Contents:**
- ✅ Complete SecurityConfig.java example
- ✅ Common mistakes to avoid
- ✅ JWT token generation verification
- ✅ Step-by-step debugging instructions
- ✅ Expected vs actual behavior comparison

**How to Use:**
1. Open `BACKEND_SECURITY_CONFIG_GUIDE.md`
2. Follow Step 1-5 sequentially
3. Verify your backend configuration matches
4. Make necessary changes
5. Restart backend

---

### 4️⃣ **Quick Fix Reference** (NEW!)
**File:** `QUICK_FIX_403.md`

**Contents:**
- ✅ 5-step immediate action plan
- ✅ Quick diagnostics checklist
- ✅ Success verification checklist

**How to Use:**
1. Open `QUICK_FIX_403.md`
2. Follow the 5 immediate actions
3. Check off items as you complete them

---

## 🔍 How to Diagnose the 403 Error

### **Step 1: Run Security Diagnostic**
```
http://localhost:5173/security-diagnostic
```
This will tell you:
- Is your token valid?
- Does it have CITIZEN role?
- Is it expired?
- What needs to be fixed?

### **Step 2: Check Browser Console**
When you try to submit a complaint, look for:
```
🔐 Security Diagnostics
  🔑 Token Present: Yes
  👤 Role: CITIZEN
  🎫 Token Payload: {...}
  ✅ Token is valid and has CITIZEN role
```

### **Step 3: Verify Backend Config**
Open `BACKEND_SECURITY_CONFIG_GUIDE.md` and verify:
```java
.requestMatchers(HttpMethod.POST, "/api/citizens/complaints").hasRole("CITIZEN")
```

### **Step 4: Restart Backend**
```bash
./mvnw spring-boot:run
```
Wait for: `Started CivicConnectApplication`

### **Step 5: Fresh Login**
1. Log out
2. Clear cache
3. Log in again
4. Test complaint submission

---

## 📊 What Each Tool Shows

### **Security Diagnostic Tool:**
```
✅ Security Checks
  ✅ Token is valid - Expires in 480 minutes
  ✅ Has CITIZEN role - Role: ROLE_CITIZEN

💡 Recommendations
  (Shows if any issues found)

🔑 JWT Token Analysis
  {
    "header": {...},
    "payload": {
      "sub": "user@example.com",
      "role": "ROLE_CITIZEN",
      "authorities": ["ROLE_CITIZEN"],
      "exp": "2026-02-10 18:30:00",
      "iat": "2026-02-10 10:30:00",
      "isExpired": false,
      "timeUntilExpiry": 480
    }
  }
```

### **Enhanced Console Logging:**
```
🔐 Security Diagnostics
  📤 Submitting complaint: {
    title: "Street Light Issue",
    description: "...",
    departmentId: 1,
    wardId: 5,
    images: "2 file(s)"
  }
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

📦 FormData contents:
  title: Street Light Issue
  description: ...
  departmentId: 1
  wardId: 5
  address: Near City Hospital
  images: File(photo1.jpg, 245678 bytes)
```

---

## 🎯 Most Likely Root Cause

Based on the error and previous fixes, the issue is **99% likely** to be:

### **Backend SecurityConfig Not Updated or Not Restarted**

**Fix:**
1. Check `SecurityConfig.java` has `.hasRole("CITIZEN")`
2. Restart backend server
3. Log out and log back in (get fresh token)
4. Try submitting complaint again

---

## 🆘 Troubleshooting Decision Tree

```
Getting 403 Error?
│
├─ Run Security Diagnostic Tool
│  │
│  ├─ Token Expired?
│  │  └─ YES → Log out and log back in
│  │
│  ├─ Missing CITIZEN role?
│  │  └─ YES → Backend JWT generation issue
│  │           → Check JwtTokenProvider.java
│  │           → Restart backend
│  │           → Log in again
│  │
│  └─ Token Valid + Has CITIZEN role?
│     └─ YES → Backend SecurityConfig issue
│              → Check SecurityConfig.java
│              → Must have .hasRole("CITIZEN")
│              → Restart backend
│              → Log in again
```

---

## 📁 Files Created/Modified

### **New Files:**
1. `src/pages/BackendSecurityDiagnostic.jsx` - Security diagnostic tool
2. `BACKEND_SECURITY_CONFIG_GUIDE.md` - Complete backend config guide
3. `QUICK_FIX_403.md` - Quick reference card
4. `403_DIAGNOSTIC_TOOLS_SUMMARY.md` - This file

### **Modified Files:**
1. `src/pages/citizen/RegisterComplaintEnhanced.jsx` - Enhanced logging
2. `src/App.jsx` - Added route for security diagnostic tool

---

## 🚀 Next Steps

### **Immediate Actions:**

1. **Run Security Diagnostic:**
   ```
   http://localhost:5173/security-diagnostic
   ```

2. **Check Token Status:**
   - Is it valid?
   - Does it have CITIZEN role?
   - Is it expired?

3. **If Token is Good:**
   - Problem is in backend SecurityConfig
   - Follow `BACKEND_SECURITY_CONFIG_GUIDE.md`
   - Restart backend
   - Test again

4. **If Token is Bad:**
   - Log out
   - Clear cache
   - Log in again
   - Test again

---

## ✅ Success Criteria

When everything is working:

1. ✅ Security Diagnostic shows: "Token is valid and has CITIZEN role"
2. ✅ Console shows: "✅ Token is valid and has CITIZEN role"
3. ✅ Complaint submission returns: `200 OK`
4. ✅ Success message: "Complaint submitted successfully!"
5. ✅ Redirected to complaints list
6. ✅ New complaint visible in list

---

## 📞 Need More Help?

If you're still getting 403 after:
- ✅ Running security diagnostic
- ✅ Verifying backend config
- ✅ Restarting backend
- ✅ Fresh login

Then share:
1. Security diagnostic output (from the tool)
2. Backend console logs (especially security-related)
3. Browser console output (the 🔐 Security Diagnostics section)
4. SecurityConfig.java snippet

---

**All tools are ready to use! Start with the Security Diagnostic Tool.** 🎉

© 2026 CivicConnect - Diagnostic Tools v1.0
