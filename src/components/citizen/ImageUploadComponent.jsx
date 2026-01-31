import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const ImageUploadComponent = ({ complaintId, onUploadSuccess }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);

        // Validate files
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                setError('Only image files are allowed');
                return false;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('File size must be less than 5MB');
                return false;
            }
            return true;
        });

        setSelectedFiles(prev => [...prev, ...validFiles]);

        // Generate previews
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => [...prev, { file: file.name, url: reader.result }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            setError('Please select at least one image');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            selectedFiles.forEach(file => {
                formData.append('images', file);
            });

            // Call API to upload images
            // await citizenService.uploadComplaintImage(complaintId, formData);

            setSelectedFiles([]);
            setPreviews([]);
            if (onUploadSuccess) onUploadSuccess();
        } catch (err) {
            setError('Failed to upload images. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="card">
            <div className="card-body">
                <h6 className="card-title fw-bold mb-3">
                    <ImageIcon size={18} className="me-2" />
                    Upload Images
                </h6>

                {error && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        {error}
                        <button type="button" className="btn-close" onClick={() => setError('')}></button>
                    </div>
                )}

                {/* File Input */}
                <div className="mb-3">
                    <label className="btn btn-outline-primary w-100">
                        <Upload size={18} className="me-2" />
                        Select Images
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="d-none"
                        />
                    </label>
                    <small className="text-muted d-block mt-2">
                        Maximum 5MB per image. Supported formats: JPG, PNG, GIF
                    </small>
                </div>

                {/* Image Previews */}
                {previews.length > 0 && (
                    <div className="mb-3">
                        <div className="row g-2">
                            {previews.map((preview, index) => (
                                <div key={index} className="col-4">
                                    <div className="position-relative">
                                        <img
                                            src={preview.url}
                                            alt={`Preview ${index + 1}`}
                                            className="img-thumbnail w-100"
                                            style={{ height: '120px', objectFit: 'cover' }}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                                            onClick={() => removeFile(index)}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Upload Button */}
                {selectedFiles.length > 0 && (
                    <button
                        className="btn btn-primary w-100"
                        onClick={handleUpload}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload size={18} className="me-2" />
                                Upload {selectedFiles.length} Image{selectedFiles.length > 1 ? 's' : ''}
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ImageUploadComponent;
