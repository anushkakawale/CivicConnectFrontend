import React from 'react';
import { AlertTriangle } from 'lucide-react';
import './ConfirmDialog.css';

const ConfirmDialog = ({
    isOpen,
    title = 'Confirm Action',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    type = 'warning', // warning, danger, info
    loading = false
}) => {
    if (!isOpen) return null;

    const typeIcons = {
        warning: <AlertTriangle size={48} className="text-warning" />,
        danger: <AlertTriangle size={48} className="text-danger" />,
        info: <AlertTriangle size={48} className="text-info" />
    };

    return (
        <div className="confirm-dialog-overlay" onClick={onCancel}>
            <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                <div className={`confirm-dialog-icon confirm-dialog-icon-${type}`}>
                    {typeIcons[type]}
                </div>

                <h3 className="confirm-dialog-title">{title}</h3>

                <div className="confirm-dialog-message">{message}</div>

                <div className="confirm-dialog-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`btn btn-${type === 'danger' ? 'danger' : 'primary'}`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Processing...
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
