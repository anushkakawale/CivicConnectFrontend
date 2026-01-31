export default function StatusBadge({ status, size = 'md' }) {
    const getStatusConfig = (status) => {
        const configs = {
            SUBMITTED: { bg: 'info', icon: 'inbox', text: 'Submitted' },
            ASSIGNED: { bg: 'primary', icon: 'person-check', text: 'Assigned' },
            IN_PROGRESS: { bg: 'warning', icon: 'hourglass-split', text: 'In Progress' },
            RESOLVED: { bg: 'success', icon: 'check-circle', text: 'Resolved' },
            APPROVED: { bg: 'success', icon: 'check-circle-fill', text: 'Approved' },
            REJECTED: { bg: 'danger', icon: 'x-circle', text: 'Rejected' },
            CLOSED: { bg: 'secondary', icon: 'check-all', text: 'Closed' },
            REOPENED: { bg: 'warning', icon: 'arrow-clockwise', text: 'Reopened' },
            ESCALATED: { bg: 'danger', icon: 'exclamation-triangle-fill', text: 'Escalated' },
        };
        return configs[status] || { bg: 'secondary', icon: 'question-circle', text: status };
    };

    const config = getStatusConfig(status);
    const sizeClass = size === 'sm' ? 'badge-sm' : size === 'lg' ? 'badge-lg' : '';

    return (
        <span className={`badge bg-${config.bg} ${sizeClass} d-inline-flex align-items-center gap-1`}>
            <i className={`bi bi-${config.icon}`}></i>
            <span>{config.text}</span>
        </span>
    );
}
