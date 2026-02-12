# 📋 Complete Complaint Status Reference Guide

## 🎯 All Supported Statuses

### **1. SUBMITTED / NEW**
- **Color**: Gray (#64748B)
- **Icon**: 📥 Inbox
- **Display**: "NEW"
- **Meaning**: Complaint just filed by citizen
- **Who can set**: Citizen (automatic on creation)
- **Next possible states**: ASSIGNED, REJECTED

---

### **2. ASSIGNED**
- **Color**: Blue (#3B82F6)
- **Icon**: ✅ UserCheck
- **Display**: "ASSIGNED"
- **Meaning**: Ward Officer assigned to Department Officer
- **Who can set**: Ward Officer
- **Next possible states**: IN_PROGRESS, ON_HOLD, REJECTED

---

### **3. IN_PROGRESS / WORKING**
- **Color**: Orange (#F59E0B)
- **Icon**: ⏳ Hourglass
- **Display**: "IN PROGRESS"
- **Meaning**: Department Officer actively working on it
- **Who can set**: Department Officer
- **Next possible states**: RESOLVED, ON_HOLD, ESCALATED

---

### **4. ON_HOLD**
- **Color**: Purple (#8B5CF6)
- **Icon**: ⏸️ Pause
- **Display**: "ON HOLD"
- **Meaning**: Temporarily paused (awaiting resources/approval)
- **Who can set**: Department Officer
- **Next possible states**: IN_PROGRESS, REJECTED

---

### **5. RESOLVED**
- **Color**: Green (#10B981)
- **Icon**: 🛡️ ShieldCheck
- **Display**: "RESOLVED"
- **Meaning**: Department Officer claims work is complete
- **Who can set**: Department Officer
- **Next possible states**: APPROVED, REOPENED

---

### **6. PENDING_APPROVAL**
- **Color**: Indigo (#6366F1)
- **Icon**: 🕐 Clock
- **Display**: "PENDING APPROVAL"
- **Meaning**: Awaiting Ward Officer verification
- **Who can set**: System (automatic after RESOLVED)
- **Next possible states**: APPROVED, REOPENED

---

### **7. APPROVED**
- **Color**: Dark Green (#059669)
- **Icon**: ✔️ CheckCircle
- **Display**: "APPROVED"
- **Meaning**: Ward Officer verified the resolution
- **Who can set**: Ward Officer
- **Next possible states**: CLOSED, REOPENED

---

### **8. CLOSED**
- **Color**: Dark Gray (#1E293B)
- **Icon**: ☑️ CheckSquare
- **Display**: "CLOSED"
- **Meaning**: Admin final closure, case complete
- **Who can set**: Admin
- **Next possible states**: REOPENED (within 7 days)

---

### **9. REJECTED**
- **Color**: Red (#EF4444)
- **Icon**: ❌ XCircle
- **Display**: "REJECTED"
- **Meaning**: Complaint deemed invalid/spam
- **Who can set**: Admin
- **Next possible states**: None (terminal state)

---

### **10. REOPENED**
- **Color**: Pink (#EC4899)
- **Icon**: 🔄 RefreshCw
- **Display**: "REOPENED"
- **Meaning**: Citizen disputed resolution (within 7 days)
- **Who can set**: Citizen
- **Next possible states**: IN_PROGRESS, RESOLVED

---

### **11. ESCALATED**
- **Color**: Dark Red (#B91C1C)
- **Icon**: 🚨 ShieldAlert
- **Display**: "ESCALATED"
- **Meaning**: SLA breached, escalated to higher authority
- **Who can set**: System (automatic on SLA breach)
- **Next possible states**: IN_PROGRESS, RESOLVED

---

## 🔄 Status Flow Diagram

```
┌─────────────┐
│  SUBMITTED  │ ← Citizen creates complaint
└──────┬──────┘
       │
       ├─→ [REJECTED] (Admin marks invalid)
       │
       ▼
┌─────────────┐
│  ASSIGNED   │ ← Ward Officer assigns to Dept Officer
└──────┬──────┘
       │
       ├─→ [ON_HOLD] (Awaiting resources)
       │       │
       │       └─→ [IN_PROGRESS]
       │
       ▼
┌─────────────┐
│IN_PROGRESS  │ ← Dept Officer working
└──────┬──────┘
       │
       ├─→ [ESCALATED] (SLA breached)
       │       │
       │       └─→ [IN_PROGRESS]
       │
       ▼
┌─────────────┐
│  RESOLVED   │ ← Dept Officer completes work
└──────┬──────┘
       │
       ├─→ [REOPENED] (Citizen disputes)
       │       │
       │       └─→ [IN_PROGRESS]
       │
       ▼
┌─────────────┐
│  APPROVED   │ ← Ward Officer verifies
└──────┬──────┘
       │
       ├─→ [REOPENED] (Citizen disputes)
       │
       ▼
┌─────────────┐
│   CLOSED    │ ← Admin final closure
└──────┬──────┘
       │
       └─→ [REOPENED] (within 7 days)
```

---

## 👥 Role-Based Permissions

| Status | Citizen | Ward Officer | Dept Officer | Admin | System |
|--------|---------|--------------|--------------|-------|--------|
| **SUBMITTED** | ✅ Create | View | View | View | - |
| **ASSIGNED** | View | ✅ Set | View | View | - |
| **IN_PROGRESS** | View | View | ✅ Set | View | - |
| **ON_HOLD** | View | View | ✅ Set | View | - |
| **RESOLVED** | View | View | ✅ Set | View | - |
| **APPROVED** | View | ✅ Set | View | View | - |
| **CLOSED** | View | View | View | ✅ Set | - |
| **REJECTED** | View | View | View | ✅ Set | - |
| **REOPENED** | ✅ Set | View | View | View | - |
| **ESCALATED** | View | View | View | View | ✅ Auto |

---

## 🎨 Visual Color Guide

**Quick Reference**:
- 🔴 **Red Family**: REJECTED, ESCALATED (Problems)
- 🟡 **Orange**: IN_PROGRESS (Active work)
- 🟢 **Green Family**: RESOLVED, APPROVED (Success)
- 🔵 **Blue**: ASSIGNED (Dispatched)
- 🟣 **Purple**: ON_HOLD (Paused)
- ⚫ **Gray**: SUBMITTED, CLOSED (Start/End)
- 🌸 **Pink**: REOPENED (Disputed)

---

## 📱 Frontend Usage

### **StatusBadge Component**

```jsx
import StatusBadge from '../../components/ui/StatusBadge';

// Default size (md)
<StatusBadge status="IN_PROGRESS" />

// Small size
<StatusBadge status="RESOLVED" size="sm" />

// Large size
<StatusBadge status="ESCALATED" size="lg" />

// Without icon
<StatusBadge status="APPROVED" showIcon={false} />
```

### **SlaCard Component**

```jsx
import SlaCard from '../../components/ui/SlaCard';

// Default size (md)
<SlaCard complaint={complaint} />

// Small size
<SlaCard complaint={complaint} size="sm" />
```

---

## 🔔 Notification Triggers

| Status Change | Notify Citizen | Notify Officer | Notify Admin |
|---------------|----------------|----------------|--------------|
| SUBMITTED → ASSIGNED | ✅ | ✅ (Dept Officer) | - |
| ASSIGNED → IN_PROGRESS | ✅ | - | - |
| IN_PROGRESS → RESOLVED | ✅ | ✅ (Ward Officer) | - |
| RESOLVED → APPROVED | ✅ | - | - |
| APPROVED → CLOSED | ✅ | - | - |
| Any → REJECTED | ✅ | - | - |
| Any → ESCALATED | ✅ | ✅ (All Officers) | ✅ |
| CLOSED → REOPENED | - | ✅ (Assigned Officer) | ✅ |

---

## ⏰ SLA Status Integration

**SLA statuses work alongside complaint statuses**:

| SLA Status | Complaint Status | Action |
|------------|------------------|--------|
| **ON_TRACK** | Any active status | Normal workflow |
| **WARNING** | IN_PROGRESS | Officer notified (2hrs left) |
| **BREACHED** | Any active status | Auto-set to ESCALATED |
| **MET** | RESOLVED/APPROVED/CLOSED | Success metric |

---

## ✅ Best Practices

1. **Always use StatusBadge component** - Don't create custom status displays
2. **Check permissions** - Only allow authorized users to change statuses
3. **Log all changes** - Maintain audit trail in complaint history
4. **Notify stakeholders** - Send notifications on status changes
5. **Validate transitions** - Ensure status changes follow the flow diagram
6. **Display SLA info** - Always show SLA status alongside complaint status
7. **Use consistent colors** - Follow the color guide for visual consistency

---

## 🚀 Quick Reference Table

| Status | Short Code | Color | Priority |
|--------|-----------|-------|----------|
| NEW | `SUB` | Gray | - |
| ASSIGNED | `ASG` | Blue | Medium |
| IN PROGRESS | `WIP` | Orange | High |
| ON HOLD | `HLD` | Purple | Low |
| RESOLVED | `RES` | Green | - |
| APPROVED | `APR` | Dark Green | - |
| CLOSED | `CLS` | Black | - |
| REJECTED | `REJ` | Red | - |
| REOPENED | `ROP` | Pink | High |
| ESCALATED | `ESC` | Dark Red | Critical |

---

**This guide ensures consistent status handling across the entire CivicConnect platform!** 🎯
