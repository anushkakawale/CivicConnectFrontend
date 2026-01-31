import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for API calls with built-in loading and error states
 * @param {Function} apiFunction - The API function to call
 * @param {boolean} immediate - Whether to call immediately on mount
 * @returns {Object} { data, loading, error, execute, reset }
 */
export const useApi = (apiFunction, immediate = false) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (...params) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiFunction(...params);
            setData(response.data);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiFunction]);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [immediate, execute]);

    return { data, loading, error, execute, reset };
};

/**
 * Custom hook for fetching data with automatic loading on mount
 * @param {Function} apiFunction - The API function to call
 * @param {Array} dependencies - Dependencies array for re-fetching
 * @returns {Object} { data, loading, error, refetch }
 */
export const useFetch = (apiFunction, dependencies = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiFunction();
            setData(response.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch data';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [apiFunction]);

    useEffect(() => {
        fetchData();
    }, dependencies);

    return { data, loading, error, refetch: fetchData };
};

export default useApi;
