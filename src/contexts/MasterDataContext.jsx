/**
 * Master Data Context
 * Provides wards and departments data globally
 * Converts IDs to names throughout the app
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import apiService from '../api/apiService';

const MasterDataContext = createContext();

export const MasterDataProvider = ({ children }) => {
    const [wards, setWards] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadMasterData();
    }, []);

    const loadMasterData = async () => {
        try {
            setLoading(true);
            const [wardsResponse, deptsResponse] = await Promise.all([
                apiService.masterData.getWards(),
                apiService.masterData.getDepartments()
            ]);

            // Extract data from response
            const wardsData = wardsResponse.data || wardsResponse;
            const deptsData = deptsResponse.data || deptsResponse;

            setWards(Array.isArray(wardsData) ? wardsData : []);
            setDepartments(Array.isArray(deptsData) ? deptsData : []);
            setError(null);

            console.log('✅ Master data loaded:', {
                wards: wardsData.length,
                departments: deptsData.length
            });
        } catch (err) {
            console.error('❌ Failed to load master data:', err);
            setError(err.message);
            // Set empty arrays as fallback
            setWards([]);
            setDepartments([]);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Get ward name from ward ID
     */
    const getWardName = (wardId) => {
        if (!wardId) return 'Not Set';
        const ward = wards.find(w =>
            w.wardId === wardId ||
            w.number === wardId ||
            w.wardNumber === wardId
        );
        return ward ? (ward.area_name || ward.areaName || `Ward ${wardId}`) : `Ward ${wardId}`;
    };

    /**
     * Get department name from department ID
     */
    const getDepartmentName = (deptId) => {
        if (!deptId) return 'Unknown';
        const dept = departments.find(d =>
            d.department_id === deptId ||
            d.departmentId === deptId
        );
        return dept ? dept.name : `Department ${deptId}`;
    };

    /**
     * Get department emoji from department ID
     */
    const getDepartmentEmoji = (deptId) => {
        const emojiMap = {
            1: '💧', // Water Supply
            2: '🚽', // Sanitation
            3: '🛣️', // Roads
            4: '💡', // Electricity
            5: '🗑️', // Waste Management
            6: '⚠️', // Public Safety
            7: '🏥', // Health
            8: '🎓'  // Education
        };
        return emojiMap[deptId] || '📁';
    };

    /**
     * Get department with emoji
     */
    const getDepartmentWithEmoji = (deptId) => {
        const emoji = getDepartmentEmoji(deptId);
        const name = getDepartmentName(deptId);
        return `${emoji} ${name}`;
    };

    const value = {
        wards,
        departments,
        loading,
        error,
        getWardName,
        getDepartmentName,
        getDepartmentEmoji,
        getDepartmentWithEmoji,
        reload: loadMasterData
    };

    return (
        <MasterDataContext.Provider value={value}>
            {children}
        </MasterDataContext.Provider>
    );
};

export const useMasterData = () => {
    const context = useContext(MasterDataContext);
    if (!context) {
        throw new Error('useMasterData must be used within MasterDataProvider');
    }
    return context;
};

export default MasterDataContext;
