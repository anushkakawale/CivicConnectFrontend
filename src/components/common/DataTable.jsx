import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, Filter } from 'lucide-react';
import './DataTable.css';

/**
 * DataTable Component
 * Professional table with sorting, filtering, pagination, and search
 * 
 * @param {Array} data - Table data
 * @param {Array} columns - Column definitions
 * @param {Function} onRowClick - Row click handler
 * @param {boolean} sortable - Enable sorting
 * @param {boolean} searchable - Enable search
 * @param {boolean} paginated - Enable pagination
 * @param {number} pageSize - Items per page
 * @param {boolean} loading - Loading state
 */
const DataTable = ({
    data = [],
    columns = [],
    onRowClick,
    sortable = true,
    searchable = true,
    paginated = true,
    pageSize = 10,
    loading = false,
    emptyMessage = 'No data available'
}) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Sorting logic
    const sortedData = useMemo(() => {
        if (!sortable || !sortConfig.key) return data;

        return [...data].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortConfig, sortable]);

    // Search logic
    const searchedData = useMemo(() => {
        if (!searchable || !searchTerm) return sortedData;

        return sortedData.filter(row =>
            columns.some(column => {
                const value = row[column.key];
                return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
            })
        );
    }, [sortedData, searchTerm, columns, searchable]);

    // Pagination logic
    const paginatedData = useMemo(() => {
        if (!paginated) return searchedData;

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return searchedData.slice(startIndex, endIndex);
    }, [searchedData, currentPage, pageSize, paginated]);

    const totalPages = Math.ceil(searchedData.length / pageSize);

    // Handle sort
    const handleSort = (key) => {
        if (!sortable) return;

        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Render sort icon
    const renderSortIcon = (columnKey) => {
        if (!sortable || sortConfig.key !== columnKey) return null;

        return sortConfig.direction === 'asc' ? (
            <ChevronUp size={16} className="sort-icon" />
        ) : (
            <ChevronDown size={16} className="sort-icon" />
        );
    };

    if (loading) {
        return (
            <div className="data-table-loading">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="data-table-container">
            {/* Search Bar */}
            {searchable && (
                <div className="data-table-search">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            )}

            {/* Table */}
            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    onClick={() => column.sortable !== false && handleSort(column.key)}
                                    className={sortable && column.sortable !== false ? 'sortable' : ''}
                                    style={{ width: column.width }}
                                >
                                    <div className="th-content">
                                        <span>{column.label}</span>
                                        {renderSortIcon(column.key)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="empty-state">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, index) => (
                                <tr
                                    key={row.id || index}
                                    onClick={() => onRowClick && onRowClick(row)}
                                    className={onRowClick ? 'clickable' : ''}
                                >
                                    {columns.map((column) => (
                                        <td key={column.key}>
                                            {column.render ? column.render(row[column.key], row) : row[column.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {paginated && totalPages > 1 && (
                <div className="data-table-pagination">
                    <div className="pagination-info">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, searchedData.length)} of {searchedData.length} entries
                    </div>
                    <div className="pagination-controls">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="pagination-btn"
                        >
                            Previous
                        </button>
                        {[...Array(totalPages)].map((_, i) => {
                            const page = i + 1;
                            // Show first, last, current, and adjacent pages
                            if (
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                                return (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                                    >
                                        {page}
                                    </button>
                                );
                            } else if (page === currentPage - 2 || page === currentPage + 2) {
                                return <span key={page} className="pagination-ellipsis">...</span>;
                            }
                            return null;
                        })}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="pagination-btn"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
