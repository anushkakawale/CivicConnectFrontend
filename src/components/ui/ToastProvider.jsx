import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 5000);
    }, []);

    const success = useCallback((message) => addToast(message, 'success'), [addToast]);
    const error = useCallback((message) => addToast(message, 'error'), [addToast]);
    const warning = useCallback((message) => addToast(message, 'warning'), [addToast]);
    const info = useCallback((message) => addToast(message, 'info'), [addToast]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast: addToast, success, error, warning, info }}>
            {children}
            <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`toast show align-items-center text-white bg-${toast.type === 'success' ? 'success' :
                            toast.type === 'error' ? 'danger' :
                                toast.type === 'warning' ? 'warning' :
                                    'info'
                            } border-0`}
                        role="alert"
                    >
                        <div className="d-flex">
                            <div className="toast-body">
                                <i className={`bi bi-${toast.type === 'success' ? 'check-circle' :
                                    toast.type === 'error' ? 'x-circle' :
                                        toast.type === 'warning' ? 'exclamation-triangle' :
                                            'info-circle'
                                    } me-2`}></i>
                                {toast.message}
                            </div>
                            <button
                                type="button"
                                className="btn-close btn-close-white me-2 m-auto"
                                onClick={() => removeToast(toast.id)}
                            ></button>
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
