# 🚀 Quick Fix Guide - 403 Complaint Submission Error

## ⚡ Immediate Actions

### 1️⃣ **Use Security Diagnostic Tool**
```
http://localhost:5173/security-diagnostic
```
Click "Run Diagnostics" to check your token and role.

---

### 2️⃣ **Check Backend SecurityConfig**

**File:** `src/main/java/.../config/SecurityConfig.java`

**Required line:**
```java
.requestMatchers(HttpMethod.POST, "/api/citizens/complaints").hasRole("CITIZEN")
```

**NOT:**
```java
.requestMatchers("/api/citizens/complaints").authenticated()  // ❌ WRONG
```

---

### 3️⃣ **Restart Backend** (CRITICAL!)

```bash
# Stop backend (Ctrl+C)
./mvnw spring-boot:run

# Wait for:
Started CivicConnectApplication in X.XXX seconds
```

---

### 4️⃣ **Clear Frontend & Re-login**

1. Log out
2. Clear cache: `Ctrl+Shift+Delete`
3. Close all tabs
4. Open: `http://localhost:5173`
5. Log in again (gets fresh token)

---

### 5️⃣ **Test Complaint Submission**

1. Go to: Register Complaint
2. Fill form
3. Submit
4. **Expected:** ✅ Success!

---

## 🔍 Quick Diagnostics

### **Browser Console (F12):**
Look for:
```
🔐 Security Diagnostics
  ✅ Token is valid and has CITIZEN role
```

### **Backend Console:**
Look for:
```
Started CivicConnectApplication in X.XXX seconds
```

---

## 📚 Full Documentation

- **Security Config Guide:** `BACKEND_SECURITY_CONFIG_GUIDE.md`
- **Complete Fix Guide:** `FINAL_FIX_GUIDE.md`
- **Security Diagnostic Tool:** `http://localhost:5173/security-diagnostic`

---

## ✅ Success Checklist

- [ ] Backend has `.hasRole("CITIZEN")` for `/api/citizens/complaints`
- [ ] Backend restarted
- [ ] Logged out from frontend
- [ ] Cleared browser cache
- [ ] Logged back in (new token)
- [ ] Tested complaint submission
- [ ] Got 200 OK response

---

**If all checked, complaint submission should work!** 🎉
