/**
 * Create Complaint Page
 * Professional form with image upload (up to 5 images)
 * GPS location support
 * Real-time validation
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService, { createComplaintFormData } from '../../api/apiService';
import { toast } from 'react-toastify';
import {
    MapPin, Upload, X, Camera, AlertCircle, CheckCircle,
    FileText, Tag, Flag, Building, Navigation, Image as ImageIcon
} from 'lucide-react';
import './CreateComplaint.css';

const CreateComplaint = () => {
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'WATER_SUPPLY',
        priority: 'MEDIUM',
        location: '',
        latitude: 0,
        longitude: 0,
        wardId: '',
        departmentId: ''
    });

    // Master data
    const [wards, setWards] = useState([]);
    const [departments, setDepartments] = useState([]);

    // Images
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    // UI state
    const [loading, setLoading] = useState(false);
    const [loadingMasterData, setLoadingMasterData] = useState(true);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [errors, setErrors] = useState({});

    // Categories
    const categories = [
        { value: 'WATER_SUPPLY', label: 'Water Supply', icon: '💧' },
        { value: 'ROAD_MAINTENANCE', label: 'Road Maintenance', icon: '🛣️' },
        { value: 'GARBAGE_COLLECTION', label: 'Garbage Collection', icon: '🗑️' },
        { value: 'STREET_LIGHTS', label: 'Street Lights', icon: '💡' },
        { value: 'DRAINAGE', label: 'Drainage', icon: '🚰' },
        { value: 'ELECTRICITY', label: 'Electricity', icon: '⚡' },
        { value: 'PARKS', label: 'Parks & Gardens', icon: '🌳' },
        { value: 'OTHER', label: 'Other', icon: '📋' }
    ];

    // Priorities
    const priorities = [
        { value: 'LOW', label: 'Low', color: '#10B981', icon: '⬇️' },
        { value: 'MEDIUM', label: 'Medium', color: '#F59E0B', icon: '➖' },
        { value: 'HIGH', label: 'High', color: '#F97316', icon: '⬆️' },
        { value: 'CRITICAL', label: 'Critical', color: '#EF4444', icon: '⚠️' }
    ];

    // Fetch master data on mount
    useEffect(() => {
        fetchMasterData();
    }, []);

    const fetchMasterData = async () => {
        try {
            setLoadingMasterData(true);

            const [wardsResponse, departmentsResponse] = await Promise.all([
                apiService.masterData.getWards(),
                apiService.masterData.getDepartments()
            ]);

            setWards(wardsResponse.data || []);
            setDepartments(departmentsResponse.data || []);

            // Set default ward and department if available
            if (wardsResponse.data?.length > 0) {
                setFormData(prev => ({ ...prev, wardId: wardsResponse.data[0].wardId }));
            }
            if (departmentsResponse.data?.length > 0) {
                setFormData(prev => ({ ...prev, departmentId: departmentsResponse.data[0].departmentId }));
            }

        } catch (error) {
            console.error('Error fetching master data:', error);
            toast.error('Failed to load form data. Please refresh the page.');
        } finally {
            setLoadingMasterData(false);
        }
    };

    // Get current location
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        setGettingLocation(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }));
                toast.success('Location captured successfully!');
                setGettingLocation(false);
            },
            (error) => {
                console.error('Error getting location:', error);
                toast.error('Failed to get your location. Please enter manually.');
                setGettingLocation(false);
            }
        );
    };

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handle image selection
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        // Check total images (existing + new)
        if (images.length + files.length > 5) {
            toast.error('You can upload maximum 5 images');
            return;
        }

        // Validate each file
        const validFiles = [];
        const newPreviews = [];

        files.forEach(file => {
            // Check file type
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not an image file`);
                return;
            }

            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} is too large. Max size is 5MB`);
                return;
            }

            validFiles.push(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result);
                if (newPreviews.length === validFiles.length) {
                    setImagePreviews(prev => [...prev, ...newPreviews]);
                }
            };
            reader.readAsDataURL(file);
        });

        setImages(prev => [...prev, ...validFiles]);
    };

    // Remove image
    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.length < 10) {
            newErrors.title = 'Title must be at least 10 characters';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.length < 20) {
            newErrors.description = 'Description must be at least 20 characters';
        }

        if (!formData.location.trim()) {
            newErrors.location = 'Location is required';
        }

        if (!formData.wardId) {
            newErrors.wardId = 'Ward is required';
        }

        if (!formData.departmentId) {
            newErrors.departmentId = 'Department is required';
        }

        if (formData.latitude === 0 || formData.longitude === 0) {
            newErrors.location = 'Please capture your location or enter coordinates';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix all errors before submitting');
            return;
        }

        try {
            setLoading(true);

            const complaintData = createComplaintFormData({
                ...formData,
                images: images
            });

            const response = await apiService.complaints.create(complaintData);

            toast.success('Complaint registered successfully!');
            navigate(`/citizen/complaints/${response.data.complaintId}`);

        } catch (error) {
            console.error('Error creating complaint:', error);
            toast.error(error.response?.data?.message || 'Failed to register complaint');
        } finally {
            setLoading(false);
        }
    };

    if (loadingMasterData) {
        return (
            <div className="loading-container">
                <div className="spinner-enhanced"></div>
                <p>Loading form data...</p>
            </div>
        );
    }

    return (
        <div className="create-complaint-page fade-in">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1>
                        <FileText size={32} />
                        Register New Complaint
                    </h1>
                    <p>Fill in the details below to register your complaint</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="complaint-form">
                {/* Basic Information */}
                <div className="form-section">
                    <div className="section-header">
                        <h2>Basic Information</h2>
                        <p>Provide details about your complaint</p>
                    </div>

                    <div className="form-grid">
                        {/* Title */}
                        <div className="form-group full-width">
                            <label htmlFor="title">
                                <FileText size={18} />
                                Complaint Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Water leakage on Main Street"
                                className={errors.title ? 'error' : ''}
                                maxLength={200}
                            />
                            {errors.title && (
                                <span className="error-message">
                                    <AlertCircle size={14} />
                                    {errors.title}
                                </span>
                            )}
                            <span className="char-count">{formData.title.length}/200</span>
                        </div>

                        {/* Description */}
                        <div className="form-group full-width">
                            <label htmlFor="description">
                                <FileText size={18} />
                                Description *
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the issue in detail..."
                                rows={5}
                                className={errors.description ? 'error' : ''}
                                maxLength={1000}
                            />
                            {errors.description && (
                                <span className="error-message">
                                    <AlertCircle size={14} />
                                    {errors.description}
                                </span>
                            )}
                            <span className="char-count">{formData.description.length}/1000</span>
                        </div>

                        {/* Category */}
                        <div className="form-group">
                            <label htmlFor="category">
                                <Tag size={18} />
                                Category *
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.icon} {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Priority */}
                        <div className="form-group">
                            <label htmlFor="priority">
                                <Flag size={18} />
                                Priority *
                            </label>
                            <select
                                id="priority"
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                style={{ borderLeftColor: priorities.find(p => p.value === formData.priority)?.color }}
                            >
                                {priorities.map(pri => (
                                    <option key={pri.value} value={pri.value}>
                                        {pri.icon} {pri.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Location Information */}
                <div className="form-section">
                    <div className="section-header">
                        <h2>Location Information</h2>
                        <p>Specify where the issue is located</p>
                    </div>

                    <div className="form-grid">
                        {/* Location */}
                        <div className="form-group full-width">
                            <label htmlFor="location">
                                <MapPin size={18} />
                                Location Address *
                            </label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g., Main Street, Near City Mall"
                                className={errors.location ? 'error' : ''}
                            />
                            {errors.location && (
                                <span className="error-message">
                                    <AlertCircle size={14} />
                                    {errors.location}
                                </span>
                            )}
                        </div>

                        {/* GPS Coordinates */}
                        <div className="form-group">
                            <label>
                                <Navigation size={18} />
                                GPS Coordinates
                            </label>
                            <div className="gps-container">
                                <div className="gps-display">
                                    <span>Lat: {formData.latitude.toFixed(6)}</span>
                                    <span>Lng: {formData.longitude.toFixed(6)}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={getCurrentLocation}
                                    className="btn-get-location"
                                    disabled={gettingLocation}
                                >
                                    <Navigation size={18} className={gettingLocation ? 'spinning' : ''} />
                                    {gettingLocation ? 'Getting Location...' : 'Get Current Location'}
                                </button>
                            </div>
                        </div>

                        {/* Ward */}
                        <div className="form-group">
                            <label htmlFor="wardId">
                                <Building size={18} />
                                Ward *
                            </label>
                            <select
                                id="wardId"
                                name="wardId"
                                value={formData.wardId}
                                onChange={handleChange}
                                className={errors.wardId ? 'error' : ''}
                            >
                                <option value="">Select Ward</option>
                                {wards.map(ward => (
                                    <option key={ward.wardId} value={ward.wardId}>
                                        Ward {ward.wardNumber} - {ward.areaName}
                                    </option>
                                ))}
                            </select>
                            {errors.wardId && (
                                <span className="error-message">
                                    <AlertCircle size={14} />
                                    {errors.wardId}
                                </span>
                            )}
                        </div>

                        {/* Department */}
                        <div className="form-group">
                            <label htmlFor="departmentId">
                                <Building size={18} />
                                Department *
                            </label>
                            <select
                                id="departmentId"
                                name="departmentId"
                                value={formData.departmentId}
                                onChange={handleChange}
                                className={errors.departmentId ? 'error' : ''}
                            >
                                <option value="">Select Department</option>
                                {departments.map(dept => (
                                    <option key={dept.departmentId} value={dept.departmentId}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                            {errors.departmentId && (
                                <span className="error-message">
                                    <AlertCircle size={14} />
                                    {errors.departmentId}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="form-section">
                    <div className="section-header">
                        <h2>Upload Images</h2>
                        <p>Add up to 5 images to help us understand the issue better (Optional)</p>
                    </div>

                    <div className="image-upload-container">
                        {/* Upload Button */}
                        {images.length < 5 && (
                            <label className="image-upload-box">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />
                                <div className="upload-content">
                                    <Camera size={48} />
                                    <h3>Upload Images</h3>
                                    <p>Click to select images</p>
                                    <span className="upload-hint">
                                        {images.length}/5 images uploaded
                                    </span>
                                    <span className="upload-hint">Max 5MB per image</span>
                                </div>
                            </label>
                        )}

                        {/* Image Previews */}
                        {imagePreviews.map((preview, index) => (
                            <div key={index} className="image-preview">
                                <img src={preview} alt={`Preview ${index + 1}`} />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="remove-image"
                                    title="Remove image"
                                >
                                    <X size={18} />
                                </button>
                                <div className="image-info">
                                    <ImageIcon size={14} />
                                    <span>Image {index + 1}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {images.length > 0 && (
                        <div className="image-upload-info">
                            <CheckCircle size={16} />
                            <span>{images.length} image{images.length > 1 ? 's' : ''} ready to upload</span>
                        </div>
                    )}
                </div>

                {/* Submit Buttons */}
                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/citizen/complaints')}
                        className="btn-secondary"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner-small"></div>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={20} />
                                Submit Complaint
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateComplaint;
