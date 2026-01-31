# 🔐 CivicConnect - Test Credentials & Login Guide

## Backend Status
✅ Backend is running on: `http://localhost:8083/api`
✅ Master data (Wards & Departments) loading successfully
✅ Authentication endpoints working

## Test Credentials

### For Testing Login
Since you're seeing "Bad credentials" errors, you need to use valid credentials from your backend database. Here's how to test:

#### Option 1: Create a New Citizen Account
1. Click "Create an account" on the login page
2. Fill in the registration form with:
   - Name: Test Citizen
   - Email: test@example.com
   - Mobile: 1234567890
   - Password: password123
   - Select a Ward
   - Enter Address

#### Option 2: Use Existing Credentials
Check your backend database for existing users:
```sql
SELECT email, role FROM users;
```

### Common Test Credentials (if seeded in backend)
```
Citizen:
Email: citizen@test.com
Password: password123

Ward Officer:
Email: ward@test.com
Password: password123

Department Officer:
Email: dept@test.com
Password: password123

Admin:
Email: admin@test.com
Password: password123
```

## Troubleshooting Login Issues

### Issue: "Bad credentials" Error
**Causes:**
1. ❌ Email doesn't exist in database
2. ❌ Password is incorrect
3. ❌ User account is inactive/disabled

**Solutions:**
1. ✅ Register a new account first
2. ✅ Check backend logs for exact error
3. ✅ Verify user exists in database
4. ✅ Reset password if needed

### Issue: Login succeeds but redirects to wrong page
**Solution:** Check the user's role in the database matches expected role

### Issue: Token not being saved
**Solution:** Check browser console - should see "💾 Auth data saved to localStorage"

## Debug Tools

### 1. Debug Panel (Ctrl+Shift+D)
Press `Ctrl+Shift+D` anywhere in the app to open the debug panel which shows:
- Authentication status
- Current role
- User ID
- JWT token (with copy button)
- Decoded token payload
- User object

### 2. Browser Console Logs
The app provides detailed logging:
- 🚀 API Request logs (method, URL, headers, data)
- ✅ API Success logs (status, duration, response)
- ❌ API Error logs (status, error type, message)
- 💾 Auth data save confirmations
- 🎉 Redirect confirmations

### 3. Network Tab
Check browser DevTools > Network tab to see:
- Request payload
- Response status
- Response body
- Headers

## Expected Login Flow

1. **User enters credentials** → Form validation
2. **Submit login** → POST `/api/auth/login`
3. **Backend validates** → Returns token + user data
4. **Frontend saves auth** → localStorage (token, user, role)
5. **Redirect to dashboard** → Based on user role:
   - CITIZEN → `/citizen/dashboard`
   - WARD_OFFICER → `/ward-officer/dashboard`
   - DEPARTMENT_OFFICER → `/department-officer/dashboard`
   - ADMIN → `/admin/dashboard`

## API Endpoints Reference

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Citizen registration
- `POST /api/auth/logout` - Logout (optional)

### Master Data (Public)
- `GET /api/wards` - Get all wards
- `GET /api/departments` - Get all departments

## Next Steps After Successful Login

### For Citizens:
1. View Dashboard - See complaint statistics
2. Register Complaint - Create new complaint
3. My Complaints - View your complaints
4. Area Complaints - See complaints in your ward
5. Officer Directory - Find contact info

### For Ward Officers:
1. View Dashboard - Ward statistics
2. Approval Queue - Approve/reject complaints
3. Assign Complaints - Assign to department officers
4. Manage Officers - View department officers

### For Department Officers:
1. View Dashboard - Department statistics
2. My Complaints - Assigned complaints
3. Update Status - Mark in progress/resolved
4. Upload Images - Before/after photos

### For Admins:
1. View Dashboard - System-wide statistics
2. User Management - Create/edit/delete users
3. Complaint Management - View all complaints
4. Analytics - System reports
5. Officer Directory - All officers

## Common Issues & Fixes

### 1. "Bad credentials" even with correct password
```bash
# Check if password is hashed in database
# Backend should use BCrypt for password hashing
```

### 2. Login succeeds but page doesn't redirect
```javascript
// Check console for: "🎉 Redirecting to: /citizen/dashboard"
// If missing, check authService.getDashboardRoute()
```

### 3. Token not being sent with requests
```javascript
// Check Network tab > Request Headers
// Should see: Authorization: Bearer <token>
```

### 4. 401 Unauthorized after login
```javascript
// Token might be expired or invalid
// Clear localStorage and login again
localStorage.clear();
```

## Testing Checklist

- [ ] Backend is running on port 8083
- [ ] Can access http://localhost:8083/api/wards
- [ ] Can access http://localhost:8083/api/departments
- [ ] Frontend is running on port 5173 (or configured port)
- [ ] No CORS errors in console
- [ ] Can register new citizen account
- [ ] Can login with valid credentials
- [ ] Token is saved to localStorage
- [ ] Redirects to correct dashboard
- [ ] Can access protected routes
- [ ] Can logout successfully

## Support

If you continue to face issues:
1. Check backend logs for detailed error messages
2. Use the Debug Panel (Ctrl+Shift+D) to inspect auth state
3. Verify database has user with correct credentials
4. Check if backend password hashing matches frontend expectations
5. Ensure backend returns correct response format:
   ```json
   {
     "token": "eyJhbGc...",
     "role": "CITIZEN",
     "email": "user@example.com",
     "name": "User Name",
     "userId": 123
   }
   ```
