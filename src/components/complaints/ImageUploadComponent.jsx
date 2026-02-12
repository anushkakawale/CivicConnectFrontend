import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

/**
 * Premium Image Upload Component for Complaint Resolution
 * Supports multiple images with preview, drag-and-drop, and stage-based uploading
 */
const ImageUploadComponent = ({ complaintId, stage, onUploadSuccess, apiMethod, maxImages = 5 }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const { showToast } = useToast();

    const PRIMARY_COLOR = '#173470';

    // Stage configurations
    const stageConfig = {
        progress: {
            title: 'Upload Work Progress Images',
            subtitle: 'Document ongoing work for transparency',
            icon: Send,
            color: '#F59E0B',
            placeholder: 'Add a progress update message (optional)...'
        },
        resolution: {
            title: 'Upload Completion Images',
            subtitle: 'Prove the issue has been resolved',
            icon: CheckCircle,
            color: '#10B981',
            placeholder: 'Add completion notes (optional)...'
        },
        combined: {
            title: 'Resolve with Images',
            subtitle: 'Mark as resolved and upload proof',
            icon: CheckCircle,
            color: '#10B981',
            placeholder: 'Add resolution summary (optional)...'
        }
    };

    const config = stageConfig[stage] || stageConfig.progress;

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        addFiles(files);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files);
        addFiles(files);
    };

    const addFiles = (files) => {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (imageFiles.length === 0) {
            showToast('Please select only image files', 'warning');
            return;
        }

        if (selectedFiles.length + imageFiles.length > maxImages) {
            showToast(`Maximum ${maxImages} images allowed`, 'warning');
            return;
        }

        // Create object URLs for preview
        const newPreviews = imageFiles.map(file => ({
            url: URL.createObjectURL(file),
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
        }));

        setSelectedFiles(prev => [...prev, ...imageFiles]);
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeFile = (index) => {
        // Revoke object URL to free memory
        URL.revokeObjectURL(previews[index].url);

        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            showToast('Please select at least one image', 'warning');
            return;
        }

        try {
            setUploading(true);

            const formData = new FormData();
            selectedFiles.forEach(file => {
                formData.append('images', file);
            });

            // Add message if provided
            if (message.trim()) {
                formData.append('message', message.trim());
            }

            await apiMethod(complaintId, formData);

            showToast(`${selectedFiles.length} image(s) uploaded successfully!`, 'success');

            // Clean up
            previews.forEach(p => URL.revokeObjectURL(p.url));
            setSelectedFiles([]);
            setPreviews([]);
            setMessage('');

            if (onUploadSuccess) {
                onUploadSuccess();
            }
        } catch (error) {
            console.error('Upload failed:', error);
            showToast(
                error.response?.data?.message || error.response?.data?.error || 'Failed to upload images. Please try again.',
                'error'
            );
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="card border-0 shadow-premium rounded-4 overflow-hidden mb-4">
            <div className="card-header py-4 px-5 border-0" style={{ backgroundColor: config.color }}>
                <div className="d-flex align-items-center gap-3">
                    <div className="p-2 bg-white bg-opacity-20 rounded-circle">
                        <config.icon className="text-white" size={20} />
                    </div>
                    <div>
                        <h6 className="text-white mb-0 fw-black extra-small uppercase tracking-widest">{config.title}</h6>
                        <p className="text-white opacity-75 mb-0 extra-small">{config.subtitle}</p>
                    </div>
                </div>
            </div>

            <div className="card-body p-4 p-lg-5">
                {/* Drag & Drop Zone */}
                <div
                    className="border-dashed border-2 rounded-4 p-5 text-center transition-all hover-light cursor-pointer bg-light bg-opacity-50"
                    style={{ borderColor: '#E2E8F0' }}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => document.getElementById('file-input-' + stage).click()}
                >
                    <Upload size={48} className="text-muted opacity-30 mb-3" />
                    <h6 className="fw-black text-dark mb-2">Drop images here or click to browse</h6>
                    <p className="extra-small text-muted mb-0">
                        JPG, PNG, GIF • Max {maxImages} images • Up to 10MB each
                    </p>
                    <input
                        id={'file-input-' + stage}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="d-none"
                    />
                </div>

                {/* Image Previews */}
                {previews.length > 0 && (
                    <div className="mt-4">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <h6 className="extra-small fw-black text-dark uppercase tracking-widest mb-0">
                                Selected Images ({selectedFiles.length})
                            </h6>
                            <button
                                className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 extra-small fw-black"
                                onClick={() => {
                                    previews.forEach(p => URL.revokeObjectURL(p.url));
                                    setSelectedFiles([]);
                                    setPreviews([]);
                                }}
                            >
                                Clear All
                            </button>
                        </div>

                        <div className="row g-3">
                            {previews.map((preview, index) => (
                                <div key={index} className="col-6 col-md-4 col-lg-3">
                                    <div className="position-relative rounded-3 overflow-hidden border shadow-sm hover-up-tiny transition-all">
                                        <img
                                            src={preview.url}
                                            alt={preview.name}
                                            className="w-100"
                                            style={{ height: '150px', objectFit: 'cover' }}
                                        />
                                        <div className="position-absolute top-0 end-0 p-2">
                                            <button
                                                className="btn btn-danger btn-sm rounded-circle p-1 shadow"
                                                style={{ width: '28px', height: '28px' }}
                                                onClick={() => removeFile(index)}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 p-2">
                                            <p className="extra-small text-white mb-0 text-truncate">{preview.name}</p>
                                            <p className="extra-small text-white opacity-60 mb-0">{preview.size}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Message Input */}
                <div className="mt-4">
                    <label className="form-label extra-small fw-black text-dark uppercase tracking-widest">
                        Message / Notes
                    </label>
                    <textarea
                        className="form-control rounded-3 border shadow-sm"
                        rows="3"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={config.placeholder}
                    />
                </div>

                {/* Upload Button */}
                <button
                    className="btn btn-primary w-100 mt-4 py-3 rounded-pill fw-black extra-small uppercase tracking-widest shadow-premium border-0 d-flex align-items-center justify-content-center gap-2 transition-all hover-shadow-lg"
                    style={{ backgroundColor: config.color }}
                    onClick={handleUpload}
                    disabled={uploading || selectedFiles.length === 0}
                >
                    {uploading ? (
                        <>
                            <Loader size={18} className="animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <config.icon size={18} />
                            Upload {selectedFiles.length} Image{selectedFiles.length !== 1 ? 's' : ''}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ImageUploadComponent;
