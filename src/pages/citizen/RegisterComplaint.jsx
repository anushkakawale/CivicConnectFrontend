import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import apiService from '../../api/apiService';
import {
    FileText, Building2, Upload, AlertCircle, Loader,
    MapPin, X, Image as ImageIcon, CheckCircle, Navigation,
    ArrowRight
} from 'lucide-react';
import { WARDS } from '../../constants';

const RegisterComplaint = () => {
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [userWard, setUserWard] = useState(null);

    // Image State
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    // Alerts
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoadingData(true);
            const [deptRes, profileRes] = await Promise.all([
                apiService.masterData.getDepartments(),
                apiService.profile.getProfile()
            ]);

            setDepartments(deptRes.data || []);

            // Pre-fill ward data if available in profile and LOCK IT
            if (profileRes.data) {
                const wId = profileRes.data.wardId || profileRes.data.wardNumber;
                if (wId) {
                    formik.setFieldValue('wardId', wId);

                    // Find ward details for display
                    const wDetails = WARDS.find(w => w.wardId === parseInt(wId)) || {
                        number: wId,
                        area_name: profileRes.data.areaName || 'Your Ward'
                    };
                    setUserWard(wDetails);
                } else {
                    setError("⚠️ Start Registration Failed: You must be assigned to a ward to register complaints. Please update your profile.");
                }
            }
        } catch (err) {
            console.error("Failed to load initial data", err);
            setError("Failed to load departments. Please reload the page.");
        } finally {
            setLoadingData(false);
        }
    };

    const attemptAutoLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        formik.setStatus({ gettingLocation: true });

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                formik.setFieldValue('latitude', pos.coords.latitude.toFixed(6));
                formik.setFieldValue('longitude', pos.coords.longitude.toFixed(6));
                formik.setStatus({ gettingLocation: false });
                setSuccess("Location detected successfully!");
                setTimeout(() => setSuccess(''), 3000);
            },
            (err) => {
                console.error("Location Error: ", err);
                setError("Unable to retrieve your location. Please enter manually.");
                formik.setStatus({ gettingLocation: false });
            }
        );
    };

    const handleImageChange = (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const totalImages = selectedImages.length + files.length;

            if (totalImages > 5) {
                setError("You can only upload a maximum of 5 images.");
                return;
            }

            const newPreviews = files.map(file => URL.createObjectURL(file));

            setSelectedImages([...selectedImages, ...files]);
            setImagePreviews([...imagePreviews, ...newPreviews]);
            setError('');
        }
    };

    const removeImage = (index) => {
        const newImages = selectedImages.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        URL.revokeObjectURL(imagePreviews[index]);
        setSelectedImages(newImages);
        setImagePreviews(newPreviews);
    };

    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            departmentId: '',
            wardId: '',
            latitude: '',
            longitude: ''
        },
        validationSchema: Yup.object({
            title: Yup.string().required('Title is required').min(5, 'Too short'),
            description: Yup.string().required('Description is required').min(20, 'Please provide more details (min 20 chars)'),
            departmentId: Yup.string().required('Please select a department'),
            wardId: Yup.string().required('Ward is required'),
            latitude: Yup.number().required('Location is required').min(-90).max(90),
            longitude: Yup.number().required('Location is required').min(-180).max(180)
        }),
        onSubmit: async (values) => {
            setSubmitting(true);
            setError('');

            try {
                // 1. Submit Complaint Data
                const payload = {
                    title: values.title,
                    description: values.description,
                    wardId: parseInt(values.wardId),
                    departmentId: parseInt(values.departmentId),
                    latitude: parseFloat(values.latitude),
                    longitude: parseFloat(values.longitude)
                };

                const res = await apiService.citizen.createComplaint(payload);
                const complaintId = res.data.complaintId || res.data.id || res.data.complaint_id;

                // 2. Upload Images (if any)
                if (selectedImages.length > 0 && complaintId) {
                    for (const file of selectedImages) {
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('stage', 'BEFORE_WORK');

                        // Using our generic uploadImage method
                        await apiService.citizen.uploadImage(complaintId, formData);
                    }
                }

                setSuccess('Complaint Registered Successfully!');

                // Redirect to My Complaints Page
                setTimeout(() => {
                    navigate('/citizen/complaints');
                }, 1000);

            } catch (err) {
                console.error("Submission failed", err);
                setError(err.response?.data?.message || "Failed to register complaint. Please try again.");
            } finally {
                setSubmitting(false);
            }
        }
    });

    if (loadingData) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 text-center sm:text-left">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Register a Complaint</h1>
                    <p className="mt-2 text-gray-600">Report issues in your ward directly to the concerned officials.</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center animate-fadeIn">
                        <AlertCircle className="mr-2" size={20} />
                        {error}
                        <button onClick={() => setError('')} className="ml-auto"><X size={18} /></button>
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center animate-fadeIn">
                        <CheckCircle className="mr-2" size={20} />
                        {success}
                    </div>
                )}

                <form onSubmit={formik.handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-orange-500 to-red-600"></div>
                        <div className="p-6 sm:p-8 space-y-8">

                            {/* Section 1: Basic Details */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center border-b pb-2">
                                    <FileText className="w-5 h-5 mr-2 text-orange-600" />
                                    Complaint Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Broken Streetlight on Main St"
                                            className={`w-full p-3 rounded-lg border bg-gray-50 focus:bg-white transition-colors ${formik.touched.title && formik.errors.title ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-orange-200 focus:border-orange-500'}`}
                                            {...formik.getFieldProps('title')}
                                        />
                                        {formik.touched.title && formik.errors.title && (
                                            <p className="mt-1 text-xs text-red-600 font-medium">{formik.errors.title}</p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                        <textarea
                                            rows="4"
                                            placeholder="Please describe the issue in detail..."
                                            className={`w-full p-3 rounded-lg border bg-gray-50 focus:bg-white transition-colors ${formik.touched.description && formik.errors.description ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-orange-200 focus:border-orange-500'}`}
                                            {...formik.getFieldProps('description')}
                                        />
                                        {formik.touched.description && formik.errors.description && (
                                            <p className="mt-1 text-xs text-red-600 font-medium">{formik.errors.description}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Location & Department */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center border-b pb-2">
                                    <MapPin className="w-5 h-5 mr-2 text-orange-600" />
                                    Location & Category
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* Department Dropdown */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Department</label>
                                        <div className="relative">
                                            <select
                                                className={`w-full p-3 rounded-lg border bg-gray-50 focus:bg-white text-gray-900 appearance-none transition-colors ${formik.touched.departmentId && formik.errors.departmentId ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'}`}
                                                {...formik.getFieldProps('departmentId')}
                                            >
                                                <option value="">Select Department</option>
                                                {departments.map(dept => (
                                                    <option key={dept.departmentId} value={dept.departmentId}>
                                                        {dept.departmentName}
                                                    </option>
                                                ))}
                                            </select>
                                            <Building2 className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={18} />
                                        </div>
                                    </div>

                                    {/* Ward Display (READ ONLY) */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ward (Your Assigned Area)</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                readOnly
                                                className="w-full p-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed font-medium"
                                                value={userWard ? `Ward ${userWard.number} - ${userWard.area_name}` : 'Loading...'}
                                            />
                                            <MapPin className="absolute right-3 top-3.5 text-gray-400" size={18} />
                                        </div>
                                    </div>

                                    {/* Geolocation */}
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">GPS Coordinates</label>
                                        <div className="flex flex-col sm:flex-row gap-4 mb-3">
                                            <div className="flex-1">
                                                <input
                                                    type="number"
                                                    step="any"
                                                    placeholder="Latitude"
                                                    className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                                                    {...formik.getFieldProps('latitude')}
                                                    readOnly={formik.status?.gettingLocation}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="number"
                                                    step="any"
                                                    placeholder="Longitude"
                                                    className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                                                    {...formik.getFieldProps('longitude')}
                                                    readOnly={formik.status?.gettingLocation}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={attemptAutoLocation}
                                                disabled={formik.status?.gettingLocation}
                                                className="bg-indigo-50 text-indigo-600 px-4 py-3 rounded-lg font-semibold text-sm hover:bg-indigo-100 transition-colors flex items-center justify-center min-w-[160px]"
                                            >
                                                {formik.status?.gettingLocation ? (
                                                    <><Loader className="animate-spin mr-2" size={16} /> Detecting...</>
                                                ) : (
                                                    <><Navigation className="mr-2" size={16} /> Auto-Detect</>
                                                )}
                                            </button>
                                        </div>
                                        {(formik.errors.latitude || formik.errors.longitude) && (
                                            <p className="text-xs text-red-600 font-medium">Location coordinates are required.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Evidence */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center border-b pb-2">
                                    <ImageIcon className="w-5 h-5 mr-2 text-orange-600" />
                                    Evidence (Optional)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <label className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors h-40">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                                            <Upload className="text-orange-600" size={20} />
                                        </div>
                                        <span className="text-sm font-semibold text-gray-600">Upload Photos</span>
                                        <span className="text-xs text-gray-400 mt-1">Max 5 images</span>
                                    </label>

                                    {imagePreviews.map((src, index) => (
                                        <div key={index} className="relative h-40 rounded-xl overflow-hidden shadow-sm group">
                                            <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 sm:px-8 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`
                                    flex items-center px-8 py-3 rounded-xl text-white font-bold shadow-lg transform transition-all 
                                    ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-orange-600 to-red-600 hover:shadow-orange-200 hover:-translate-y-1'}
                                `}
                            >
                                {submitting ? (
                                    <><Loader className="animate-spin mr-2" size={20} /> Registering...</>
                                ) : (
                                    <><span className="mr-2">Submit Complaint</span> <ArrowRight size={20} /></>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterComplaint;
