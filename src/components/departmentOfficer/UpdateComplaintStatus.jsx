import React, { useState } from 'react';
import {
    PlayCircle,
    CheckCircle,
    Upload,
    X,
    AlertCircle,
    Image as ImageIcon,
    FileText
} from 'lucide-react';
import apiService from '../../api/apiService';
import './UpdateComplaintStatus.css';

const UpdateComplaintStatus = ({ complaint, onSuccess, onClose }) => {
    const [status, setStatus] = useState(''); // 'IN_PROGRESS' or 'RESOLVED'
    const [remarks, setRemarks] = useState('');
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);

        // Validate file count
        if (images.length + files.length > 5) {
            setError('Maximum 5 images allowed');
            return;
        }

        // Validate file size (5MB each)
        const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
        if (invalidFiles.length > 0) {
            setError('Each image must be less than 5MB');
            return;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const invalidTypes = files.filter(file => !validTypes.includes(file.type));
        if (invalidTypes.length > 0) {
            setError('Only JPG, JPEG, and PNG images are allowed');
            return;
        }

        setError('');
        setImages([...images, ...files]);

        // Create previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
        setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!status) {
            setError('Please select a status');
            return;
        }

        if (!remarks.trim()) {
            setError('Please provide remarks');
            return;
        }

        if (status === 'RESOLVED' && images.length === 0) {
            setError('Please upload at least one image showing the resolved issue');
            return;
        }

        try {
            setLoading(true);

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('status', status);
            formData.append('remarks', remarks);
            images.forEach((image, index) => {
                formData.append('images', image);
            });

            await apiService.departmentOfficer.updateComplaintStatus(
                complaint.complaintId,
                formData
            );

            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="update-status-container">
            <div className={`status-header ${status === 'RESOLVED' ? 'resolved-header' : 'progress-header'}`}>
                <div className="header-icon">
                    {status === 'RESOLVED' ? (
                        <CheckCircle className="w-6 h-6" />
                    ) : (
                        <PlayCircle className="w-6 h-6" />
                    )}
                </div>
                <div>
                    <h2>Update Complaint Status</h2>
                    <p>CMP-{complaint.complaintId} - {complaint.title}</p>
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="status-form">
                {/* Status Selection */}
                <div className="status-selection">
                    <h3>Select Status</h3>
                    <div className="status-options">
                        <button
                            type="button"
                            onClick={() => setStatus('IN_PROGRESS')}
                            className={`status-option ${status === 'IN_PROGRESS' ? 'selected progress-selected' : ''}`}
                        >
                            <PlayCircle className="w-8 h-8" />
                            <div className="option-content">
                                <h4>In Progress</h4>
                                <p>Work has started on this complaint</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setStatus('RESOLVED')}
                            className={`status-option ${status === 'RESOLVED' ? 'selected resolved-selected' : ''}`}
                        >
                            <CheckCircle className="w-8 h-8" />
                            <div className="option-content">
                                <h4>Resolved</h4>
                                <p>Issue has been completely fixed</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Remarks */}
                <div className="form-group">
                    <label htmlFor="remarks">
                        {status === 'RESOLVED' ? 'Resolution Details' : 'Progress Update'}
                        <span className="required">*</span>
                    </label>
                    <textarea
                        id="remarks"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder={
                            status === 'RESOLVED'
                                ? 'Describe how the issue was resolved, what actions were taken...'
                                : 'Describe the current progress, next steps, expected timeline...'
                        }
                        rows="5"
                        disabled={loading}
                        required
                        className="remarks-textarea"
                    />
                    <p className="input-hint">
                        {status === 'RESOLVED'
                            ? 'Provide detailed information about the resolution'
                            : 'Keep the citizen informed about the progress'}
                    </p>
                </div>

                {/* Image Upload */}
                <div className="form-group">
                    <label>
                        {status === 'RESOLVED' ? 'Resolution Images *' : 'Progress Images (Optional)'}
                    </label>

                    <div className="image-upload-section">
                        <input
                            type="file"
                            id="imageUpload"
                            accept="image/jpeg,image/jpg,image/png"
                            multiple
                            onChange={handleImageSelect}
                            disabled={loading || images.length >= 5}
                            className="file-input"
                        />

                        <label
                            htmlFor="imageUpload"
                            className={`upload-button ${images.length >= 5 ? 'disabled' : ''}`}
                        >
                            <Upload className="w-5 h-5" />
                            <span>
                                {images.length === 0
                                    ? 'Upload Images'
                                    : `${images.length}/5 Images Selected`}
                            </span>
                        </label>

                        <p className="upload-hint">
                            {status === 'RESOLVED'
                                ? 'Upload photos showing the resolved issue (Required, max 5 images)'
                                : 'Upload photos showing current progress (Optional, max 5 images)'}
                        </p>
                    </div>

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                        <div className="image-previews">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="image-preview">
                                    <img src={preview} alt={`Preview ${index + 1}`} />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="remove-image"
                                        disabled={loading}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary"
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className={status === 'RESOLVED' ? 'btn-resolved' : 'btn-progress'}
                        disabled={loading || !status}
                    >
                        {loading ? (
                            <>
                                <div className="spinner"></div>
                                Updating...
                            </>
                        ) : (
                            <>
                                {status === 'RESOLVED' ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Mark as Resolved
                                    </>
                                ) : (
                                    <>
                                        <PlayCircle className="w-5 h-5" />
                                        Update to In Progress
                                    </>
                                )}
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Info Box */}
            {status && (
                <div className={`info-box ${status === 'RESOLVED' ? 'info-resolved' : 'info-progress'}`}>
                    <h4>
                        {status === 'RESOLVED' ? '✓ After marking as resolved:' : 'ℹ️ After marking as in progress:'}
                    </h4>
                    <ul>
                        {status === 'RESOLVED' ? (
                            <>
                                <li>Ward Officer will be notified for verification</li>
                                <li>Citizen will receive resolution notification</li>
                                <li>Your images will be visible to all stakeholders</li>
                                <li>Ward Officer can approve or request changes</li>
                            </>
                        ) : (
                            <>
                                <li>Citizen will be notified of progress</li>
                                <li>Your update will be visible in complaint timeline</li>
                                <li>You can add more updates as work continues</li>
                                <li>Remember to mark as resolved when complete</li>
                            </>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UpdateComplaintStatus;
