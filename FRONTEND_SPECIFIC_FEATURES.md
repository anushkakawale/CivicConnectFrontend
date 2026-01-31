# 🎨 FRONTEND-SPECIFIC FEATURES & IMPLEMENTATIONS

> **What exists in the frontend that wasn't mentioned in the backend API documentation**

---

## 📋 TABLE OF CONTENTS

1. [UI/UX Features](#1-uiux-features)
2. [Advanced Components](#2-advanced-components)
3. [State Management](#3-state-management)
4. [Utility Functions](#4-utility-functions)
5. [Styling System](#5-styling-system)
6. [Developer Tools](#6-developer-tools)
7. [Performance Optimizations](#7-performance-optimizations)
8. [Accessibility Features](#8-accessibility-features)

---

## 1️⃣ UI/UX FEATURES

### 🌓 Dark/Light Theme Toggle
**Location:** `src/contexts/ThemeContext.jsx`, `src/components/ui/ThemeToggle.jsx`

**Features:**
- Persistent theme preference (localStorage)
- Smooth transitions between themes
- CSS variable-based theming
- Available in all layouts

**Usage:**
```javascript
import { useTheme } from '../contexts/ThemeContext';

const { theme, toggleTheme } = useTheme();
```

**CSS Variables:**
```css
/* Light Theme */
--bg-primary: #ffffff;
--text-primary: #1a1a1a;
--accent-color: #2563eb;

/* Dark Theme */
--bg-primary: #1a1a1a;
--text-primary: #ffffff;
--accent-color: #3b82f6;
```

---

### 🔔 Notification Bell with Badge
**Location:** `src/components/notifications/NotificationBell.jsx`

**Features:**
- Real-time unread count badge
- Dropdown notification preview
- Auto-refresh every 30 seconds
- Click to mark as read
- Navigate to full notifications page

**Implementation:**
```javascript
// Auto-refresh unread count
useEffect(() => {
  fetchUnreadCount();
  const interval = setInterval(fetchUnreadCount, 30000);
  return () => clearInterval(interval);
}, []);
```

---

### 📊 Interactive Charts
**Location:** `src/components/charts/AnalyticsCharts.jsx`

**Chart Types:**
- **Bar Chart:** Complaint status distribution
- **Line Chart:** Monthly trends
- **Pie Chart:** Department-wise breakdown
- **Doughnut Chart:** SLA status
- **Area Chart:** Resolution time trends

**Libraries Used:**
- Chart.js
- Recharts (for advanced charts)

**Features:**
- Responsive design
- Interactive tooltips
- Click-to-filter functionality
- Export as image (planned)

---

### 🗺️ Interactive Map with Clustering
**Location:** `src/components/map/ComplaintMap.jsx`

**Features:**
- Leaflet.js integration
- Marker clustering for performance
- Color-coded markers by status:
  - 🔴 Red: BREACHED SLA
  - 🟡 Yellow: WARNING
  - 🟢 Green: ACTIVE
  - 🔵 Blue: RESOLVED
- Click marker to view complaint details
- Filter by status, priority, department
- Auto-center on user's ward
- GPS location picker for new complaints

**Custom Marker Icons:**
```javascript
const getMarkerColor = (slaStatus) => {
  switch(slaStatus) {
    case 'BREACHED': return 'red';
    case 'WARNING': return 'orange';
    case 'ACTIVE': return 'green';
    default: return 'blue';
  }
};
```

---

### 📸 Enhanced Image Upload Component
**Location:** `src/components/ui/EnhancedImageUpload.jsx`

**Features:**
- Drag-and-drop support
- Multiple image upload
- Image preview before upload
- Client-side image compression
- File size validation (max 5MB per image)
- File type validation (jpg, png, jpeg only)
- Remove image before upload
- Progress indicator during upload

**Implementation:**
```javascript
const compressImage = async (file) => {
  // Compress to max 1920x1080
  // Reduce quality to 80%
  // Return compressed blob
};
```

---

### 🖼️ Image Viewer with Zoom
**Location:** `src/components/ui/ImageViewer.jsx`

**Features:**
- Lightbox modal view
- Zoom in/out
- Pan/drag when zoomed
- Next/Previous navigation
- Download image
- Fullscreen mode
- Keyboard shortcuts (ESC, arrow keys)
- Touch gestures (mobile)

---

### ⏱️ SLA Countdown Timer
**Location:** `src/components/citizen/SLACountdown.jsx`

**Features:**
- Real-time countdown
- Color-coded urgency:
  - 🟢 Green: > 50% time remaining
  - 🟡 Yellow: 20-50% time remaining
  - 🔴 Red: < 20% time remaining
  - ⚫ Black: Breached
- Updates every minute
- Shows "Breached by X hours" if overdue

**Implementation:**
```javascript
const calculateTimeRemaining = (deadline) => {
  const now = new Date();
  const end = new Date(deadline);
  const diff = end - now;
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return { hours, minutes, isBreached: diff < 0 };
};
```

---

### 📈 Status Timeline
**Location:** `src/components/citizen/StatusTimeline.jsx`

**Features:**
- Visual timeline of complaint status changes
- Shows timestamp for each status
- Shows who updated the status
- Color-coded status badges
- Expandable notes/comments

**Visual Design:**
```
● SUBMITTED          Jan 30, 10:30 AM  (John Doe)
│
● ASSIGNED           Jan 30, 11:00 AM  (Ward Officer)
│
● IN_PROGRESS        Jan 30, 2:00 PM   (Dept Officer)
│
○ RESOLVED           (Pending)
```

---

### 🎯 Priority Badge Component
**Location:** `src/components/common/PriorityBadge/PriorityBadge.jsx`

**Features:**
- Color-coded badges:
  - 🔴 CRITICAL: Red
  - 🟠 HIGH: Orange
  - 🟡 MEDIUM: Yellow
  - 🟢 LOW: Green
- Icon + text
- Tooltip with description

---

### 🏷️ Status Badge Component
**Location:** `src/components/common/StatusBadge/StatusBadge.jsx`

**Features:**
- Dynamic color based on status
- Icon + text
- Pulsing animation for active statuses
- Tooltip with status description

---

### 📊 Stat Card Component
**Location:** `src/components/common/StatCard/StatCard.jsx`

**Features:**
- Reusable dashboard card
- Icon + title + value
- Trend indicator (up/down arrow)
- Percentage change
- Click to filter
- Loading skeleton

**Usage:**
```javascript
<StatCard
  title="Total Complaints"
  value={150}
  icon="📋"
  trend="up"
  percentage={12}
  onClick={() => filterByStatus('ALL')}
/>
```

---

### 🔍 Advanced Filtering System
**Location:** Multiple pages (MyComplaints, WardComplaints, etc.)

**Features:**
- Multi-select filters:
  - Status (multiple)
  - Priority (multiple)
  - Department (multiple)
  - SLA Status (multiple)
  - Date range
- Save filter preferences (localStorage)
- Clear all filters button
- Active filter count badge
- Filter presets (e.g., "Urgent", "Overdue")

---

### 📄 Pagination Component
**Location:** Integrated in list pages

**Features:**
- Page number buttons
- Previous/Next buttons
- Jump to page input
- Items per page selector (10, 20, 50, 100)
- Total count display
- Keyboard navigation (arrow keys)

---

### 🔔 Toast Notification System
**Location:** `src/components/ui/ToastProvider.jsx`

**Features:**
- Success, error, warning, info types
- Auto-dismiss after 5 seconds
- Manual dismiss button
- Stack multiple toasts
- Position: top-right
- Slide-in animation

**Usage:**
```javascript
import { useToast } from '../components/ui/ToastProvider';

const { showToast } = useToast();

showToast('Complaint created successfully!', 'success');
showToast('Error uploading image', 'error');
```

---

### ✅ Confirm Dialog Component
**Location:** `src/components/ui/ConfirmDialog.jsx`

**Features:**
- Reusable confirmation modal
- Custom title, message, buttons
- Danger/warning/info variants
- Async action support
- Loading state during action

**Usage:**
```javascript
<ConfirmDialog
  isOpen={showConfirm}
  title="Delete Complaint?"
  message="This action cannot be undone."
  onConfirm={handleDelete}
  onCancel={() => setShowConfirm(false)}
  variant="danger"
/>
```

---

### 🔄 Loading Spinner Component
**Location:** `src/components/ui/LoadingSpinner.jsx`

**Variants:**
- Full-page overlay
- Inline spinner
- Button spinner
- Skeleton loaders

---

### 🎨 Government-Style Button
**Location:** `src/components/ui/GovButton.jsx`

**Features:**
- Government of India color scheme
- Primary, secondary, danger variants
- Icon support
- Loading state
- Disabled state
- Ripple effect on click

---

## 2️⃣ ADVANCED COMPONENTS

### 🔐 Protected Route Component
**Location:** `src/components/auth/ProtectedRoute.jsx`

**Features:**
- Role-based access control
- Redirect to login if not authenticated
- Redirect to appropriate dashboard if wrong role
- Loading state while checking auth
- Token expiry handling

**Implementation:**
```javascript
<ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
  <SomePage />
</ProtectedRoute>
```

---

### 🧭 Breadcrumb Navigation
**Location:** Integrated in layouts

**Features:**
- Auto-generated from route
- Click to navigate
- Current page highlighted
- Home icon for root

**Example:**
```
🏠 Home > Complaints > Complaint #123
```

---

### 📱 Responsive Sidebar
**Location:** `src/layouts/CitizenLayout.jsx` (and others)

**Features:**
- Collapsible on mobile
- Hamburger menu toggle
- Active route highlighting
- Icon + text (desktop), icon only (collapsed)
- Smooth transitions
- Overlay on mobile

---

### 🔝 Top Bar with User Menu
**Location:** `src/components/common/EnhancedTopBar.jsx`

**Features:**
- User name and role display
- Notification bell with badge
- Theme toggle
- User dropdown menu:
  - Profile
  - Settings
  - Logout
- Breadcrumb navigation
- Search bar (planned)

---

### 📋 Data Table Component
**Location:** Used in various list pages

**Features:**
- Sortable columns
- Searchable
- Filterable
- Pagination
- Row selection (checkbox)
- Bulk actions
- Export to CSV (planned)
- Responsive (card view on mobile)

---

### 📅 Date Range Picker
**Location:** Used in analytics pages

**Features:**
- Calendar popup
- Preset ranges (Today, Last 7 days, Last 30 days, Custom)
- Min/max date validation
- Clear button

---

### 🎭 Modal Component
**Location:** `src/components/ui/Modal.jsx`

**Features:**
- Backdrop click to close
- ESC key to close
- Prevent body scroll when open
- Smooth fade-in/out animation
- Custom header, body, footer
- Sizes: small, medium, large, fullscreen

---

## 3️⃣ STATE MANAGEMENT

### 🔄 Redux Toolkit Store
**Location:** `src/store/store.js`

**Slices:**
- `authSlice`: User authentication state
- `complaintsSlice`: Complaints data (planned)
- `notificationsSlice`: Notifications (planned)

**Current Implementation:**
```javascript
// Auth state
{
  user: { id, name, email, role },
  token: 'jwt_token',
  isAuthenticated: true,
  loading: false,
  error: null
}
```

---

### 🌐 Master Data Context
**Location:** `src/contexts/MasterDataContext.jsx`

**Purpose:** Cache wards and departments to avoid repeated API calls

**Features:**
- Fetch on app load
- Cache in context
- Refresh on demand
- Error handling

**Usage:**
```javascript
import { useMasterData } from '../contexts/MasterDataContext';

const { wards, departments, loading, refresh } = useMasterData();
```

---

### 🎨 Theme Context
**Location:** `src/contexts/ThemeContext.jsx`

**Features:**
- Global theme state (light/dark)
- Persist in localStorage
- Toggle function
- CSS variable injection

---

### 🪝 Custom Hooks

#### `useAuth()`
**Location:** `src/hooks/useAuth.js`

**Returns:**
```javascript
{
  user,
  token,
  isAuthenticated,
  login,
  logout,
  register,
  updateProfile
}
```

---

#### `useComplaints()`
**Location:** `src/hooks/useComplaints.js`

**Returns:**
```javascript
{
  complaints,
  loading,
  error,
  fetchComplaints,
  createComplaint,
  updateComplaint,
  deleteComplaint
}
```

---

#### `useNotifications()`
**Location:** `src/hooks/useNotifications.js`

**Returns:**
```javascript
{
  notifications,
  unreadCount,
  loading,
  markAsRead,
  markAllAsRead,
  deleteNotification
}
```

---

#### `useMasterData()`
**Location:** `src/hooks/useMasterData.js`

**Returns:**
```javascript
{
  wards,
  departments,
  loading,
  error,
  refresh
}
```

---

#### `useTheme()`
**Location:** `src/hooks/useTheme.js`

**Returns:**
```javascript
{
  theme, // 'light' or 'dark'
  toggleTheme,
  setTheme
}
```

---

## 4️⃣ UTILITY FUNCTIONS

### 📅 Date Formatter
**Location:** `src/utils/dateFormatter.js`

**Functions:**
```javascript
formatDate(date)              // "Jan 30, 2026"
formatDateTime(date)          // "Jan 30, 2026 10:30 AM"
formatRelativeTime(date)      // "2 hours ago"
formatTimeRemaining(deadline) // "18 hours 30 minutes"
```

---

### 🛡️ Error Handler
**Location:** `src/utils/errorHandler.js`

**Functions:**
```javascript
handleApiError(error)         // Extract user-friendly message
logError(error, context)      // Log to console/service
showErrorToast(error)         // Display toast notification
```

---

### 🖼️ Image Utils
**Location:** `src/utils/imageUtils.js`

**Functions:**
```javascript
compressImage(file, maxWidth, maxHeight, quality)
validateImageFile(file)       // Check size and type
getImageDimensions(file)      // Return { width, height }
convertToBase64(file)         // For preview
```

---

### ⏱️ SLA Calculator
**Location:** `src/utils/slaCalculator.js`

**Functions:**
```javascript
calculateSLADeadline(createdAt, slaHours)
calculateTimeRemaining(deadline)
getSLAStatus(deadline)        // ACTIVE, WARNING, BREACHED
getSLAPercentage(createdAt, deadline)
```

---

### 🏷️ Status Helpers
**Location:** `src/utils/statusHelpers.js`

**Functions:**
```javascript
getStatusColor(status)        // Return CSS color
getStatusIcon(status)         // Return emoji/icon
getNextStatus(currentStatus)  // Return next allowed status
canUpdateStatus(status, role) // Check permission
```

---

### ✅ Validators
**Location:** `src/utils/validators.js`

**Functions:**
```javascript
validateEmail(email)
validateMobile(mobile)        // Indian mobile number
validatePassword(password)    // Min 8 chars, 1 upper, 1 lower, 1 number
validateRequired(value)
validateFileSize(file, maxMB)
validateFileType(file, allowedTypes)
```

---

## 5️⃣ STYLING SYSTEM

### 🎨 CSS Architecture

**Global Styles:** `src/index.css`
- CSS reset
- Typography
- Utility classes
- Animations

**Theme Variables:** `src/styles/variables.css`
```css
:root {
  /* Colors */
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
}
```

**Role-Specific Styles:**
- `src/styles/citizen.css`
- `src/styles/ward.css`
- `src/styles/department.css`
- `src/styles/admin.css`

**Component Styles:**
- CSS Modules (`.module.css`)
- Scoped to component
- No global pollution

---

### 🎭 Animations

**Location:** `src/index.css`

**Available Animations:**
```css
@keyframes fadeIn { ... }
@keyframes slideInRight { ... }
@keyframes slideInLeft { ... }
@keyframes pulse { ... }
@keyframes spin { ... }
@keyframes bounce { ... }
```

**Usage:**
```css
.notification {
  animation: slideInRight 0.3s ease-out;
}
```

---

### 📱 Responsive Breakpoints

```css
/* Mobile First */
/* Base: 0-639px */

/* Tablet */
@media (min-width: 640px) { ... }

/* Desktop */
@media (min-width: 1024px) { ... }

/* Large Desktop */
@media (min-width: 1280px) { ... }
```

---

## 6️⃣ DEVELOPER TOOLS

### 🐛 Debug Panel
**Location:** `src/components/DebugPanel.jsx`

**Features:**
- Shows current user, role, token
- API base URL
- Environment variables
- Local storage contents
- Toggle visibility (Ctrl+Shift+D)
- Only visible in development mode

---

### 🔍 API Diagnostic Page
**Location:** `src/pages/ApiDiagnostic.jsx`

**Features:**
- Test all API endpoints
- View request/response
- Check authentication
- Test file uploads
- View API errors
- Export test results

**Access:** `http://localhost:5173/diagnostic`

---

### 🚨 Error Boundary
**Location:** `src/components/ErrorBoundary.jsx`

**Features:**
- Catch React errors
- Display user-friendly error page
- Log errors to console
- Reload button
- Error details (dev mode only)

---

### 📊 Redux DevTools Integration
**Enabled in development mode**

**Features:**
- View state changes
- Time-travel debugging
- Action replay
- State diff

---

## 7️⃣ PERFORMANCE OPTIMIZATIONS

### ⚡ Code Splitting
**Implementation:** React.lazy + Suspense

```javascript
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

<Suspense fallback={<LoadingSpinner />}>
  <AdminDashboard />
</Suspense>
```

---

### 🗂️ Image Lazy Loading
**Implementation:** Native lazy loading

```javascript
<img src={imageUrl} loading="lazy" alt="..." />
```

---

### 💾 Local Storage Caching
**Cached Data:**
- JWT token
- User preferences
- Theme selection
- Filter preferences
- Master data (wards, departments)

---

### 🔄 Debounced Search
**Implementation:**

```javascript
const debouncedSearch = useCallback(
  debounce((query) => {
    fetchResults(query);
  }, 500),
  []
);
```

---

### 📦 Memoization
**Usage:**

```javascript
const expensiveCalculation = useMemo(() => {
  return calculateSLA(complaints);
}, [complaints]);

const handleClick = useCallback(() => {
  doSomething();
}, [dependency]);
```

---

## 8️⃣ ACCESSIBILITY FEATURES

### ♿ ARIA Labels
**Implementation:**

```javascript
<button aria-label="Close notification">
  <CloseIcon />
</button>

<input aria-describedby="email-error" />
<span id="email-error" role="alert">Invalid email</span>
```

---

### ⌨️ Keyboard Navigation
**Features:**
- Tab navigation
- Enter to submit
- ESC to close modals
- Arrow keys for pagination
- Space to toggle checkboxes

---

### 🎨 Color Contrast
**WCAG AA Compliance:**
- Text contrast ratio: 4.5:1
- Large text: 3:1
- Interactive elements: 3:1

---

### 📱 Screen Reader Support
**Features:**
- Semantic HTML
- ARIA roles
- Live regions for notifications
- Skip to main content link

---

## 🎯 SUMMARY

### What Makes This Frontend Special

✅ **Professional UI/UX** - Government-style design with modern aesthetics  
✅ **Comprehensive Components** - 50+ reusable components  
✅ **Advanced Features** - Dark mode, real-time updates, interactive maps  
✅ **Performance Optimized** - Code splitting, lazy loading, caching  
✅ **Developer Friendly** - Debug tools, error boundaries, TypeScript-ready  
✅ **Accessible** - ARIA labels, keyboard navigation, screen reader support  
✅ **Responsive** - Mobile-first design, works on all devices  
✅ **Maintainable** - Clean code, modular structure, well-documented  

---

## 📚 ADDITIONAL NOTES

### Frontend-Specific Constants
**Location:** `src/constants.js`

**Includes:**
- Complaint status definitions with colors and icons
- Complaint flow (state machine)
- Image upload stages
- Notification types
- Departments (fallback data)
- Wards (fallback data)
- SLA status definitions
- Feedback ratings

---

### Environment Variables
**Location:** `.env` or `.env.development`

```env
VITE_API_BASE_URL=http://localhost:8083/api
VITE_APP_NAME=CivicConnect
VITE_ENABLE_DEBUG=true
```

---

### Browser Support
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE 11 (not supported)

---

**🎉 This document covers ALL frontend-specific features not mentioned in the backend API documentation!**
