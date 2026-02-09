import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Settings,
  Bell,
  LogOut,
  Edit,
  Camera,
  Save,
  X,
  Check,
  AlertCircle,
  Building2,
  Briefcase,
  Award,
  TrendingUp,
  Clock,
  FileText,
  Star,
  Users,
  Target,
  Zap
} from 'lucide-react';
import { GovButton, GovInput, GovAlert, GovBadge } from '../ui/GovComponents';

const UserProfile = ({ user, role, onUpdate, className = '' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    ward: user?.ward || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    joinDate: user?.joinDate || new Date().toISOString(),
    lastActive: user?.lastActive || new Date().toISOString()
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onUpdate(profileData);
      setIsEditing(false);
      setMessage('Profile updated successfully!');
      setMessageType('success');
    } catch (error) {
      setMessage('Failed to update profile');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || '',
      ward: user?.ward || '',
      bio: user?.bio || '',
      avatar: user?.avatar || '',
      joinDate: user?.joinDate || new Date().toISOString(),
      lastActive: user?.lastActive || new Date().toISOString()
    });
    setIsEditing(false);
    setMessage('');
  };

  const getRoleColor = () => {
    switch (role) {
      case 'ADMIN': return 'from-purple-600 to-purple-700';
      case 'WARD_OFFICER': return 'from-green-600 to-green-700';
      case 'DEPARTMENT_OFFICER': return 'from-blue-600 to-blue-700';
      case 'CITIZEN': return 'from-amber-600 to-amber-700';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'ADMIN': return Shield;
      case 'WARD_OFFICER': return Building2;
      case 'DEPARTMENT_OFFICER': return Briefcase;
      case 'CITIZEN': return Users;
      default: return User;
    }
  };

  const getRoleTitle = () => {
    switch (role) {
      case 'ADMIN': return 'System Administrator';
      case 'WARD_OFFICER': return 'Ward Officer';
      case 'DEPARTMENT_OFFICER': return 'Department Officer';
      case 'CITIZEN': return 'Citizen';
      default: return 'User';
    }
  };

  const RoleIcon = getRoleIcon();

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${getRoleColor()} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                {profileData.avatar ? (
                  <img src={profileData.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <RoleIcon className="w-10 h-10 text-white" />
                )}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-6 h-6 bg-white text-slate-700 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Camera className="w-3 h-3" />
                </button>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profileData.name}</h2>
              <p className="text-white/80">{getRoleTitle()}</p>
              <div className="flex items-center space-x-2 mt-2">
                <GovBadge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {role}
                </GovBadge>
                <div className="flex items-center space-x-1 text-white/80 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(profileData.joinDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <GovButton
                  variant="secondary"
                  size="sm"
                  onClick={handleCancel}
                  disabled={loading}
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                >
                  <X className="w-4 h-4" />
                </GovButton>
                <GovButton
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  loading={loading}
                  className="bg-white text-slate-700 hover:bg-gray-100"
                >
                  <Save className="w-4 h-4" />
                </GovButton>
              </>
            ) : (
              <GovButton
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                <Edit className="w-4 h-4" />
              </GovButton>
            )}
          </div>
        </div>
      </div>

      {/* Alert Message */}
      {message && (
        <GovAlert type={messageType} className="mx-6 mt-4">
          {message}
        </GovAlert>
      )}

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900">24</div>
                <div className="text-sm text-blue-700">Total Complaints</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-900">18</div>
                <div className="text-sm text-green-700">Resolved</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-500 rounded-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-900">2.3</div>
                <div className="text-sm text-amber-700">Avg Resolution (days)</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-900">4.8</div>
                <div className="text-sm text-purple-700">Satisfaction Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Contact Information
            </h3>
            
            <GovInput
              label="Full Name"
              type="text"
              icon={User}
              value={profileData.name}
              onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
              disabled={!isEditing}
              className={!isEditing ? 'opacity-75' : ''}
            />
            
            <GovInput
              label="Email Address"
              type="email"
              icon={Mail}
              value={profileData.email}
              onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              disabled={!isEditing}
              className={!isEditing ? 'opacity-75' : ''}
            />
            
            <GovInput
              label="Phone Number"
              type="tel"
              icon={Phone}
              value={profileData.phone}
              onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
              disabled={!isEditing}
              className={!isEditing ? 'opacity-75' : ''}
            />
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-green-600" />
              Professional Information
            </h3>
            
            {role !== 'CITIZEN' && (
              <>
                <GovInput
                  label="Department"
                  type="text"
                  icon={Briefcase}
                  value={profileData.department}
                  onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                  disabled={!isEditing}
                  className={!isEditing ? 'opacity-75' : ''}
                />
                
                <GovInput
                  label="Ward/Area"
                  type="text"
                  icon={MapPin}
                  value={profileData.ward}
                  onChange={(e) => setProfileData(prev => ({ ...prev, ward: e.target.value }))}
                  disabled={!isEditing}
                  className={!isEditing ? 'opacity-75' : ''}
                />
              </>
            )}
            
            <GovInput
              label="Bio"
              type="textarea"
              icon={User}
              value={profileData.bio}
              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              disabled={!isEditing}
              className={!isEditing ? 'opacity-75' : ''}
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>

        {/* Activity Timeline */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-amber-600" />
            Recent Activity
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Complaint #1234 resolved</div>
                <div className="text-sm text-slate-600">Water supply issue fixed in Ward 3</div>
                <div className="text-xs text-slate-500 mt-1">2 hours ago</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">SLA target achieved</div>
                <div className="text-sm text-slate-600">95% compliance rate this month</div>
                <div className="text-xs text-slate-500 mt-1">1 day ago</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Award className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Performance bonus earned</div>
                <div className="text-sm text-slate-600">Outstanding service recognition</div>
                <div className="text-xs text-slate-500 mt-1">3 days ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
