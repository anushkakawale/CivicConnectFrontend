/**
 * Enhanced Image Upload Component
 * Supports multiple files, drag & drop, preview, and progress tracking
 */

import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useImageUpload } from '../../hooks/useImageUpload';
import './EnhancedImageUpload.css';

const EnhancedImageUpload = ({ onImagesChange, maxFiles = 5, disabled = false }) => {
    const fileInputRef = useRef(null);
    const {
        previews,
        uploading,
        uploadProgress,
        error,
        handleFileSelect,
        removeImage,
    } = useImageUpload();

    const handleFileInputChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files);
            if (onImagesChange) {
                onImagesChange(Array.from(files));
            }
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileSelect(files);
            if (onImagesChange) {
                onImagesChange(Array.from(files));
            }
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleRemoveImage = (index) => {
        removeImage(index);
        // Update parent component
        if (onImagesChange) {
            const updatedFiles = previews.filter((_, i) => i !== index).map(p => p.file);
            onImagesChange(updatedFiles);
        }
    };

    const handleClick = () => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    };

    const canAddMore = previews.length < maxFiles;

    return (
        <div className="enhanced-image-upload">
            {/* Upload Area */}
            {canAddMore && (
                <div
                    className={`upload-dropzone ${disabled ? 'disabled' : ''}`}
                    onClick={handleClick}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif"
                        multiple
                        onChange={handleFileInputChange}
                        style={{ display: 'none' }}
                        disabled={disabled}
                    />
                    <div className="upload-content">
                        <Upload size={48} className="upload-icon" />
                        <h4>Upload Images</h4>
                        <p>Click to browse or drag and drop</p>
                        <small>JPEG, PNG, GIF (Max {maxFiles} files)</small>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="upload-error">
                    <span>{error}</span>
                </div>
            )}

            {/* Image Previews */}
            {previews.length > 0 && (
                <div className="image-previews">
                    <h5>Selected Images ({previews.length}/{maxFiles})</h5>
                    <div className="preview-grid">
                        {previews.map((preview, index) => (
                            <div key={index} className="preview-item">
                                <img src={preview.url} alt={preview.name} />
                                <div className="preview-overlay">
                                    <button
                                        type="button"
                                        className="remove-btn"
                                        onClick={() => handleRemoveImage(index)}
                                        disabled={disabled}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="preview-info">
                                    <span className="preview-name">{preview.name}</span>
                                    <span className="preview-size">
                                        {(preview.size / 1024).toFixed(1)} KB
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload Progress */}
            {uploading && (
                <div className="upload-progress">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                    <span>{uploadProgress}%</span>
                </div>
            )}
        </div>
    );
};

export default EnhancedImageUpload;
