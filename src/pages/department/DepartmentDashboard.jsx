/**
 * Department Dashboard
 * Refactored to match strict backend requirements
 */
import React, { useEffect, useState } from 'react';
import api from '../../api/axios'; // Direct axios for consistency with User Guide
import apiService from '../../api/apiService'; // For typed service calls
import { Camera, CheckCircle, Play, AlertCircle } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const DepartmentDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const [uploadingId, setUploadingId] = useState(null);

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            setLoading(true);
            // User Guide: GET /api/department/dashboard/assigned
            const res = await api.get('/department/dashboard/assigned?page=0&size=20');
            setTasks(res.data.content || res.data || []);
        } catch (error) {
            console.error('Failed to load tasks', error);
            showToast('Failed to load assigned tasks', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStartWork = async (id) => {
        if (!window.confirm("Start work on this complaint?")) return;
        try {
            // User Guide: PUT /api/department/complaints/{id}/start
            await apiService.departmentOfficer.startWork(id);
            showToast('Work started successfully', 'success');
            loadTasks();
        } catch (error) {
            showToast('Failed to start work', 'error');
        }
    };

    const handleUpload = async (id, file) => {
        if (!file) return;

        try {
            setUploadingId(id);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'AFTER_RESOLUTION'); // As per User Guide

            // User Guide: POST /api/complaints/{id}/images
            await api.post(`/complaints/${id}/images`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            showToast('Proof uploaded successfully!', 'success');
        } catch (error) {
            console.error('Upload failed', error);
            showToast('Failed to upload proof', 'error');
        } finally {
            setUploadingId(null);
        }
    };

    const handleResolve = async (id) => {
        const remarks = prompt("Enter Resolution Remarks:");
        if (!remarks) return;

        try {
            // User Guide: PUT /api/department/complaints/{id}/resolve
            await apiService.departmentOfficer.resolveComplaint(id, remarks);
            showToast('Complaint resolved successfully', 'success');
            loadTasks();
        } catch (error) {
            console.error('Resolve failed', error);
            showToast('Failed to resolve complaint', 'error');
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-slate-800">Department Dashboard</h1>

            {tasks.length === 0 ? (
                <div className="text-center p-10 bg-white rounded-lg shadow">
                    <p className="text-slate-500">No assigned tasks found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tasks.map(task => (
                        <div key={task.complaintId} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                    #{task.complaintId}
                                </span>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${task.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                                        task.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {task.status}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold mb-2 text-slate-900">{task.title}</h3>
                            <p className="text-slate-600 mb-4 text-sm line-clamp-3">{task.description}</p>

                            {task.wardName && (
                                <p className="text-xs text-slate-500 mb-4">
                                    <strong>Ward:</strong> {task.wardName}
                                </p>
                            )}

                            <div className="border-t pt-4 space-y-3">
                                {/* Start Work Button */}
                                {task.status === 'ASSIGNED' && (
                                    <button
                                        onClick={() => handleStartWork(task.complaintId)}
                                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
                                    >
                                        <Play size={16} /> Start Work
                                    </button>
                                )}

                                {/* Upload Proof (Only if In Progress) */}
                                {task.status === 'IN_PROGRESS' && (
                                    <div className="space-y-2">
                                        <label className="block w-full cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-4 rounded text-center transition-colors border border-dashed border-slate-300">
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={(e) => handleUpload(task.complaintId, e.target.files[0])}
                                                accept="image/*"
                                            />
                                            <div className="flex items-center justify-center gap-2">
                                                {uploadingId === task.complaintId ? (
                                                    <span className="animate-spin h-4 w-4 border-2 border-slate-500 rounded-full border-t-transparent" />
                                                ) : (
                                                    <Camera size={16} />
                                                )}
                                                {uploadingId === task.complaintId ? 'Uploading...' : 'Upload Proof'}
                                            </div>
                                        </label>

                                        <button
                                            onClick={() => handleResolve(task.complaintId)}
                                            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
                                        >
                                            <CheckCircle size={16} /> Resolve
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DepartmentDashboard;
