/**
 * CivicConnect - Constants
 * Ward and Department data matching backend
 */

export const WARDS = [
    { wardId: 1, number: 1, area_name: 'Shivaji Nagar' },
    { wardId: 2, number: 2, area_name: 'Kothrud' },
    { wardId: 3, number: 3, area_name: 'Hadapsar' },
    { wardId: 4, number: 4, area_name: 'Baner' },
    { wardId: 5, number: 5, area_name: 'Kasba Peth' }
];

export const DEPARTMENTS = [
    {
        department_id: 1,
        name: 'Water Supply',
        sla_hours: 24,
        priority_level: 'HIGH',
        description: 'No water, leakage, low pressure',
        icon: '💧',
        color: 'blue'
    },
    {
        department_id: 2,
        name: 'Sanitation',
        sla_hours: 36,
        priority_level: 'MEDIUM',
        description: 'Public toilets, cleanliness',
        icon: '🧹',
        color: 'green'
    },
    {
        department_id: 3,
        name: 'Roads',
        sla_hours: 72,
        priority_level: 'LOW',
        description: 'Potholes, damaged roads',
        icon: '🛣️',
        color: 'gray'
    },
    {
        department_id: 4,
        name: 'Electricity',
        sla_hours: 24,
        priority_level: 'HIGH',
        description: 'Street lights, power issues',
        icon: '⚡',
        color: 'yellow'
    },
    {
        department_id: 5,
        name: 'Waste Management',
        sla_hours: 12,
        priority_level: 'CRITICAL',
        description: 'Garbage collection',
        icon: '🗑️',
        color: 'orange'
    },
    {
        department_id: 6,
        name: 'Public Safety',
        sla_hours: 6,
        priority_level: 'CRITICAL',
        description: 'Open manholes, hazards',
        icon: '⚠️',
        color: 'red'
    },
    {
        department_id: 7,
        name: 'Health',
        sla_hours: 48,
        priority_level: 'MEDIUM',
        description: 'Mosquitoes, hygiene',
        icon: '🏥',
        color: 'teal'
    },
    {
        department_id: 8,
        name: 'Education',
        sla_hours: 96,
        priority_level: 'LOW',
        description: 'School infrastructure',
        icon: '🎓',
        color: 'purple'
    }
];

export const COMPLAINT_STATUS = {
    PENDING: { label: 'Pending', color: 'warning', icon: '⏳' },
    ASSIGNED: { label: 'Assigned', color: 'info', icon: '📋' },
    IN_PROGRESS: { label: 'In Progress', color: 'primary', icon: '🔧' },
    RESOLVED: { label: 'Resolved', color: 'success', icon: '✅' },
    APPROVED: { label: 'Approved', color: 'success', icon: '👍' },
    REJECTED: { label: 'Rejected', color: 'danger', icon: '❌' },
    CLOSED: { label: 'Closed', color: 'secondary', icon: '🔒' },
    REOPENED: { label: 'Reopened', color: 'warning', icon: '🔄' }
};

export const SLA_STATUS = {
    ACTIVE: { label: 'Active', color: 'primary', icon: '⏱️' },
    MET: { label: 'Met', color: 'success', icon: '✅' },
    BREACHED: { label: 'Breached', color: 'danger', icon: '🚨' },
    WARNING: { label: 'Warning', color: 'warning', icon: '⚠️' }
};

export const PRIORITY_LEVELS = {
    CRITICAL: { label: 'Critical', color: 'danger', icon: '🔴' },
    HIGH: { label: 'High', color: 'warning', icon: '🟠' },
    MEDIUM: { label: 'Medium', color: 'info', icon: '🟡' },
    LOW: { label: 'Low', color: 'secondary', icon: '🟢' }
};

export const USER_ROLES = {
    CITIZEN: 'CITIZEN',
    DEPARTMENT_OFFICER: 'DEPARTMENT_OFFICER',
    WARD_OFFICER: 'WARD_OFFICER',
    ADMIN: 'ADMIN'
};

export const ROLE_ROUTES = {
    [USER_ROLES.CITIZEN]: '/citizen/dashboard',
    [USER_ROLES.DEPARTMENT_OFFICER]: '/department/dashboard',
    [USER_ROLES.WARD_OFFICER]: '/ward-officer/dashboard',
    [USER_ROLES.ADMIN]: '/admin/dashboard'
};

export const IMAGE_TYPES = {
    BEFORE_WORK: { label: 'Before Work', icon: '📸' },
    IN_PROGRESS: { label: 'In Progress', icon: '🔨' },
    AFTER_RESOLUTION: { label: 'After Resolution', icon: '✨' }
};

export const IMAGE_STAGES = {
    BEFORE_WORK: { label: 'Before Work', color: 'secondary', icon: '📸' },
    IN_PROGRESS: { label: 'In Progress', color: 'primary', icon: '🔨' },
    AFTER_RESOLUTION: { label: 'Resolved Proof', color: 'success', icon: '✨' }
};
