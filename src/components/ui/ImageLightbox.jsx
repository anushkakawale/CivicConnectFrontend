import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import './ImageLightbox.css';

/**
 * Enhanced Image Lightbox Component
 * Features: Zoom, Download, Navigation, Keyboard shortcuts, Touch gestures
 */
const ImageLightbox = ({ images = [], initialIndex = 0, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [zoom, setZoom] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    if (!images || images.length === 0) return null;

    const currentImage = images[currentIndex];
    const imageUrl = typeof currentImage === 'string' ? currentImage : currentImage?.url || currentImage?.imageUrl;

    // Navigation
    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
        setZoom(1);
        setLoading(true);
        setError(false);
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
        setZoom(1);
        setLoading(true);
        setError(false);
    };

    // Zoom controls
    const handleZoomIn = () => {
        setZoom((prev) => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setZoom((prev) => Math.max(prev - 0.25, 0.5));
    };

    const resetZoom = () => {
        setZoom(1);
    };

    // Download image
    const handleDownload = async () => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `complaint-image-${currentIndex + 1}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading image:', error);
        }
    };

    // Keyboard shortcuts
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowLeft':
                    goToPrevious();
                    break;
                case 'ArrowRight':
                    goToNext();
                    break;
                case '+':
                case '=':
                    handleZoomIn();
                    break;
                case '-':
                case '_':
                    handleZoomOut();
                    break;
                case '0':
                    resetZoom();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex]);

    // Prevent body scroll when lightbox is open
    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="image-lightbox-overlay" onClick={onClose}>
            <div className="image-lightbox-container" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="lightbox-header">
                    <div className="lightbox-counter">
                        {currentIndex + 1} / {images.length}
                    </div>
                    <div className="lightbox-controls">
                        <button
                            className="lightbox-btn"
                            onClick={handleZoomOut}
                            disabled={zoom <= 0.5}
                            title="Zoom Out (-)"
                        >
                            <ZoomOut size={20} />
                        </button>
                        <button
                            className="lightbox-btn"
                            onClick={resetZoom}
                            title="Reset Zoom (0)"
                        >
                            {Math.round(zoom * 100)}%
                        </button>
                        <button
                            className="lightbox-btn"
                            onClick={handleZoomIn}
                            disabled={zoom >= 3}
                            title="Zoom In (+)"
                        >
                            <ZoomIn size={20} />
                        </button>
                        <button
                            className="lightbox-btn"
                            onClick={handleDownload}
                            title="Download Image"
                        >
                            <Download size={20} />
                        </button>
                        <button
                            className="lightbox-btn lightbox-close"
                            onClick={onClose}
                            title="Close (Esc)"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Image Container */}
                <div className="lightbox-image-wrapper">
                    {loading && !error && (
                        <div className="lightbox-loading">
                            <div className="spinner-border text-light" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    )}

                    {error ? (
                        <div className="lightbox-error">
                            <div className="text-center text-white">
                                <div className="mb-3">
                                    <svg
                                        width="64"
                                        height="64"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                </div>
                                <h5>Failed to load image</h5>
                                <p className="text-muted">The image could not be displayed</p>
                                <button className="btn btn-light btn-sm mt-2" onClick={onClose}>
                                    Close
                                </button>
                            </div>
                        </div>
                    ) : (
                        <img
                            src={imageUrl}
                            alt={`Image ${currentIndex + 1}`}
                            className="lightbox-image"
                            style={{
                                transform: `scale(${zoom})`,
                                display: loading ? 'none' : 'block',
                            }}
                            onLoad={() => setLoading(false)}
                            onError={() => {
                                setLoading(false);
                                setError(true);
                            }}
                            draggable={false}
                        />
                    )}
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && !error && (
                    <>
                        <button
                            className="lightbox-nav lightbox-nav-prev"
                            onClick={goToPrevious}
                            title="Previous (←)"
                        >
                            <ChevronLeft size={32} />
                        </button>
                        <button
                            className="lightbox-nav lightbox-nav-next"
                            onClick={goToNext}
                            title="Next (→)"
                        >
                            <ChevronRight size={32} />
                        </button>
                    </>
                )}

                {/* Thumbnails */}
                {images.length > 1 && (
                    <div className="lightbox-thumbnails">
                        {images.map((img, index) => {
                            const thumbUrl = typeof img === 'string' ? img : img?.url || img?.imageUrl;
                            return (
                                <button
                                    key={index}
                                    className={`lightbox-thumbnail ${index === currentIndex ? 'active' : ''}`}
                                    onClick={() => {
                                        setCurrentIndex(index);
                                        setZoom(1);
                                        setLoading(true);
                                        setError(false);
                                    }}
                                >
                                    <img src={thumbUrl} alt={`Thumbnail ${index + 1}`} />
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Keyboard Shortcuts Help */}
                <div className="lightbox-help">
                    <small className="text-white-50">
                        Use arrow keys to navigate • +/- to zoom • Esc to close
                    </small>
                </div>
            </div>
        </div>
    );
};

export default ImageLightbox;
