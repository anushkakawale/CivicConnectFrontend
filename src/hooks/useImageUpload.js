/**
 * Custom hook for handling image uploads with progress tracking
 */

import { useState, useCallback } from 'react';

export const useImageUpload = () => {
    const [selectedImages, setSelectedImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);

    // Handle file selection
    const handleFileSelect = useCallback((files) => {
        const fileArray = Array.from(files);

        // Validate file types
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        const validFiles = fileArray.filter(file => validTypes.includes(file.type));

        if (validFiles.length !== fileArray.length) {
            setError('Some files were rejected. Only JPEG, PNG, and GIF images are allowed.');
        } else {
            setError(null);
        }

        // Update selected images
        setSelectedImages(prev => [...prev, ...validFiles]);

        // Generate previews
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => [...prev, {
                    file,
                    url: reader.result,
                    name: file.name,
                    size: file.size,
                }]);
            };
            reader.readAsDataURL(file);
        });
    }, []);

    // Remove image
    const removeImage = useCallback((index) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    }, []);

    // Clear all images
    const clearImages = useCallback(() => {
        setSelectedImages([]);
        setPreviews([]);
        setError(null);
        setUploadProgress(0);
    }, []);

    // Create FormData with images
    const createFormData = useCallback((additionalData = {}) => {
        const formData = new FormData();

        // Add images
        selectedImages.forEach(image => {
            formData.append('images', image);
        });

        // Add additional data
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });

        return formData;
    }, [selectedImages]);

    // Upload images with progress
    const uploadImages = useCallback(async (uploadFn) => {
        try {
            setUploading(true);
            setUploadProgress(0);
            setError(null);

            // Simulate progress (since axios doesn't provide upload progress by default)
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 200);

            const result = await uploadFn();

            clearInterval(progressInterval);
            setUploadProgress(100);

            // Clear images after successful upload
            setTimeout(() => {
                clearImages();
            }, 1000);

            return result;
        } catch (err) {
            console.error('Error uploading images:', err);
            setError(err.message || 'Failed to upload images');
            throw err;
        } finally {
            setUploading(false);
        }
    }, [clearImages]);

    return {
        selectedImages,
        previews,
        uploading,
        uploadProgress,
        error,
        handleFileSelect,
        removeImage,
        clearImages,
        createFormData,
        uploadImages,
    };
};
