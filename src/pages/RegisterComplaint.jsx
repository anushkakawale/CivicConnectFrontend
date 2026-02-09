import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../api/apiService';
import { useToast } from '../components/ui/ToastProvider';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function RegisterComplaintEnhanced() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    departmentId: '',
    latitude: '',
    longitude: ''
  });
  const [errors, setErrors] = useState({});
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await apiService.masterData.getDepartments();
      setDepartments(response.data || response || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      toast.error('Failed to load departments');
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        });
        setLocationLoading(false);
        toast.success('Location captured!');
      },
      (error) => {
        setLocationLoading(false);
        toast.error('Unable to get location');
      }
    );
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast.warning('Maximum 5 images allowed');
      return;
    }

    const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast.error('Each image must be less than 5MB');
      return;
    }

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
    setImages([...images, ...files]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    setImages(images.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim() || formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }
    if (!formData.description.trim() || formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }
    if (!formData.departmentId) {
      newErrors.departmentId = 'Please select a department';
    }
    if (!formData.latitude || !formData.longitude) {
      newErrors.location = 'Location is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors');
      return;
    }

    setLoading(true);
    try {
      const complaintData = {
        title: formData.title,
        description: formData.description,
        departmentId: parseInt(formData.departmentId),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };

      const response = await apiService.complaint.create(complaintData);
      const complaintId = response.data.complaintId;

      // Upload images
      if (images.length > 0) {
        for (const image of images) {
          await apiService.image.upload(complaintId, image);
        }
      }

      toast.success('Complaint submitted successfully!');
      navigate('/citizen/complaints');
    } catch (error) {
      console.error('Failed to submit complaint:', error);
      toast.error(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fc', minHeight: '100vh' }}>
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-lg rounded-0 animate-scale-in">
            <div className="card-body p-5">
              {/* Header */}
              <div className="text-center mb-4">
                <div className="d-inline-flex align-items-center justify-content-center mb-3 rounded-0 animate-scale-in" style={{
                  width: '70px',
                  height: '70px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}>
                  <i className="bi bi-megaphone text-white" style={{ fontSize: '2rem' }}></i>
                </div>
                <h2 className="fw-bold gradient-text mb-2">Submit New Complaint</h2>
                <p className="text-muted">Help us improve your community</p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Title */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Complaint Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                    placeholder="Brief description of the issue"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                  {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                  <small className="text-muted">{formData.title.length}/100 characters</small>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Detailed Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                    rows="5"
                    placeholder="Provide detailed information..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                  {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                  <small className="text-muted">{formData.description.length}/500 characters</small>
                </div>

                {/* Department */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Department <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${errors.departmentId ? 'is-invalid' : ''}`}
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.departmentId} value={dept.departmentId}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {errors.departmentId && <div className="invalid-feedback">{errors.departmentId}</div>}
                </div>

                {/* Location */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Location <span className="text-danger">*</span>
                  </label>
                  <button
                    type="button"
                    className="btn btn-outline-primary w-100 mb-3"
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                  >
                    {locationLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Getting Location...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-geo-alt me-2"></i>
                        Use Current Location
                      </>
                    )}
                  </button>
                  <div className="row g-2">
                    <div className="col-6">
                      <input
                        type="number"
                        step="0.000001"
                        className={`form-control ${errors.location ? 'is-invalid' : ''}`}
                        placeholder="Latitude"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <input
                        type="number"
                        step="0.000001"
                        className={`form-control ${errors.location ? 'is-invalid' : ''}`}
                        placeholder="Longitude"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      />
                    </div>
                  </div>
                  {errors.location && <div className="text-danger small mt-1">{errors.location}</div>}
                </div>

                {/* Images */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Upload Images (Optional)</label>
                  <p className="text-muted small">Add up to 5 images (max 5MB each)</p>
                  <div className="border-2 border-dashed rounded-0 p-4 text-center card-hover" style={{ borderStyle: 'dashed', borderColor: '#dee2e6' }}>
                    <input
                      type="file"
                      id="images"
                      className="d-none"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                    />
                    <label htmlFor="images" className="btn btn-outline-primary ripple" style={{ cursor: 'pointer' }}>
                      <i className="bi bi-cloud-upload me-2"></i>
                      Choose Images
                    </label>
                    <p className="text-muted small mt-2 mb-0">{images.length}/5 images selected</p>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="row g-2 mt-3">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className={`col-4 col-md-3 animate-scale-in stagger-${(index % 5) + 1}`}>
                          <div className="position-relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="img-fluid rounded-0"
                              style={{ height: '100px', width: '100%', objectFit: 'cover' }}
                            />
                            <button
                              type="button"
                              className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 ripple"
                              onClick={() => removeImage(index)}
                            >
                              <i className="bi bi-x"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary flex-grow-1 ripple"
                    onClick={() => navigate('/citizen/complaints')}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-grow-1 ripple"
                    disabled={loading}
                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        Submit Complaint
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="alert alert-info mt-4 mb-0">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Note:</strong> Your complaint will be reviewed within 24 hours.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
