/**
 * Image Gallery Component
 * Displays complaint images organized by stage with lightbox functionality
 */

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import './ImageGallery.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8083';

const ImageGallery = ({ images, stage = null, title = 'Images' }) => {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Filter images by stage if specified
    const filteredImages = stage
        ? images.filter(img => img.imageStage === stage)
        : images;

    if (!filteredImages || filteredImages.length === 0) {
        return (
            <div className="image-gallery-empty">
                <p>No images available</p>
            </div>
        );
    }

    const openLightbox = (index) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % filteredImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? filteredImages.length - 1 : prev - 1
        );
    };

    const handleDownload = (imageUrl, imageName) => {
        const link = document.createElement('a');
        link.href = `${API_BASE_URL}${imageUrl}`;
        link.download = imageName || 'image.jpg';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStageLabel = (imageStage) => {
        const stageLabels = {
            INITIAL: 'Initial',
            RESOLUTION: 'Resolution',
            VERIFICATION: 'Verification',
        };
        return stageLabels[imageStage] || imageStage;
    };

    return (
        <div className="image-gallery">
            <h4 className="gallery-title">{title}</h4>

            <div className="gallery-grid">
                {filteredImages.map((image, index) => (
                    <div
                        key={image.imageId || index}
                        className="gallery-item"
                        onClick={() => openLightbox(index)}
                    >
                        <img
                            src={`${API_BASE_URL}${image.imageUrl}`}
                            alt={`${getStageLabel(image.imageStage)} - ${index + 1}`}
                            className="gallery-thumbnail"
                        />
                        <div className="gallery-item-overlay">
                            <span className="gallery-item-stage">
                                {getStageLabel(image.imageStage)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {lightboxOpen && (
                <div className="lightbox-overlay" onClick={closeLightbox}>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        {/* Close Button */}
                        <button className="lightbox-close" onClick={closeLightbox}>
                            <X size={24} />
                        </button>

                        {/* Navigation Buttons */}
                        {filteredImages.length > 1 && (
                            <>
                                <button className="lightbox-nav lightbox-prev" onClick={prevImage}>
                                    <ChevronLeft size={32} />
                                </button>
                                <button className="lightbox-nav lightbox-next" onClick={nextImage}>
                                    <ChevronRight size={32} />
                                </button>
                            </>
                        )}

                        {/* Image */}
                        <div className="lightbox-image-container">
                            <img
                                src={`${API_BASE_URL}${filteredImages[currentImageIndex].imageUrl}`}
                                alt={`Image ${currentImageIndex + 1}`}
                                className="lightbox-image"
                            />
                        </div>

                        {/* Image Info */}
                        <div className="lightbox-info">
                            <div className="lightbox-details">
                                <span className="lightbox-stage">
                                    {getStageLabel(filteredImages[currentImageIndex].imageStage)}
                                </span>
                                <span className="lightbox-counter">
                                    {currentImageIndex + 1} / {filteredImages.length}
                                </span>
                            </div>
                            {filteredImages[currentImageIndex].uploadedBy && (
                                <span className="lightbox-uploader">
                                    Uploaded by: {filteredImages[currentImageIndex].uploadedBy}
                                </span>
                            )}
                            <button
                                className="lightbox-download"
                                onClick={() =>
                                    handleDownload(
                                        filteredImages[currentImageIndex].imageUrl,
                                        `complaint-image-${currentImageIndex + 1}.jpg`
                                    )
                                }
                            >
                                <Download size={18} />
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageGallery;
