import React from 'react';
import {
    Inbox, UserCheck, Hourglass, CheckCircle2,
    CheckCircle, XCircle, CheckSquare, RotateCcw,
    AlertTriangle, ShieldAlert, ShieldCheck, RefreshCw,
    Pause, Clock, FileX
} from 'lucide-react';

const StatusBadge = ({ status, size = 'md', showIcon = true }) => {
    const getStatusConfig = (s) => {
        const configs = {
            // Initial States
            SUBMITTED: { color: '#FFFFFF', bg: '#64748B', icon: Inbox, text: 'NEW' },
            RECEIVED: { color: '#FFFFFF', bg: '#64748B', icon: Inbox, text: 'NEW' },
            NEW: { color: '#FFFFFF', bg: '#64748B', icon: Inbox, text: 'NEW' },

            // Assignment States
            ASSIGNED: { color: '#FFFFFF', bg: '#3B82F6', icon: UserCheck, text: 'ASSIGNED' },
            DISPATCHED: { color: '#FFFFFF', bg: '#3B82F6', icon: UserCheck, text: 'ASSIGNED' },

            // Work States
            IN_PROGRESS: { color: '#FFFFFF', bg: '#F59E0B', icon: Hourglass, text: 'IN PROGRESS' },
            WORKING: { color: '#FFFFFF', bg: '#F59E0B', icon: Hourglass, text: 'IN PROGRESS' },
            ON_HOLD: { color: '#FFFFFF', bg: '#8B5CF6', icon: Pause, text: 'ON HOLD' },

            // Resolution States
            RESOLVED: { color: '#FFFFFF', bg: '#10B981', icon: ShieldCheck, text: 'RESOLVED' },
            FIXED: { color: '#FFFFFF', bg: '#10B981', icon: ShieldCheck, text: 'RESOLVED' },

            // Approval States
            PENDING_APPROVAL: { color: '#FFFFFF', bg: '#6366F1', icon: Clock, text: 'PENDING APPROVAL' },
            APPROVED: { color: '#FFFFFF', bg: '#059669', icon: CheckCircle, text: 'APPROVED' },
            VERIFIED: { color: '#FFFFFF', bg: '#059669', icon: CheckCircle, text: 'APPROVED' },

            // Final States
            CLOSED: { color: '#FFFFFF', bg: '#1E293B', icon: CheckSquare, text: 'CLOSED' },

            // Negative States
            REJECTED: { color: '#FFFFFF', bg: '#EF4444', icon: XCircle, text: 'REJECTED' },
            RETURNED: { color: '#FFFFFF', bg: '#EF4444', icon: RotateCcw, text: 'REJECTED' },
            INVALID: { color: '#FFFFFF', bg: '#DC2626', icon: FileX, text: 'INVALID' },

            // Special States
            REOPENED: { color: '#FFFFFF', bg: '#EC4899', icon: RefreshCw, text: 'REOPENED' },
            ESCALATED: { color: '#FFFFFF', bg: '#B91C1C', icon: ShieldAlert, text: 'ESCALATED' }
        };

        const upperStatus = s?.toUpperCase();
        const conf = configs[upperStatus] || {
            color: '#FFFFFF',
            bg: '#64748B',
            icon: AlertTriangle,
            text: s || 'UNKNOWN'
        };

        // If it's a raw string not in our config, prettify it
        if (!configs[upperStatus] && s) {
            conf.text = s.replace(/_/g, ' ').toUpperCase();
        }

        return conf;
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    const styles = {
        badge: {
            backgroundColor: config.bg,
            color: config.color,
            padding: size === 'sm' ? '4px 12px' : size === 'lg' ? '8px 16px' : '6px 14px',
            borderRadius: size === 'sm' ? '10px' : '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: size === 'sm' ? '4px' : '6px',
            fontSize: size === 'sm' ? '0.65rem' : size === 'lg' ? '0.85rem' : '0.75rem',
            fontWeight: '700',
            letterSpacing: '0.5px',
            border: `1px solid rgba(255,255,255,0.2)`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textTransform: 'uppercase'
        }
    };

    return (
        <div style={styles.badge} className="status-badge">
            {showIcon && <Icon size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} />}
            <span>{config.text}</span>
        </div>
    );
};

export default StatusBadge;
