# 🎯 WARD OFFICER ENHANCEMENTS - Implementation Plan

## ✅ **REQUIREMENTS SUMMARY**

Based on your request, here are the enhancements needed:

### **1. Pending Approvals Page** (`/ward-officer/approvals`)
- ✅ Show all RESOLVED complaints waiting for approval
- ✅ Display count in dashboard stats
- ✅ Update count after approve/reject

### **2. Dashboard Stats**
- ✅ "Pending Approvals" count must update in real-time
- ✅ Decrease by 1 after approve/reject action

### **3. Image Attribution**
- ✅ Show who uploaded each image
- ✅ Show when image was uploaded
- ✅ Display uploader name and timestamp on every image
- ✅ Visible to ALL users (Citizen, Department Officer, Ward Officer, Admin)

### **4. Activity Timeline**
- ✅ Move to right sidebar (below Quick Info)
- ✅ Show all complaint activities
- ✅ Track status changes, assignments, uploads, approvals

### **5. UI Improvements**
- ✅ Fix approve/reject sticky footer (not blocking content)
- ✅ Better spacing and layout
- ✅ Premium design consistency

### **6. SLA Status**
- ✅ Display in all complaint detail pages
- ✅ Show status, deadline, elapsed time
- ✅ Color-coded (green=on track, yellow=at risk, red=breached)

---

## 🔧 **IMPLEMENTATION STEPS**

### **Step 1: Enhance Image Display with Attribution**

**Files to Update**:
- `src/pages/department/DepartmentComplaintDetail.jsx`
- `src/pages/ward/WardComplaintDetail.jsx`
- `src/pages/citizen/CitizenComplaintDetail.jsx` (if exists)
- `src/pages/admin/AdminComplaintDetail.jsx` (if exists)

**Changes**:
```javascript
// Enhanced image display with attribution
{beforeWorkImages.map((img, idx) => (
    <div key={idx} className="col-6 col-md-4">
        <div className="position-relative rounded-3 overflow-hidden border shadow-sm">
            <img
                src={getImageUrl(img.imageUrl || img, id)}
                alt="Before work"
                className="w-100"
                style={{ height: '180px', objectFit: 'cover' }}
            />
            {/* Attribution Badge */}
            <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white p-2">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <div className="extra-small fw-bold">
                            {img.uploadedBy || 'Citizen'}
                        </div>
                        <div className="extra-small opacity-75">
                            {img.uploadedAt ? new Date(img.uploadedAt).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                    <div className="extra-small opacity-75">
                        {img.uploadedAt ? new Date(img.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                </div>
            </div>
        </div>
    </div>
))}
```

---

### **Step 2: Move Timeline to Right Sidebar**

**Current**: Timeline is in left column  
**New**: Move below Quick Info in right sidebar

**Changes**:
```javascript
{/* Right Column */}
<div className="col-lg-4">
    {/* SLA Status Card */}
    {slaInfo && (...)}
    
    {/* Quick Info Card */}
    <div className="card border-0 shadow-premium rounded-4 mb-4">
        {/* Quick Info content */}
    </div>
    
    {/* NEW: Activity Timeline Card */}
    {timeline && timeline.length > 0 && (
        <div className="card border-0 shadow-premium rounded-4 mb-4">
            <div className="card-header py-4 px-5 border-0 bg-white">
                <h6 className="mb-0 fw-black text-dark extra-small uppercase tracking-widest">
                    Activity Timeline
                </h6>
            </div>
            <div className="card-body p-4">
                {timeline.map((event, index) => (
                    <div key={index} className="timeline-item mb-3 pb-3 border-bottom">
                        <div className="d-flex align-items-start gap-2">
                            <div className="rounded-circle bg-primary bg-opacity-10 p-2 flex-shrink-0">
                                <Activity size={14} style={{ color: PRIMARY_COLOR }} />
                            </div>
                            <div className="flex-grow-1">
                                <div className="fw-bold extra-small text-dark">
                                    {event.status || event.action}
                                </div>
                                <div className="extra-small text-muted">
                                    {event.remarks || event.description}
                                </div>
                                <div className="extra-small text-muted opacity-75 mt-1">
                                    {new Date(event.timestamp || event.createdAt).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )}
    
    {/* Citizen Feedback (if exists) */}
    {(complaint.rating || complaint.feedback) && (...)}
</div>
```

---

### **Step 3: Fix Approve/Reject Sticky Footer**

**Problem**: Footer blocks content and buttons overlap

**Solution**: Better layout with proper spacing

**Changes**:
```javascript
{/* Sticky Action Footer for Review */}
{canReview && (
    <div className="fixed-bottom bg-white border-top shadow-lg slide-up-animation" 
         style={{ zIndex: 1020 }}>
        <div className="container-fluid px-4 py-3">
            <div className="row g-3 align-items-center">
                {/* Remarks Input - Full width on mobile, 60% on desktop */}
                <div className="col-12 col-md-7">
                    <label className="form-label extra-small fw-black text-muted uppercase tracking-widest mb-2">
                        Decision Remarks <span className="text-danger">*</span>
                    </label>
                    <textarea
                        className="form-control rounded-3 bg-light border-0 px-3"
                        rows="2"
                        placeholder="Enter your verification comments..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        maxLength={500}
                    />
                    <div className="extra-small text-muted mt-1">
                        {remarks.length}/500 characters
                    </div>
                </div>
                
                {/* Action Buttons - Full width on mobile, 40% on desktop */}
                <div className="col-12 col-md-5">
                    <div className="d-flex gap-2 justify-content-end">
                        <button
                            onClick={() => setShowModal('REJECT')}
                            disabled={actionLoading || !remarks.trim()}
                            className="btn btn-outline-danger rounded-pill px-4 py-2 fw-black extra-small flex-grow-1 flex-md-grow-0"
                        >
                            <XCircle size={16} className="me-2" />
                            REJECT
                        </button>
                        <button
                            onClick={() => setShowModal('APPROVE')}
                            disabled={actionLoading || !remarks.trim()}
                            className="btn btn-success rounded-pill px-4 py-2 fw-black extra-small flex-grow-1 flex-md-grow-0"
                            style={{ backgroundColor: '#10B981' }}
                        >
                            <CheckCircle size={16} className="me-2" />
                            APPROVE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
)}
```

---

### **Step 4: Enhanced SLA Display**

**Add color-coded SLA status**:

```javascript
// SLA Status Colors
const getSlaStatusColor = (status) => {
    switch(status) {
        case 'ON_TRACK': return '#10B981'; // Green
        case 'AT_RISK': return '#F59E0B';  // Yellow
        case 'BREACHED': return '#EF4444'; // Red
        default: return '#6B7280';          // Gray
    }
};

// SLA Card with enhanced styling
<div className="card border-0 shadow-premium rounded-4 mb-4">
    <div className="card-header py-4 px-5 border-0" 
         style={{ background: `linear-gradient(135deg, ${getSlaStatusColor(slaInfo.status)} 0%, ${getSlaStatusColor(slaInfo.status)}dd 100%)` }}>
        <div className="d-flex align-items-center gap-3">
            <Clock className="text-white" size={20} />
            <h6 className="text-white mb-0 fw-black extra-small uppercase tracking-widest">
                SLA Status
            </h6>
        </div>
    </div>
    <div className="card-body p-4">
        <div className="mb-3 pb-3 border-bottom">
            <label className="extra-small fw-black text-muted uppercase tracking-widest mb-2">
                Status
            </label>
            <div className="d-flex align-items-center gap-2">
                <div className="rounded-circle" 
                     style={{ width: '12px', height: '12px', backgroundColor: getSlaStatusColor(slaInfo.status) }}>
                </div>
                <p className="fw-black mb-0" style={{ color: getSlaStatusColor(slaInfo.status) }}>
                    {slaInfo.status || 'ACTIVE'}
                </p>
            </div>
        </div>
        {/* Rest of SLA info */}
    </div>
</div>
```

---

### **Step 5: Dashboard Stats Update**

**File**: `src/pages/ward/WardOfficerDashboard.jsx`

**Add real-time update after approve/reject**:

```javascript
// In WardComplaintDetail.jsx, after successful approve/reject
const handleApprove = async () => {
    try {
        setActionLoading(true);
        await apiService.wardOfficer.approveComplaint(id, { remarks: remarks.trim() });
        showToast('Complaint approved successfully!', 'success');
        
        // Trigger dashboard refresh (use context or event)
        window.dispatchEvent(new Event('complaint-status-changed'));
        
        navigate('/ward-officer/dashboard');
    } catch (error) {
        console.error('Approval failed:', error);
        showToast(error.response?.data?.message || 'Failed to approve complaint', 'error');
    } finally {
        setActionLoading(false);
    }
};
```

---

### **Step 6: Pending Approvals Page**

**File**: `src/pages/ward/WardApprovals.jsx`

**Create new page showing RESOLVED complaints**:

```javascript
const WardApprovals = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        loadPendingApprovals();
    }, []);
    
    const loadPendingApprovals = async () => {
        try {
            setLoading(true);
            const response = await apiService.wardOfficer.getComplaints({ status: 'RESOLVED' });
            setComplaints(response.data?.content || response.data || []);
        } catch (error) {
            console.error('Failed to load approvals:', error);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="ward-approvals">
            <DashboardHeader
                portalName="Ward Officer Portal"
                userName="Pending Approvals"
                subtitle={`${complaints.length} complaints awaiting review`}
            />
            
            <div className="container-fluid px-4 mt-4">
                <div className="row g-4">
                    {complaints.map(complaint => (
                        <div key={complaint.complaintId} className="col-12 col-md-6 col-lg-4">
                            <div className="card border-0 shadow-premium rounded-4 hover-up cursor-pointer"
                                 onClick={() => navigate(`/ward-officer/complaints/${complaint.complaintId}`)}>
                                {/* Complaint card content */}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
```

---

## 📊 **BACKEND DATA REQUIREMENTS**

For these enhancements to work, the backend must provide:

### **Image Objects with Attribution**:
```json
{
    "imageUrl": "/uploads/complaints/4/image.jpg",
    "uploadedBy": "Officer Sharma",
    "uploadedAt": "2026-02-10T15:30:00",
    "stage": "SUBMISSION"
}
```

### **Timeline Events**:
```json
[
    {
        "action": "COMPLAINT_SUBMITTED",
        "status": "SUBMITTED",
        "description": "Complaint registered by citizen",
        "timestamp": "2026-02-10T10:00:00",
        "performedBy": "John Doe"
    },
    {
        "action": "OFFICER_ASSIGNED",
        "status": "ASSIGNED",
        "description": "Assigned to Officer Sharma",
        "timestamp": "2026-02-10T11:00:00",
        "performedBy": "Ward Officer Kumar"
    }
]
```

### **SLA Information**:
```json
{
    "status": "ON_TRACK",  // or "AT_RISK", "BREACHED"
    "slaDeadline": "2026-02-15T10:00:00",
    "elapsedHours": 24,
    "remainingHours": 96
}
```

---

## ✅ **TESTING CHECKLIST**

After implementation:

- [ ] Images show uploader name and timestamp
- [ ] Timeline appears in right sidebar below Quick Info
- [ ] Approve/reject footer doesn't block content
- [ ] Dashboard "Pending Approvals" count updates after action
- [ ] SLA status shows correct color (green/yellow/red)
- [ ] Approvals page shows only RESOLVED complaints
- [ ] All users can see image attribution
- [ ] Activity timeline shows all events

---

## 🎯 **PRIORITY ORDER**

1. **HIGH**: Image attribution (all users need this)
2. **HIGH**: Fix approve/reject UI (blocking issue)
3. **MEDIUM**: Move timeline to sidebar
4. **MEDIUM**: Dashboard stats update
5. **LOW**: Enhanced SLA colors

---

**Ready to implement?** Let me know and I'll start applying these changes!
