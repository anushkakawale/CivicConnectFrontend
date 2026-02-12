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
  MapPin,
  Briefcase
} from 'lucide-react';
import ModernLayout from "../../components/layout/ModernLayout";
import { GovButton, GovInput, GovAlert, GovBadge } from "../../components/ui/GovComponents";

const DepartmentOfficerRegistration = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('email') || 'Ward Officer';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [wards, setWards] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch wards and departments data
    const fetchData = async () => {
      try {
        const [wardsResponse, departmentsResponse] = await Promise.all([
          axios.get('/api/wards'),
          axios.get('/api/departments')
        ]);
        setWards(wardsResponse.data);
        setDepartments(departmentsResponse.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        // Use mock data if API fails
        setWards([
          { wardId: 1, number: 1, area_name: 'Shivaji Nagar' },
          { wardId: 2, number: 2, area_name: 'Kothrud' },
          { wardId: 3, number: 3, area_name: 'Hadapsar' },
          { wardId: 4, number: 4, area_name: 'Baner' },
          { wardId: 5, number: 5, area_name: 'Kasba Peth' }
        ]);
        setDepartments([
          { department_id: 1, name: 'Water Supply', sla_hours: 24, priority_level: 'HIGH' },
          { department_id: 2, name: 'Sanitation', sla_hours: 36, priority_level: 'MEDIUM' },
          { department_id: 3, name: 'Roads', sla_hours: 72, priority_level: 'LOW' },
          { department_id: 4, name: 'Electricity', sla_hours: 24, priority_level: 'HIGH' },
          { department_id: 5, name: 'Waste Management', sla_hours: 12, priority_level: 'CRITICAL' },
          { department_id: 6, name: 'Public Safety', sla_hours: 6, priority_level: 'CRITICAL' },
          { department_id: 7, name: 'Health', sla_hours: 48, priority_level: 'MEDIUM' },
          { department_id: 8, name: 'Education', sla_hours: 96, priority_level: 'LOW' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      mobile: '',
      password: '',
      confirmPassword: '',
      departmentId: ''
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
      departmentId: Yup.string()
        .required('Department selection is required')
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      setError('');
      setSuccess('');

      try {
        const response = await axios.post('/api/ward-officer/register/department-officer', {
          name: values.name,
          email: values.email,
          mobile: values.mobile,
          password: values.password,
          wardId: parseInt(localStorage.getItem('wardId') || 1),
          departmentId: parseInt(values.departmentId)
        });

        setSuccess('Strategic Personnel Enrolled Successfully');

        setTimeout(() => {
          navigate('/ward-officer/dashboard');
        }, 2000);
      } catch (err) {
        setError(err.response?.data?.message || 'Enrollment failed. Network or permission error.');
      } finally {
        setIsLoading(false);
      }
    }
  });

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <RefreshCw className="animate-spin text-primary mb-3" size={48} />
          <p className="fw-black extra-small tracking-widest text-muted uppercase">Synchronizing Command Data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC', position: 'relative', overflow: 'hidden' }}>
      {/* Tactical Grid Background Overlay */}
      <div className="position-absolute top-0 start-0 w-100 h-100 opacity-05 pointer-events-none" style={{
        backgroundImage: `linear-gradient(#1254AF 1px, transparent 1px), linear-gradient(90deg, #1254AF 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        zIndex: 0
      }}></div>

      <DashboardHeader
        portalName="WARD COMMAND HUB"
        userName="OFFICER ENROLLMENT"
        wardName={localStorage.getItem('wardName') || 'PMC WARD'}
        subtitle="STRATEGIC RECRUITMENT | FUNCTIONAL SPECIALIST ONBOARDING"
        icon={UserPlus}
      />

      <div className="container-fluid px-3 px-lg-5 position-relative" style={{ marginTop: '-40px', zIndex: 1 }}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <GovButton
                variant="outline"
                size="sm"
                onClick={() => navigate('/ward-officer/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </GovButton>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Register Department Officer</h1>
                <p className="text-slate-600">Add a new department officer to your ward</p>
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
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center uppercase tracking-tight">
                  <Building2 className="w-5 h-5 mr-3 text-primary" />
                  Operational Assignment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="extra-small fw-black text-muted uppercase tracking-widest mb-2 d-block">Assigned Ward (Automatic)</label>
                    <div className="p-3 bg-light rounded-4 border d-flex align-items-center gap-3">
                      <MapPin size={18} className="text-primary opacity-40" />
                      <span className="fw-black text-dark small">{localStorage.getItem('wardName') || 'Current Jurisdiction'}</span>
                    </div>
                  </div>

                  <GovInput
                    label="Functional Department"
                    type="select"
                    icon={Briefcase}
                    {...formik.getFieldProps('departmentId')}
                    error={formik.touched.departmentId && formik.errors.departmentId}
                  >
                    <option value="">Select Specialized Unit</option>
                    {departments.map((dept) => (
                      <option key={dept.departmentId || dept.id} value={dept.departmentId || dept.id}>
                        {(dept.name || dept.departmentName || 'Unknown Division').toUpperCase()}
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
                  onClick={() => navigate('/ward-officer/dashboard')}
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
                      Register Officer
                    </>
                  )}
                </GovButton>
              </div>
            </form>
          </div>

          {/* Information Card */}
          <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Registration Information</h3>
            <div className="space-y-3 text-sm text-blue-800">
              <p>• The department officer will be assigned to your ward and selected department</p>
              <p>• They will receive login credentials via email after registration</p>
              <p>• The officer will be automatically assigned pending complaints from their department</p>
              <p>• You can manage all department officers from the Officers section</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentOfficerRegistration;
