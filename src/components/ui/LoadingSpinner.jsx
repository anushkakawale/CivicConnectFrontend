export default function LoadingSpinner({ message = 'Loading...', fullScreen = false }) {
    const content = (
        <div className="d-flex flex-column align-items-center justify-content-center gap-3">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
            </div>
            {message && <p className="text-muted mb-0">{message}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
                {content}
            </div>
        );
    }

    return (
        <div className="d-flex align-items-center justify-content-center py-5">
            {content}
        </div>
    );
}
