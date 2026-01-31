import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from '../../api/axios';
import {
  UserPlus,
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Phone,
  User,
  Building2,
  MapPin
} from 'lucide-react';
import ModernLayout from "../../components/layout/ModernLayout";
import { GovButton, GovInput, GovAlert, GovBadge } from "../../components/ui/GovComponents";

const AdminWardOfficerRegistration = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('email') || 'Admin';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch wards data
    const fetchWards = async () => {
      try {
        const response = await axios.get('/api/wards');
        setWards(response.data);
      } catch (err) {
        console.error('Failed to fetch wards:', err);
        // Use mock data if API fails
        setWards([
          { wardId: 1, number: 1, area_name: 'Shivaji Nagar' },
          { wardId: 2, number: 2, area_name: 'Kothrud' },
          { wardId: 3, number: 3, area_name: 'Hadapsar' },
          { wardId: 4, number: 4, area_name: 'Baner' },
          { wardId: 5, number: 5, area_name: 'Kasba Peth' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchWards();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      mobile: '',
      password: '',
      confirmPassword: '',
      wardId: ''
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .required('Name is required'),
      email: Yup.string()
        .email('Please enter a valid email address')
        .required('Email address is required'),
      mobile: Yup.string()
        .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits')
        .required('Mobile number is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number')
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
      wardId: Yup.string()
        .required('Ward selection is required')
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      setError('');
      setSuccess('');

      try {
        const response = await axios.post('/api/admin/register/ward-officer', {
          name: values.name,
          email: values.email,
          mobile: values.mobile,
          password: values.password,
          wardId: parseInt(values.wardId)
        });

        setSuccess('Ward Officer registered successfully!');

        setTimeout(() => {
          navigate('/admin/officers');
        }, 2000);
      } catch (err) {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  });

  if (loading) {
    return (
      <ModernLayout role="ADMIN" userName={userName}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <div className="admin-container p-6 bg-slate-50 min-h-full">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <GovButton
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </GovButton>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Register Ward Officer</h1>
              <p className="text-slate-600">Add a new ward officer to manage civic operations</p>
            </div>
          </div>
        </div>

        {/* Alerts */}
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

        {/* Registration Form */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          <form onSubmit={formik.handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GovInput
                  label="Full Name"
                  type="text"
                  icon={User}
                  placeholder="Enter officer's full name"
                  {...formik.getFieldProps('name')}
                  error={formik.touched.name && formik.errors.name}
                />

                <GovInput
                  label="Email Address"
                  type="email"
                  icon={Mail}
                  placeholder="Enter email address"
                  {...formik.getFieldProps('email')}
                  error={formik.touched.email && formik.errors.email}
                />

                <GovInput
                  label="Mobile Number"
                  type="tel"
                  icon={Phone}
                  placeholder="Enter 10-digit mobile number"
                  {...formik.getFieldProps('mobile')}
                  error={formik.touched.mobile && formik.errors.mobile}
                />
              </div>
            </div>

            {/* Assignment Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-green-600" />
                Assignment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GovInput
                  label="Ward Assignment"
                  type="select"
                  icon={MapPin}
                  {...formik.getFieldProps('wardId')}
                  error={formik.touched.wardId && formik.errors.wardId}
                >
                  <option value="">Select ward for assignment</option>
                  {wards.map((ward) => (
                    <option key={ward.wardId} value={ward.wardId}>
                      Ward {ward.wardNumber || ward.number} - {ward.wardName || ward.areaName || ward.area_name}
                    </option>
                  ))}
                </GovInput>
              </div>
            </div>

            {/* Security Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-amber-600" />
                Security Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GovInput
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  icon={Lock}
                  placeholder="Enter password"
                  {...formik.getFieldProps('password')}
                  error={formik.touched.password && formik.errors.password}
                >
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </GovInput>

                <GovInput
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  icon={Lock}
                  placeholder="Confirm password"
                  {...formik.getFieldProps('confirmPassword')}
                  error={formik.touched.confirmPassword && formik.errors.confirmPassword}
                >
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </GovInput>
              </div>

              {/* Password Requirements */}
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="text-sm font-semibold text-amber-900 mb-2">Password Requirements:</h4>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• At least 6 characters long</li>
                  <li>• Must contain uppercase letter (A-Z)</li>
                  <li>• Must contain lowercase letter (a-z)</li>
                  <li>• Must contain number (0-9)</li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <GovButton
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/dashboard')}
              >
                Cancel
              </GovButton>
              <GovButton
                type="submit"
                variant="primary"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Register Ward Officer
                  </>
                )}
              </GovButton>
            </div>
          </form>
        </div>

        {/* Information Card */}
        <div className="mt-8 bg-purple-50 rounded-xl p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-900 mb-4">Admin Registration Information</h3>
          <div className="space-y-3 text-sm text-purple-800">
            <p>• The ward officer will have full authority over their assigned ward</p>
            <p>• They can register department officers and manage ward operations</p>
            <p>• They can approve ward changes and monitor SLA compliance</p>
            <p>• The officer will receive login credentials via email after registration</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWardOfficerRegistration;
