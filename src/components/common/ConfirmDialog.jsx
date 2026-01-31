import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './ConfirmDialog.css';

/**
 * ConfirmDialog Component
 * Modal dialog for confirmation actions
 * 
 * @param {boolean} isOpen - Dialog open state
 * @param {Function} onClose - Close handler
 * @param {Function} onConfirm - Confirm handler
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {string} confirmText - Confirm button text
 * @param {string} cancelText - Cancel button text
 * @param {string} variant - Dialog variant ('danger', 'warning', 'info')
 * @param {boolean} loading - Loading state
 */
const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'info',
    loading = false
}) => {
    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (loading) return;
        await onConfirm();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Enter' && !loading) handleConfirm();
    };

    const getVariantIcon = () => {
        switch (variant) {
            case 'danger':
                return <AlertTriangle size={48} className="dialog-icon danger" />;
            case 'warning':
                return <AlertTriangle size={48} className="dialog-icon warning" />;
            default:
                return <AlertTriangle size={48} className="dialog-icon info" />;
        }
    };

    return (
        <div className="confirm-dialog-overlay" onClick={onClose}>
            <div
                className={`confirm-dialog ${variant}`}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
                role="dialog"
                aria-labelledby="dialog-title"
                aria-describedby="dialog-message"
            >
                <button
                    className="dialog-close"
                    onClick={onClose}
                    aria-label="Close dialog"
                    disabled={loading}
                >
                    <X size={20} />
                </button>

                <div className="dialog-content">
                    <div className="dialog-header">
                        {getVariantIcon()}
                        <h2 id="dialog-title" className="dialog-title">{title}</h2>
                    </div>

                    <p id="dialog-message" className="dialog-message">{message}</p>

                    <div className="dialog-actions">
                        <button
                            className="dialog-btn dialog-btn-cancel"
                            onClick={onClose}
                            disabled={loading}
                        >
                            {cancelText}
                        </button>
                        <button
                            className={`dialog-btn dialog-btn-confirm ${variant}`}
                            onClick={handleConfirm}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="btn-spinner"></span>
                                    Processing...
                                </>
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
