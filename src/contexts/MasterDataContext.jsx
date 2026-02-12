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

            // Extract data from response - Handle various Axios/Backend formats
            // Prioritize: response -> response.data -> response.data.data -> response.payload
            const getArrayData = (res) => {
                if (Array.isArray(res)) return res;
                if (res && Array.isArray(res.data)) return res.data;
                if (res && res.data && Array.isArray(res.data.data)) return res.data.data;
                if (res && Array.isArray(res.payload)) return res.payload;
                return [];
            };

            const wardsData = getArrayData(wardsResponse);
            const deptsData = getArrayData(deptsResponse);

            console.log('🔄 Raw Wards API Response:', wardsResponse);
            console.log('🔄 Raw Depts API Response:', deptsResponse);

            if (Array.isArray(wardsData) && wardsData.length > 0) {
                console.log(`✅ Loaded ${wardsData.length} Wards`);
                setWards(wardsData);
            } else {
                console.warn("⚠️ Warning: Wards data is empty or invalid format", wardsResponse);
                setWards([]);
            }

            if (Array.isArray(deptsData) && deptsData.length > 0) {
                console.log(`✅ Loaded ${deptsData.length} Departments`);
                setDepartments(deptsData);
            } else {
                console.warn("⚠️ Warning: Departments data is empty or invalid format", deptsResponse);
                setDepartments([]);
            }
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
