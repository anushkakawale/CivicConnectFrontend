/**
 * Custom hook for theme management
 * Handles dark/light mode toggle with localStorage persistence
 */

import { useState, useEffect } from 'react';

export const useTheme = () => {
    const [theme, setTheme] = useState(() => {
        // Load saved theme or default to light
        const savedTheme = localStorage.getItem('civicconnect-theme');
        return savedTheme || 'light';
    });

    useEffect(() => {
        // Apply theme to document root
        document.documentElement.setAttribute('data-theme', theme);
        // Save to localStorage
        localStorage.setItem('civicconnect-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const setLightTheme = () => setTheme('light');
    const setDarkTheme = () => setTheme('dark');

    return {
        theme,
        toggleTheme,
        setLightTheme,
        setDarkTheme,
        isDark: theme === 'dark'
    };
};

export default useTheme;
