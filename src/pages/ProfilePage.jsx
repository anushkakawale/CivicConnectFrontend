import React, { useState, useEffect } from 'react';
import apiService from '../api/apiService';
import {
    User, Mail, Shield, MapPin, Building, Briefcase,
    Edit2, Save, X, Home, Navigation, Lock, Key,
    CheckCircle, AlertCircle, Smartphone, Send
} from 'lucide-react';
import { USER_ROLES, WARDS } from '../constants';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // --- State Management ---
    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState("");

    // Mobile Update States
    const [isEditingMobile, setIsEditingMobile] = useState(false);
    const [mobileData, setMobileData] = useState({ newMobile: "", otp: "" });
    const [otpSent, setOtpSent] = useState(false);

    // Password States
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Citizen Specific States
    const [isAddressEditing, setIsAddressEditing] = useState(false);
    const [addressData, setAddressData] = useState({ address: "", pincode: "" });
    const [isWardChanging, setIsWardChanging] = useState(false);
    const [selectedWardId, setSelectedWardId] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await apiService.profile.getProfile();
            setUser(response.data);
            setEditName(response.data.name);

            if (response.data.role === USER_ROLES.CITIZEN) {
                setAddressData({
                    address: response.data.address || "",
                    pincode: response.data.pincode || ""
                });
            }
        } catch (err) {
            console.error("Failed to fetch profile", err);
            setError("Failed to load profile data.");
        } finally {
            setLoading(false);
        }
    };

    // --- Helpers ---
    const handleSuccess = (msg) => {
        setSuccessMessage(msg);
        setError("");
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    const handleError = (msg) => {
        setError(msg);
        setSuccessMessage("");
        setTimeout(() => setError(""), 5000);
    };

    // --- Core Handlers ---

    const handleNameSave = async () => {
        if (!editName.trim()) return handleError("Name cannot be empty.");
        try {
            await apiService.profile.updateName(editName);
            setUser(prev => ({ ...prev, name: editName }));
            setIsEditingName(false);
            handleSuccess("Name updated successfully!");
        } catch (err) {
            handleError("Failed to update name.");
        }
    };

    const handleMobileOtpRequest = async () => {
        // Send OTP to CURRENT / OLD number for verification
        if (!user.mobile) {
            return handleError("No registered mobile number to verify against.");
        }
        try {
            await apiService.profile.requestMobileOtp(user.mobile);
            setOtpSent(true);
            handleSuccess(`OTP sent to ${user.mobile}`);
        } catch (err) {
            handleError(err.response?.data?.message || "Failed to send OTP.");
        }
    };

    const handleMobileUpdateVerify = async () => {
        if (!mobileData.otp) return handleError("Please enter OTP.");
        try {
            await apiService.profile.verifyMobileOtp(mobileData.otp, mobileData.newMobile);
            setUser(prev => ({ ...prev, mobile: mobileData.newMobile }));
            setIsEditingMobile(false);
            setOtpSent(false);
            setMobileData({ newMobile: "", otp: "" });
            handleSuccess("Mobile number updated successfully!");
        } catch (err) {
            handleError(err.response?.data?.message || "Invalid OTP or failed to update.");
        }
    };

    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return handleError("New passwords do not match.");
        }
        if (passwordData.newPassword.length < 6) {
            return handleError("Password must be at least 6 characters.");
        }
        try {
            await apiService.profile.updatePassword(passwordData.currentPassword, passwordData.newPassword);
            setIsChangingPassword(false);
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            handleSuccess("Password changed successfully!");
        } catch (err) {
            handleError(err.response?.data?.message || "Failed to update password. Check current password.");
        }
    };

    const handleAddressSave = async () => {
        try {
            await apiService.citizen.updateAddress(addressData);
            setUser(prev => ({ ...prev, ...addressData }));
            setIsAddressEditing(false);
            handleSuccess("Address updated successfully!");
        } catch (err) {
            handleError("Failed to update address.");
        }
    };

    const handleWardChangeRequest = async () => {
        if (!selectedWardId) return;
        try {
            await apiService.citizen.requestWardChange({ wardId: parseInt(selectedWardId) });
            setIsWardChanging(false);
            handleSuccess("Ward change request submitted successfully!");
        } catch (err) {
            handleError(err.response?.data?.message || "Failed to submit ward change request.");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold bg-gray-50">
                {error || "Profile not found."}
            </div>
        );
    }

    const isCitizen = user.role === USER_ROLES.CITIZEN;

    return (
        <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Global Toast Alerts */}
                {successMessage && (
                    <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-slideIn">
                        <CheckCircle className="mr-2" size={20} />
                        {successMessage}
                    </div>
                )}
                {error && (
                    <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-slideIn">
                        <AlertCircle className="mr-2" size={20} />
                        {error}
                    </div>
                )}

                {/* HEADER AREA */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                    <div className="h-32 bg-gradient-to-r from-blue-700 to-indigo-800"></div>
                    <div className="px-8 pb-6">
                        <div className="flex flex-col md:flex-row items-center md:items-end -mt-12">
                            <div className="relative">
                                <div className="h-24 w-24 bg-white rounded-full p-1.5 shadow-lg">
                                    <div className="h-full w-full bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-3xl">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 md:mt-0 md:ml-5 flex-1 text-center md:text-left mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                                <p className="text-blue-600 font-semibold text-sm flex items-center justify-center md:justify-start gap-2 mt-1">
                                    <Shield size={14} />
                                    {user.role?.replace('_', ' ')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: Personal Details */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 1. Personal Information Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                <User className="w-5 h-5 mr-2 text-blue-600" />
                                Personal Information
                            </h3>

                            <div className="space-y-6">
                                {/* Name Field */}
                                <div className="group">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                                        {!isEditingName ? (
                                            <button onClick={() => setIsEditingName(true)} className="text-blue-600 hover:text-blue-800 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button onClick={handleNameSave} className="text-green-600 text-xs font-bold">Save</button>
                                                <button onClick={() => { setIsEditingName(false); setEditName(user.name); }} className="text-gray-400 text-xs">Cancel</button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center">
                                        <User className="text-gray-400 mr-3" size={18} />
                                        <input
                                            type="text"
                                            disabled={!isEditingName}
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className={`flex-1 bg-transparent border-0 border-b-2 py-1 focus:ring-0 text-gray-800 font-medium transition-colors
                                                ${isEditingName ? 'border-blue-500' : 'border-transparent'}`}
                                        />
                                    </div>
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Email Address</label>
                                    <div className="flex items-center">
                                        <Mail className="text-gray-400 mr-3" size={18} />
                                        <span className="text-gray-800 font-medium">{user.email}</span>
                                        <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Verified</span>
                                    </div>
                                </div>

                                {/* Mobile Field with OTP Update */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mobile Number</label>
                                        {!isEditingMobile && (
                                            <button onClick={() => { setIsEditingMobile(true); setOtpSent(false); setMobileData({ newMobile: "", otp: "" }); }} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Change</button>
                                        )}
                                    </div>

                                    {!isEditingMobile ? (
                                        <div className="flex items-center">
                                            <Smartphone className="text-gray-400 mr-3" size={18} />
                                            <span className="text-gray-800 font-medium">{user.mobile || 'Not Set'}</span>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 p-4 rounded-xl space-y-3 animate-fadeIn border border-gray-200">
                                            {!otpSent ? (
                                                <div className="space-y-3">
                                                    <p className="text-xs text-gray-600">To change your number, we will send an OTP to your current mobile number <b>{user.mobile}</b>.</p>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            disabled
                                                            value={user.mobile}
                                                            className="flex-1 rounded-lg border-gray-300 text-sm bg-gray-100 text-gray-500"
                                                        />
                                                        <button
                                                            onClick={handleMobileOtpRequest}
                                                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                                                        >
                                                            Send OTP
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <p className="text-xs text-green-600">OTP Sent! Verify to continue.</p>
                                                    {/* Step 1: Verify OTP */}
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Enter OTP sent to old number"
                                                            value={mobileData.otp}
                                                            onChange={(e) => setMobileData({ ...mobileData, otp: e.target.value })}
                                                            className="flex-1 rounded-lg border-gray-300 text-sm focus:ring-green-500 focus:border-green-500"
                                                        />
                                                    </div>

                                                    {/* Step 2: New Number Input */}
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Enter New Mobile Number"
                                                            value={mobileData.newMobile}
                                                            onChange={(e) => setMobileData({ ...mobileData, newMobile: e.target.value })}
                                                            className="flex-1 rounded-lg border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>

                                                    <button
                                                        onClick={handleMobileUpdateVerify}
                                                        className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold"
                                                    >
                                                        Verify OTP & Update Number
                                                    </button>
                                                </div>
                                            )}
                                            <button onClick={() => { setIsEditingMobile(false); setOtpSent(false); setMobileData({ newMobile: "", otp: "" }); }} className="text-xs text-gray-500 underline w-full text-center">Cancel</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 2. Official Details (Non-Citizen) */}
                        {!isCitizen && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                    <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
                                    Official Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {user.departmentName && (
                                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                            <p className="text-xs font-semibold text-purple-500 uppercase tracking-wider mb-1">Department</p>
                                            <p className="font-bold text-gray-900 flex items-center">
                                                <Building size={16} className="mr-2" />
                                                {user.departmentName}
                                            </p>
                                        </div>
                                    )}
                                    {user.designation && (
                                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                            <p className="text-xs font-semibold text-purple-500 uppercase tracking-wider mb-1">Designation</p>
                                            <p className="font-bold text-gray-900 flex items-center">
                                                <Shield size={16} className="mr-2" />
                                                {user.designation}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 3. Address & Ward (Citizen Only) */}
                        {isCitizen && (
                            <>
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                            <Home className="w-5 h-5 mr-2 text-green-600" />
                                            Residential Address
                                        </h3>
                                        {!isAddressEditing ? (
                                            <button onClick={() => setIsAddressEditing(true)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button onClick={handleAddressSave} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">Save</button>
                                                <button onClick={() => { setIsAddressEditing(false); setAddressData({ address: user.address || "", pincode: user.pincode || "" }); }} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg">Cancel</button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-gray-400 font-bold uppercase">Full Address</label>
                                            <textarea
                                                disabled={!isAddressEditing}
                                                value={addressData.address}
                                                onChange={(e) => setAddressData({ ...addressData, address: e.target.value })}
                                                className={`w-full mt-1 p-3 rounded-lg text-sm border ${isAddressEditing ? 'border-blue-500 bg-white' : 'border-gray-200 bg-gray-50'}`}
                                                rows="3"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 font-bold uppercase">Pincode</label>
                                            <input
                                                type="text"
                                                disabled={!isAddressEditing}
                                                value={addressData.pincode}
                                                onChange={(e) => setAddressData({ ...addressData, pincode: e.target.value })}
                                                className={`w-full mt-1 p-3 rounded-lg text-sm border ${isAddressEditing ? 'border-blue-500 bg-white' : 'border-gray-200 bg-gray-50'}`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                        <MapPin className="w-5 h-5 mr-2 text-orange-600" />
                                        Ward Details
                                    </h3>
                                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100 mb-4">
                                        <div>
                                            <p className="text-xs font-bold text-orange-500 uppercase">Current Ward</p>
                                            <p className="text-xl font-bold text-gray-900">Ward {user.wardNumber}</p>
                                            {user.areaName && <p className="text-sm text-gray-600">{user.areaName}</p>}
                                        </div>
                                        <Navigation className="text-orange-400" size={32} />
                                    </div>

                                    {!isWardChanging ? (
                                        <button onClick={() => setIsWardChanging(true)} className="w-full py-2 border-2 border-orange-100 text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-colors">
                                            Request Transfer
                                        </button>
                                    ) : (
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Select New Ward</label>
                                            <select
                                                className="w-full p-2 rounded-lg border border-gray-300 mb-3 text-sm"
                                                value={selectedWardId}
                                                onChange={(e) => setSelectedWardId(e.target.value)}
                                            >
                                                <option value="">-- Choose Ward --</option>
                                                {WARDS.map(ward => (
                                                    <option key={ward.wardId} value={ward.wardId}>Ward {ward.number} - {ward.area_name}</option>
                                                ))}
                                            </select>
                                            <div className="flex gap-2">
                                                <button onClick={handleWardChangeRequest} disabled={!selectedWardId} className="flex-1 bg-orange-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-700 shadow-sm">Submit</button>
                                                <button onClick={() => setIsWardChanging(false)} className="flex-1 bg-white border border-gray-300 text-gray-600 py-2 rounded-lg text-sm font-medium">Cancel</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Security & Account */}
                    <div className="space-y-8">
                        {/* Password Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                <Lock className="w-5 h-5 mr-2 text-indigo-600" />
                                Security Settings
                            </h3>

                            {!isChangingPassword ? (
                                <div className="text-center py-6">
                                    <div className="inline-flex h-16 w-16 bg-green-50 rounded-full items-center justify-center mb-4">
                                        <Shield size={32} className="text-green-600" />
                                    </div>
                                    <h4 className="font-bold text-gray-900">Password is secure</h4>
                                    <p className="text-sm text-gray-500 mb-6">It's a good idea to update your password regularly.</p>
                                    <button
                                        onClick={() => setIsChangingPassword(true)}
                                        className="w-full py-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-semibold hover:bg-indigo-100 transition-colors"
                                    >
                                        Change Password
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-fadeIn">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Current Password</label>
                                        <input
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            className="w-full mt-1 p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">New Password</label>
                                        <input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="w-full mt-1 p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Confirm Password</label>
                                        <input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="w-full mt-1 p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button onClick={handlePasswordChange} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 shadow-sm">Update</button>
                                        <button onClick={() => setIsChangingPassword(false)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg font-medium hover:bg-gray-200">Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Account Stats (Placeholder for now) */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white">
                            <h3 className="text-lg font-bold mb-4 opacity-90">Account Summary</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-white/20 pb-3">
                                    <span className="text-sm opacity-80">Account Type</span>
                                    <span className="font-bold">{user.role?.replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/20 pb-3">
                                    <span className="text-sm opacity-80">Status</span>
                                    <span className="bg-green-400/20 text-green-200 text-xs px-2 py-1 rounded-full font-bold border border-green-400/30">Active</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm opacity-80">Member Since</span>
                                    <span className="font-bold">Jan 2026</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
