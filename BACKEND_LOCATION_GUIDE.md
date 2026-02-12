# 🗺️ How to Locate and Verify Backend SecurityConfig

## 📁 Step 1: Locate Your Backend Project

Your backend is likely in one of these locations:

### **Option A: Sibling Directory**
```
C:\Users\anush\MyProjects\ITpreneurCourse\
├── CivicConnectFrontend\
│   └── civic-connect-frontend\  ← You are here
└── CivicConnectBackend\          ← Backend likely here
    └── src\
        └── main\
            └── java\
                └── com\
                    └── civicconnect\
                        └── config\
                            └── SecurityConfig.java  ← Target file
```

### **Option B: Parent Directory**
```
C:\Users\anush\MyProjects\ITpreneurCourse\
├── civic-connect-frontend\  ← You are here
└── civic-connect-backend\   ← Backend likely here
```

### **Option C: Same Directory**
```
C:\Users\anush\MyProjects\ITpreneurCourse\CivicConnectFrontend\
├── civic-connect-frontend\  ← You are here
└── civic-connect-backend\   ← Backend might be here
```

---

## 🔍 Step 2: Search for SecurityConfig.java

### **Method 1: Windows Search**
1. Press `Win + E` to open File Explorer
2. Navigate to: `C:\Users\anush\MyProjects\ITpreneurCourse\`
3. In search box, type: `SecurityConfig.java`
4. Wait for results

### **Method 2: Command Line**
Open PowerShell and run:
```powershell
# Search in parent directory
cd C:\Users\anush\MyProjects\ITpreneurCourse\
Get-ChildItem -Recurse -Filter "SecurityConfig.java" | Select-Object FullName

# OR search in specific backend folder (if you know the name)
cd C:\Users\anush\MyProjects\ITpreneurCourse\CivicConnectBackend\
Get-ChildItem -Recurse -Filter "SecurityConfig.java" | Select-Object FullName
```

### **Method 3: IDE (IntelliJ IDEA / Eclipse)**
1. Open your backend project in IDE
2. Press `Ctrl + Shift + N` (IntelliJ) or `Ctrl + Shift + R` (Eclipse)
3. Type: `SecurityConfig`
4. Select the file

---

## 📂 Step 3: Typical File Structure

Once you find the backend, the structure should look like:

```
civic-connect-backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── civicconnect/  (or your package name)
│   │   │           ├── config/
│   │   │           │   ├── SecurityConfig.java       ← TARGET FILE
│   │   │           │   ├── JwtAuthenticationFilter.java
│   │   │           │   └── CorsConfig.java
│   │   │           ├── controller/
│   │   │           │   ├── CitizenComplaintController.java
│   │   │           │   └── AuthController.java
│   │   │           ├── service/
│   │   │           ├── repository/
│   │   │           └── CivicConnectApplication.java
│   │   └── resources/
│   │       ├── application.properties  ← Config file
│   │       └── application.yml         ← OR this
│   └── test/
├── pom.xml  (Maven)
└── build.gradle  (Gradle)
```

---

## ✅ Step 4: Verify Current SecurityConfig

### **What to Look For:**

Open `SecurityConfig.java` and find the `filterChain` method.

### **❌ WRONG Configuration (Causes 403):**

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/api/citizens/complaints").authenticated()  // ❌ WRONG!
            .anyRequest().authenticated()
        )
    // ...
}
```

**Problem:** Uses `.authenticated()` which allows ANY authenticated user, but Spring Security still checks roles and denies access.

---

### **✅ CORRECT Configuration (Fixes 403):**

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/citizens/complaints").hasRole("CITIZEN")  // ✅ CORRECT!
            .requestMatchers(HttpMethod.GET, "/api/citizens/complaints").hasRole("CITIZEN")
            .requestMatchers(HttpMethod.GET, "/api/citizens/complaints/**").hasRole("CITIZEN")
            .anyRequest().authenticated()
        )
    // ...
}
```

**Fix:** Uses `.hasRole("CITIZEN")` which explicitly allows only CITIZEN role.

---

## 🔧 Step 5: Apply the Fix

### **Option A: Manual Edit**

1. Open `SecurityConfig.java` in your IDE or text editor
2. Find the line with `/api/citizens/complaints`
3. Replace `.authenticated()` with `.hasRole("CITIZEN")`
4. Add `HttpMethod.POST` to be specific
5. Save the file

### **Option B: Copy Complete File**

1. I've created a complete `SecurityConfig.java` for you
2. Location: `civic-connect-frontend/BACKEND_SecurityConfig.java`
3. Copy the entire content
4. Replace your existing `SecurityConfig.java` with it
5. **Important:** Update the package name at the top to match your project

---

## 🔄 Step 6: Restart Backend

### **Method 1: IDE**
1. Click the **Stop** button (red square)
2. Wait 5 seconds
3. Click the **Run** button (green play)

### **Method 2: Command Line (Maven)**
```bash
# Navigate to backend directory
cd C:\Users\anush\MyProjects\ITpreneurCourse\CivicConnectBackend

# Stop current process (Ctrl+C if running)

# Restart
mvnw.cmd spring-boot:run

# OR on Unix/Mac
./mvnw spring-boot:run
```

### **Method 3: Command Line (Gradle)**
```bash
# Navigate to backend directory
cd C:\Users\anush\MyProjects\ITpreneurCourse\CivicConnectBackend

# Stop current process (Ctrl+C if running)

# Restart
gradlew.bat bootRun

# OR on Unix/Mac
./gradlew bootRun
```

---

## ✅ Step 7: Verify Backend Started

Look for this in the console:

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.x.x)

2026-02-10 10:55:00.123  INFO  --- [main] c.c.CivicConnectApplication : Starting CivicConnectApplication
2026-02-10 10:55:05.456  INFO  --- [main] c.c.CivicConnectApplication : Started CivicConnectApplication in 5.234 seconds (JVM running for 5.678)
```

**Key line:** `Started CivicConnectApplication in X.XXX seconds`

---

## 🧪 Step 8: Test the Fix

### **From Frontend:**
1. Refresh the page (F5)
2. Navigate to: Register Complaint
3. Fill out the form
4. Submit

### **Expected Result:**
```
✅ Complaint submitted successfully!
→ Redirected to /citizen/complaints
→ New complaint visible in list
```

---

## 🔍 Step 9: Verify in Backend Logs

If you enabled debug logging, you should see:

```
DEBUG o.s.s.w.FilterChainProxy - Securing POST /api/citizens/complaints
DEBUG o.s.s.w.a.i.FilterSecurityInterceptor - Authorized filter invocation [POST /api/citizens/complaints] with attributes [hasRole('ROLE_CITIZEN')]
DEBUG o.s.s.a.v.AffirmativeBased - Voter: RoleVoter, returned: 1
DEBUG o.s.s.w.a.i.FilterSecurityInterceptor - Authorization successful
INFO  c.c.c.CitizenComplaintController - Creating complaint for user: anushka@gmail.com
```

**Key indicators:**
- ✅ `attributes [hasRole('ROLE_CITIZEN')]` (not `[authenticated]`)
- ✅ `Authorization successful`
- ✅ Controller method is called

---

## 📋 Quick Checklist

- [ ] **Located backend project directory**
- [ ] **Found SecurityConfig.java file**
- [ ] **Verified current configuration**
- [ ] **Applied the fix** (changed `.authenticated()` to `.hasRole("CITIZEN")`)
- [ ] **Saved the file**
- [ ] **Restarted backend**
- [ ] **Verified "Started Application" message**
- [ ] **Tested complaint submission from frontend**
- [ ] **Got 200 OK response**
- [ ] **Complaint created successfully**

---

## 🆘 Common Issues

### **Issue 1: Can't Find Backend Directory**

**Solution:**
```powershell
# Search entire C: drive (may take time)
Get-ChildItem -Path C:\ -Recurse -Filter "SecurityConfig.java" -ErrorAction SilentlyContinue | Select-Object FullName
```

### **Issue 2: Multiple SecurityConfig.java Files**

**Solution:** Look for the one in your main project, not in:
- `target/` folder (Maven build output)
- `build/` folder (Gradle build output)
- `.m2/` folder (Maven repository)

### **Issue 3: Backend Won't Start**

**Check:**
- Port 8080 (or 8083) is not already in use
- No syntax errors in SecurityConfig.java
- All dependencies are installed (`mvn clean install`)

### **Issue 4: Still Getting 403 After Fix**

**Verify:**
- Backend was actually restarted (check console timestamp)
- SecurityConfig changes were saved
- No compilation errors
- Correct package name in SecurityConfig.java

---

## 📞 Need Help?

If you can't find the backend or SecurityConfig.java:

1. **Check your project structure:**
   ```powershell
   cd C:\Users\anush\MyProjects\ITpreneurCourse\
   dir
   ```

2. **List all Java projects:**
   ```powershell
   Get-ChildItem -Recurse -Filter "pom.xml" | Select-Object DirectoryName
   # OR for Gradle
   Get-ChildItem -Recurse -Filter "build.gradle" | Select-Object DirectoryName
   ```

3. **Share the output** and I can help you locate the exact file

---

**Follow this guide to locate, verify, and fix your SecurityConfig!** 🗺️

© 2026 CivicConnect - Backend Location & Verification Guide
