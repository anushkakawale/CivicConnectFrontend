import React from 'react';
import {
    Inbox, UserCheck, Hourglass, CheckCircle2,
    CheckCircle, XCircle, CheckSquare, RotateCcw,
    AlertTriangle, ShieldAlert
} from 'lucide-react';

const StatusBadge = ({ status, size = 'md' }) => {
    const getStatusConfig = (s) => {
        const configs = {
            SUBMITTED: { color: '#FFFFFF', bg: '#1254AF', icon: Inbox, text: 'Reported' },
            ASSIGNED: { color: '#FFFFFF', bg: '#1254AF', icon: UserCheck, text: 'Assigned' },
            IN_PROGRESS: { color: '#FFFFFF', bg: '#F59E0B', icon: Hourglass, text: 'In progress' },
            RESOLVED: { color: '#FFFFFF', bg: '#10B981', icon: CheckCircle2, text: 'Resolved' },
            APPROVED: { color: '#FFFFFF', bg: '#059669', icon: CheckCircle, text: 'Verified' },
            REJECTED: { color: '#FFFFFF', bg: '#EF4444', icon: XCircle, text: 'Rejected' },
            CLOSED: { color: '#FFFFFF', bg: '#1254AF', icon: CheckSquare, text: 'Closed' },
            REOPENED: { color: '#FFFFFF', bg: '#D946EF', icon: RotateCcw, text: 'Reopened' },
            ESCALATED: { color: '#FFFFFF', bg: '#B91C1C', icon: ShieldAlert, text: 'Escalated' }
        };
        const conf = configs[s] || { color: '#FFFFFF', bg: '#64748B', icon: AlertTriangle, text: s || 'Unknown' };
        // If it's a raw string like "SUBMITTED" and not in our config, try to prettify it
        if (!configs[s] && s) {
            conf.text = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase().replace(/_/g, ' ');
        }
        return conf;
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    const styles = {
        badge: {
            backgroundColor: config.bg,
            color: config.color,
            padding: size === 'sm' ? '2px 10px' : '4px 14px',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: size === 'sm' ? '0.65rem' : '0.75rem',
            fontWeight: '700',
            border: `1px solid rgba(255,255,255,0.2)`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        }
    };

    return (
        <div style={styles.badge} className="animate-fadeIn">
            <Icon size={size === 'sm' ? 12 : 14} />
            <span>{config.text}</span>
        </div>
    );
};

export default StatusBadge;
