/**
 * Calculate SLA status for a complaint
 * @param {Object} complaint - Complaint object
 * @returns {Object} SLA status object { breached: boolean, remainingMinutes: number, deadline: Date }
 */
export const calculateSlaStatus = (complaint) => {
    if (!complaint || !complaint.createdAt) return null;

    const createdAt = new Date(complaint.createdAt);
    // Determine deadline based on priority or type if needed. Default 48h.
    const hours = complaint.priority === 'HIGH' ? 24 : 48;
    const deadline = new Date(createdAt.getTime() + hours * 60 * 60 * 1000);

    // Check if resolved/closed to stop clock
    const endStatus = ['RESOLVED', 'CLOSED', 'REJECTED'];
    const now = endStatus.includes(complaint.status) && complaint.updatedAt
        ? new Date(complaint.updatedAt)
        : new Date();

    const diffMs = deadline - now;
    const remainingMinutes = Math.max(0, Math.floor(diffMs / 60000));
    const breached = diffMs < 0;

    return {
        breached,
        remainingMinutes,
        deadline,
        totalDuration: hours * 60 // minutes
    };
};
