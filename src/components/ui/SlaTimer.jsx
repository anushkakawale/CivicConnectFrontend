import { useState, useEffect } from 'react';

export default function SlaTimer({ deadline, status }) {
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [isBreached, setIsBreached] = useState(false);

    useEffect(() => {
        if (!deadline || status === 'CLOSED' || status === 'RESOLVED') {
            return;
        }

        const calculateTimeRemaining = () => {
            const now = new Date();
            const deadlineDate = new Date(deadline);
            const diff = deadlineDate - now;

            if (diff <= 0) {
                setIsBreached(true);
                setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeRemaining({ hours, minutes, seconds });
            setIsBreached(false);
        };

        calculateTimeRemaining();
        const interval = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, [deadline, status]);

    if (!timeRemaining) return null;

    const getUrgencyClass = () => {
        if (isBreached) return 'danger';
        if (timeRemaining.hours < 2) return 'warning';
        return 'success';
    };

    const urgencyClass = getUrgencyClass();

    return (
        <div className={`badge bg-${urgencyClass} d-inline-flex align-items-center gap-1`}>
            <i className="bi bi-clock"></i>
            {isBreached ? (
                <span>BREACHED</span>
            ) : (
                <span>
                    {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
                </span>
            )}
        </div>
    );
}
