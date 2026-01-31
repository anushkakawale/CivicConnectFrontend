/**
 * Theme Toggle Component
 * Allows users to switch between light and dark themes
 */

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = ({ showLabel = false }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? (
                <>
                    <Moon size={20} />
                    {showLabel && <span className="ms-2">Dark Mode</span>}
                </>
            ) : (
                <>
                    <Sun size={20} />
                    {showLabel && <span className="ms-2">Light Mode</span>}
                </>
            )}
        </button>
    );
};

export default ThemeToggle;
