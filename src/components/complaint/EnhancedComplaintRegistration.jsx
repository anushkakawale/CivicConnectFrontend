import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import apiService from '../../api/apiService';
import {
  FileText,
  MapPin,
  Building2,
  Users,
  Phone,
  Mail,
  Camera,
  Upload,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Shield,
  Star,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Image as ImageIcon,
  File,
  Video,
  Mic
} from 'lucide-react';
import { GovButton, GovInput, GovAlert, GovBadge } from '../ui/GovComponents';

const EnhancedComplaintRegistration = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [wards, setWards] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);

  const totalSteps = 4;

  useEffect(() => {
    fetchWards();
    fetchDepartments();
  }, []);

  const fetchWards = async () => {
    try {
      const response = await apiService.common.getWards();
      setWards(response.data || response);
    } catch (err) {
      console.error('Failed to fetch wards:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await apiService.common.getDepartments();
      setDepartments(response.data || response);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  const validationSchema = Yup.object({
    title: Yup.string()
      .min(5, 'Title must be at least 5 characters')
      .max(100, 'Title must not exceed 100 characters')
      .required('Title is required'),
    description: Yup.string()
      .min(20, 'Description must be at least 20 characters')
      .max(1000, 'Description must not exceed 1000 characters')
      .required('Description is required'),
    category: Yup.string()
      .required('Category is required'),
    priority: Yup.string()
      .required('Priority level is required'),
    wardId: Yup.string()
      .required('Ward selection is required'),
    departmentId: Yup.string()
      .required('Department selection is required'),
    location: Yup.string()
      .min(5, 'Location must be at least 5 characters')
      .required('Location is required'),
    contactName: Yup.string()
      .min(2, 'Name must be at least 2 characters')
      .required('Contact name is required'),
    contactPhone: Yup.string()
      .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
      .required('Phone number is required'),
    contactEmail: Yup.string()
      .email('Please enter a valid email address')
      .required('Email address is required'),
    expectedResolution: Yup.string()
      .required('Expected resolution time is required')
  });

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      category: '',
      priority: '',
      wardId: '',
      departmentId: '',
      location: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      expectedResolution: '',
      additionalInfo: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      setError('');
      setSuccess('');

      try {
        // 1. Register Complaint first (without images)
        const complaintData = {
          title: values.title,
          description: values.description,
          category: values.category,
          priority: values.priority,
          wardId: parseInt(values.wardId),
          departmentId: parseInt(values.departmentId),
          address: values.location
        };

        const response = await apiService.citizen.createComplaint(complaintData);
        const complaintId = response.data.complaintId || response.data.id;

        if (!complaintId) {
          throw new Error('Failed to get tracking ID from server');
        }

        // 2. Upload images one by one using FormData as per guide
        if (uploadedFiles.length > 0) {
          setSuccess('Complaint created! Uploading images (0/' + uploadedFiles.length + ')...');

          for (let i = 0; i < uploadedFiles.length; i++) {
            const fileObj = uploadedFiles[i];
            const formData = new FormData();
            formData.append('file', fileObj.file);
            formData.append('stage', 'INITIAL');

            try {
              await apiService.complaint.uploadImage(complaintId, formData);
              setSuccess(`Complaint created! Uploading images (${i + 1}/${uploadedFiles.length})...`);
            } catch (uploadErr) {
              console.error(`Failed to upload file ${i + 1}:`, uploadErr);
            }
          }
        }

        setSuccess('Complaint registered successfully! Tracking ID: ' + complaintId);

        // Reset form after successful submission
        setTimeout(() => {
          formik.resetForm();
          setUploadedFiles([]);
          setCurrentStep(1);
          navigate('/citizen/dashboard');
        }, 3000);
      } catch (err) {
        console.error('Registration error:', err);
        setError(err.response?.data?.message || err.message || 'Failed to register complaint. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.startsWith('image/') ||
        file.type.startsWith('video/') ||
        file.type.startsWith('audio/') ||
        file.type === 'application/pdf';
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit

      return isValidType && isValidSize;
    });

    const newFiles = validFiles.map(file => ({
      file,
      id: Date.now() + Math.random(),
      type: file.type.split('/')[0],
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Create preview for images
    validFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImages(prev => [...prev, {
            id: file.name + Date.now(),
            url: reader.result
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    setPreviewImages(prev => prev.filter(p => !p.id.includes(fileId.toString())));
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return ImageIcon;
      case 'video': return Video;
      case 'audio': return Mic;
      default: return File;
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepIcon = (step) => {
    switch (step) {
      case 1: return FileText;
      case 2: return MapPin;
      case 3: return Users;
      case 4: return Upload;
      default: return CheckCircle;
    }
  };

  const getStepTitle = (step) => {
    switch (step) {
      case 1: return 'Complaint Details';
      case 2: return 'Location Information';
      case 3: return 'Contact Information';
      case 4: return 'Attachments';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Register a Complaint</h1>
          <p className="text-lg text-slate-600">Report civic issues and track their resolution</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full"></div>
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            ></div>

            {Array.from({ length: totalSteps }, (_, index) => {
              const step = index + 1;
              const StepIcon = getStepIcon(step);
              const isActive = step === currentStep;
              const isCompleted = step < currentStep;

              return (
                <div key={step} className="relative z-10">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : isActive
                      ? 'bg-white border-2 border-blue-600 text-blue-600 shadow-lg'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-slate-900' : 'text-slate-400'
                      }`}>
                      {getStepTitle(step)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="h-8"></div>
        </div>

        {/* Alert Messages */}
        {error && (
          <GovAlert type="error" className="mb-6">
            <div className="font-medium">Registration Failed</div>
            <div className="text-sm mt-1">{error}</div>
          </GovAlert>
        )}

        {success && (
          <GovAlert type="success" className="mb-6">
            <div className="font-medium">Success!</div>
            <div className="text-sm mt-1">{success}</div>
          </GovAlert>
        )}

        {/* Form */}
        <form onSubmit={formik.handleSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {/* Step 1: Complaint Details */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Complaint Details</h2>
                  <p className="text-slate-600">Tell us about the issue you're facing</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GovInput
                  label="Complaint Title"
                  type="text"
                  icon={FileText}
                  placeholder="Brief description of the issue"
                  {...formik.getFieldProps('title')}
                  error={formik.touched.title && formik.errors.title}
                />

                <GovInput
                  label="Category"
                  type="select"
                  icon={Target}
                  {...formik.getFieldProps('category')}
                  error={formik.touched.category && formik.errors.category}
                >
                  <option value="">Select category</option>
                  {departments.map(dept => (
                    <option key={dept.department_id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </GovInput>

                <GovInput
                  label="Priority Level"
                  type="select"
                  icon={Zap}
                  {...formik.getFieldProps('priority')}
                  error={formik.touched.priority && formik.errors.priority}
                >
                  <option value="">Select priority</option>
                  <option value="LOW">Low - Minor inconvenience</option>
                  <option value="MEDIUM">Medium - Affects daily life</option>
                  <option value="HIGH">High - Urgent attention needed</option>
                  <option value="CRITICAL">Critical - Emergency situation</option>
                </GovInput>

                <GovInput
                  label="Expected Resolution"
                  type="select"
                  icon={Clock}
                  {...formik.getFieldProps('expectedResolution')}
                  error={formik.touched.expectedResolution && formik.errors.expectedResolution}
                >
                  <option value="">Select expected time</option>
                  <option value="IMMEDIATE">Immediate (Within 24 hours)</option>
                  <option value="URGENT">Urgent (Within 3 days)</option>
                  <option value="NORMAL">Normal (Within 7 days)</option>
                  <option value="FLEXIBLE">Flexible (Within 30 days)</option>
                </GovInput>
              </div>

              <GovInput
                label="Detailed Description"
                type="textarea"
                icon={FileText}
                placeholder="Provide a detailed description of the issue, including when it started and how it affects you..."
                rows={6}
                {...formik.getFieldProps('description')}
                error={formik.touched.description && formik.errors.description}
              />

              <GovInput
                label="Additional Information"
                type="textarea"
                icon={FileText}
                placeholder="Any additional details that might help resolve the issue..."
                rows={3}
                {...formik.getFieldProps('additionalInfo')}
              />
            </div>
          )}

          {/* Step 2: Location Information */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-green-100 rounded-xl">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Location Information</h2>
                  <p className="text-slate-600">Where is this issue located?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GovInput
                  label="Ward/Area"
                  type="select"
                  icon={Building2}
                  {...formik.getFieldProps('wardId')}
                  error={formik.touched.wardId && formik.errors.wardId}
                >
                  <option value="">Select your ward</option>
                  {wards.map(ward => (
                    <option key={ward.wardId} value={ward.wardId}>
                      Ward {ward.number} - {ward.area_name}
                    </option>
                  ))}
                </GovInput>

                <GovInput
                  label="Department"
                  type="select"
                  icon={Shield}
                  {...formik.getFieldProps('departmentId')}
                  error={formik.touched.departmentId && formik.errors.departmentId}
                >
                  <option value="">Select responsible department</option>
                  {departments.map(dept => (
                    <option key={dept.department_id} value={dept.department_id}>
                      {dept.name} (SLA: {dept.sla_hours}h)
                    </option>
                  ))}
                </GovInput>
              </div>

              <GovInput
                label="Specific Location"
                type="text"
                icon={MapPin}
                placeholder="Enter the exact address or landmark"
                {...formik.getFieldProps('location')}
                error={formik.touched.location && formik.errors.location}
              />

              {/* SLA Information */}
              {formik.values.departmentId && (
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Service Level Agreement (SLA)</h3>
                  </div>
                  {(() => {
                    const dept = departments.find(d => d.department_id == formik.values.departmentId);
                    return dept ? (
                      <div className="space-y-2 text-sm text-blue-800">
                        <p><strong>Department:</strong> {dept.name}</p>
                        <p><strong>Expected Resolution Time:</strong> {dept.sla_hours} hours</p>
                        <p><strong>Priority Level:</strong> {dept.priority_level}</p>
                        <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                          <p className="text-xs">The department aims to resolve your complaint within {dept.sla_hours} hours based on their SLA commitment.</p>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Contact Information */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Contact Information</h2>
                  <p className="text-slate-600">How can we reach you?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GovInput
                  label="Your Name"
                  type="text"
                  icon={Users}
                  placeholder="Enter your full name"
                  {...formik.getFieldProps('contactName')}
                  error={formik.touched.contactName && formik.errors.contactName}
                />

                <GovInput
                  label="Phone Number"
                  type="tel"
                  icon={Phone}
                  placeholder="10-digit mobile number"
                  {...formik.getFieldProps('contactPhone')}
                  error={formik.touched.contactPhone && formik.errors.contactPhone}
                />

                <GovInput
                  label="Email Address"
                  type="email"
                  icon={Mail}
                  placeholder="your.email@example.com"
                  {...formik.getFieldProps('contactEmail')}
                  error={formik.touched.contactEmail && formik.errors.contactEmail}
                />
              </div>

              {/* Privacy Notice */}
              <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-amber-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-2">Privacy & Communication</h3>
                    <ul className="text-sm text-amber-800 space-y-1">
                      <li>• Your contact information will be used only for complaint resolution</li>
                      <li>• You'll receive updates on your complaint status</li>
                      <li>• Your personal information is protected as per privacy policy</li>
                      <li>• Emergency contact may be made if critical issues are identified</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Attachments */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Upload className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Attachments</h2>
                  <p className="text-slate-600">Add photos, videos, or documents to support your complaint</p>
                </div>
              </div>

              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                  }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-2">
                  Drag and drop files here, or{' '}
                  <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                    browse
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*,audio/*,.pdf"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-sm text-slate-500">
                  Supported formats: Images, Videos, Audio, PDF (Max 10MB per file)
                </p>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-900">Uploaded Files ({uploadedFiles.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {uploadedFiles.map((file) => {
                      const FileIcon = getFileIcon(file.type);
                      return (
                        <div key={file.id} className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="p-2 bg-white rounded-lg border border-slate-200">
                            <FileIcon className="w-5 h-5 text-slate-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                            <p className="text-xs text-slate-500">{file.size}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(file.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Image Preview */}
              {previewImages.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-900">Image Preview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previewImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.url}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg border border-slate-200"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File Guidelines */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">File Guidelines</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Clear photos help identify the issue better</li>
                      <li>• Videos can show the severity of the problem</li>
                      <li>• Documents can provide additional context</li>
                      <li>• Maximum file size: 10MB per file</li>
                      <li>• Supported formats: JPG, PNG, MP4, PDF, and more</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-8 border-t border-slate-200">
            <GovButton
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </GovButton>

            {currentStep < totalSteps ? (
              <GovButton
                type="button"
                variant="primary"
                onClick={nextStep}
                className="flex items-center space-x-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </GovButton>
            ) : (
              <GovButton
                type="submit"
                variant="primary"
                loading={submitting}
                disabled={submitting}
                className="flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Submit Complaint
                  </>
                )}
              </GovButton>
            )}
          </div>
        </form>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@civicconnect.gov" className="text-blue-600 hover:text-blue-700 font-medium">
              support@civicconnect.gov
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedComplaintRegistration;
