import React from 'react';
import { AlertCircle, Zap, Shield, Activity } from 'lucide-react';

const PriorityBadge = ({ priority, size = 'md' }) => {
    const getPriorityConfig = (p) => {
        const configs = {
            LOW: {
                color: '#FFFFFF',
                bg: '#10B981',
                icon: Shield,
                text: 'Low'
            },
            MEDIUM: {
                color: '#1254AF',
                bg: '#EFF6FF',
                icon: Activity,
                text: 'Standard'
            },
            HIGH: {
                color: '#D97706',
                bg: '#FFFBEB',
                icon: Zap,
                text: 'High'
            },
            CRITICAL: {
                color: '#EF4444',
                bg: '#FEF2F2',
                icon: AlertCircle,
                text: 'Urgent'
            }
        };
        const conf = configs[p] || { color: '#64748B', bg: '#F8FAFC', icon: Activity, text: p };
        if (!configs[p] && p) {
            conf.text = p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
        }
        return conf;
    };

    const config = getPriorityConfig(priority);
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
            border: `1px solid ${config.color}20`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }
    };

    return (
        <div style={styles.badge} className="animate-fadeIn">
            <Icon size={size === 'sm' ? 12 : 14} />
            <span>{config.text}</span>
        </div>
    );
};

export default PriorityBadge;
