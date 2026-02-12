# 🎨 CivicConnect Design System - Quick Reference

## 🌈 Color Palette

### Primary Colors
```css
--primary-blue: #244799;        /* Main brand color - Professional Government Blue */
--primary-dark: #1a3a7a;        /* Darker shade for gradients */
--primary-light: #2d5bb3;       /* Lighter shade for hover states */
```

### Status Colors
```css
--success: #10B981;             /* Green - Success, completed */
--warning: #F59E0B;             /* Amber - Warning, pending */
--danger: #EF4444;              /* Red - Error, critical */
--info: #3B82F6;                /* Blue - Information */
```

### Neutral Colors
```css
--white: #FFFFFF;
--gray-50: #F8FAFC;
--gray-100: #F1F5F9;
--gray-200: #E2E8F0;
--gray-300: #CBD5E1;
--gray-400: #94A3B8;
--gray-500: #64748B;
--gray-600: #475569;
--gray-700: #334155;
--gray-800: #1E293B;
--gray-900: #0F172A;
--black: #000000;
```

### Background Gradients
```css
/* Primary Gradient (Login/Header) */
background: linear-gradient(135deg, #244799 0%, #1a3a7a 100%);

/* Light Gradient (Registration/Pages) */
background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%);

/* Subtle Accent */
background: linear-gradient(135deg, #24479910 0%, #24479905 100%);
```

---

## 📐 Typography

### Font Families
```css
font-family: 'Outfit', 'Inter', sans-serif;
```

### Font Weights
```css
--font-regular: 400;
--font-medium: 500;
--font-bold: 700;
--font-black: 900;
```

### Font Sizes
```css
--text-xs: 11px;        /* Extra small (labels, badges) */
--text-sm: 13px;        /* Small (secondary text) */
--text-base: 16px;      /* Base (body text) */
--text-lg: 18px;        /* Large (subheadings) */
--text-xl: 20px;        /* Extra large */
--text-2xl: 24px;       /* 2X large */
--text-3xl: 30px;       /* 3X large */
--text-4xl: 36px;       /* 4X large (main headings) */
--text-5xl: 48px;       /* 5X large (hero text) */
```

### Letter Spacing
```css
--tracking-tight: -0.02em;      /* For large headings */
--tracking-normal: 0;           /* Default */
--tracking-wide: 0.1em;         /* For uppercase labels */
```

---

## 🎭 Icons

### Icon Library
**Lucide React** - Modern, consistent icon set

### Common Icons
```javascript
import {
  Building2,      // Logo, municipal
  User,           // Profile, user
  Mail,           // Email
  Phone,          // Contact
  Lock,           // Security, password
  Eye, EyeOff,    // Password visibility
  Shield,         // Security, protection
  MapPin,         // Location, address
  CheckCircle2,   // Success
  XCircle,        // Error
  AlertCircle,    // Warning
  ArrowLeft,      // Back navigation
  ChevronRight,   // Forward navigation
  Send,           // Submit, send
  Headphones,     // Support
  FileText,       // Documents, terms
  HelpCircle      // FAQ, help
} from 'lucide-react';
```

### Icon Sizes
```javascript
<Icon size={16} />  // Small (inline text)
<Icon size={20} />  // Medium (form fields)
<Icon size={24} />  // Large (section headers)
<Icon size={36} />  // Extra large (page headers)
<Icon size={48} />  // Hero (main branding)
```

### Icon Colors
```javascript
// White icons (on dark backgrounds)
<Icon className="text-white" />

// Primary color icons
<Icon style={{ color: '#244799' }} />

// Status icons
<Icon className="text-success" />  // Green
<Icon className="text-danger" />   // Red
<Icon className="text-warning" />  // Amber
```

---

## 🎨 Shadows

### Shadow System
```css
/* Small - Subtle elevation */
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* Medium - Default cards */
.shadow {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 
              0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

/* Premium - Enhanced cards */
.shadow-premium {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
              0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Premium Large - Main containers */
.shadow-premium-lg {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Extra Large - Modals, overlays */
.shadow-xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
```

---

## 🎬 Animations

### Float Animation
```css
.anim-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

### Pulse Animation
```css
.animate-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
```

### Zoom In Animation
```css
.animate-zoomIn {
  animation: zoomIn 0.4s ease-out;
}

@keyframes zoomIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

### Fade In Animation
```css
.animate-fadeIn {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Hover Lift
```css
.hover-lift {
  transition: all 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-5px);
}
```

---

## 📦 Component Patterns

### Card
```jsx
<div className="card border-0 shadow-premium rounded-4 p-5">
  {/* Content */}
</div>
```

### Button - Primary
```jsx
<button
  className="btn w-100 py-4 text-white rounded-pill shadow-lg"
  style={{ backgroundColor: '#244799' }}
>
  Button Text
</button>
```

### Button - Secondary
```jsx
<button className="btn btn-light rounded-pill px-4 py-2 shadow-sm">
  Button Text
</button>
```

### Input Field
```jsx
<div className="position-relative">
  <div className="position-absolute top-50 start-0 translate-middle-y ms-4 text-muted opacity-50">
    <Icon size={20} />
  </div>
  <input
    type="text"
    className="form-control rounded-pill border-0 bg-light py-3 fw-medium shadow-none"
    style={{ paddingLeft: '60px' }}
    placeholder="Enter text"
  />
</div>
```

### Alert - Success
```jsx
<div className="alert border-0 shadow-sm d-flex align-items-center rounded-4" 
     style={{ backgroundColor: '#ECFDF5', color: '#10B981' }}>
  <CheckCircle2 size={20} className="me-3" />
  <div className="small fw-medium">Success message</div>
</div>
```

### Alert - Error
```jsx
<div className="alert border-0 shadow-sm d-flex align-items-center rounded-4" 
     style={{ backgroundColor: '#FEF2F2', color: '#EF4444' }}>
  <AlertCircle size={20} className="me-3" />
  <div className="small fw-medium">Error message</div>
</div>
```

### Icon Badge
```jsx
<div className="rounded-3 d-flex align-items-center justify-content-center" 
     style={{ width: '48px', height: '48px', backgroundColor: '#24479915' }}>
  <Icon size={24} style={{ color: '#244799' }} />
</div>
```

### Section Header
```jsx
<div className="d-flex align-items-center gap-2 mb-3">
  <div className="rounded-circle d-flex align-items-center justify-content-center" 
       style={{ width: '24px', height: '24px', backgroundColor: '#244799' }}>
    <span className="text-white fw-bold" style={{ fontSize: '12px' }}>1</span>
  </div>
  <p className="small fw-bold mb-0 text-uppercase" 
     style={{ color: '#244799', letterSpacing: '0.1em' }}>
    Section Title
  </p>
</div>
```

---

## 🎯 Spacing System

### Padding/Margin Scale
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

### Border Radius
```css
--radius-sm: 0.25rem;    /* 4px - Small elements */
--radius-md: 0.5rem;     /* 8px - Default */
--radius-lg: 1rem;       /* 16px - Cards */
--radius-xl: 1.5rem;     /* 24px - Large cards */
--radius-2xl: 2rem;      /* 32px - Hero elements */
--radius-full: 9999px;   /* Fully rounded (pills) */
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */

/* Small devices (phones, less than 768px) */
@media (max-width: 767.98px) {
  /* Mobile styles */
}

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) {
  /* Tablet styles */
}

/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) {
  /* Desktop styles */
}

/* Extra large devices (large desktops, 1200px and up) */
@media (min-width: 1200px) {
  /* Large desktop styles */
}
```

---

## ✨ Special Effects

### Glassmorphism
```css
.glass-effect {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Grid Pattern Background
```css
.grid-pattern {
  background-image: 
    linear-gradient(rgba(36, 71, 153, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(36, 71, 153, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
}
```

### Gradient Text
```css
.gradient-text {
  background: linear-gradient(135deg, #244799 0%, #1a3a7a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## 🔧 Utility Classes

### Text Utilities
```css
.fw-medium { font-weight: 500; }
.fw-bold { font-weight: 700; }
.fw-black { font-weight: 900; }
.text-uppercase { text-transform: uppercase; }
.extra-small { font-size: 11px; }
```

### Spacing Utilities
```css
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
```

### Flex Utilities
```css
.d-flex { display: flex; }
.align-items-center { align-items: center; }
.justify-content-center { justify-content: center; }
.flex-shrink-0 { flex-shrink: 0; }
```

### Transition
```css
.transition-all { transition: all 0.3s ease; }
```

---

## 📋 Checklist for New Components

When creating new components, ensure:

- [ ] Uses PRIMARY_COLOR (#244799) for main elements
- [ ] White icons on dark backgrounds
- [ ] Proper shadow system (shadow-premium, shadow-premium-lg)
- [ ] Rounded corners (rounded-4 for cards, rounded-pill for buttons)
- [ ] Smooth animations (animate-fadeIn, hover-lift)
- [ ] Responsive design (mobile-first approach)
- [ ] Proper spacing (consistent padding/margin)
- [ ] Accessible (proper labels, ARIA attributes)
- [ ] Error handling (user-friendly messages)
- [ ] Loading states (spinners, disabled buttons)

---

## 🎉 Quick Copy-Paste Snippets

### Primary Button
```jsx
<button
  className="btn w-100 py-4 text-white rounded-pill shadow-lg transition-all"
  style={{ backgroundColor: '#244799' }}
>
  Button Text
</button>
```

### Card Container
```jsx
<div className="card border-0 shadow-premium rounded-4 p-5 mb-4">
  {/* Content */}
</div>
```

### Page Header (Dark)
```jsx
<div className="py-5" style={{ background: 'linear-gradient(135deg, #244799 0%, #1a3a7a 100%)' }}>
  <div className="container">
    <div className="text-center text-white">
      <div className="d-inline-flex align-items-center justify-content-center rounded-circle p-4 mb-4 bg-white bg-opacity-15" 
           style={{ width: '80px', height: '80px' }}>
        <Icon size={36} className="text-white" />
      </div>
      <h1 className="fw-black mb-2">Page Title</h1>
      <p className="opacity-90 mb-0">Subtitle</p>
    </div>
  </div>
</div>
```

### Footer
```jsx
<div className="py-4 border-top bg-white">
  <div className="container">
    <div className="text-center">
      <p className="text-muted small mb-3">© 2026 PMC Municipal Administration</p>
      <div className="d-flex justify-content-center gap-4">
        <Link to="/privacy" className="text-muted text-decoration-none small fw-medium">Privacy</Link>
        <Link to="/terms" className="text-muted text-decoration-none small fw-medium">Terms</Link>
        <Link to="/support" className="text-muted text-decoration-none small fw-medium">Support</Link>
      </div>
    </div>
  </div>
</div>
```

---

© 2026 PMC Municipal Administration - Design System v2.5.0
