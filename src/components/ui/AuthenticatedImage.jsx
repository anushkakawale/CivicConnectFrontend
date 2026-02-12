import React, { useState, useEffect } from 'react';
import { ImageIcon, Loader, ShieldAlert, Monitor } from 'lucide-react';
import api from '../../api/axios';

/**
 * 🔐 AuthenticatedImage
 * Fetches protected images via axios with Authorization token.
 * Prevents 401/403 errors when loading images directly in <img> tags.
 */
const AuthenticatedImage = ({
    src,
    alt = "evidence",
    className = "",
    style = {},
    placeholderType = "IMAGE",
    fallbackSrc = null
}) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        let objectUrl = null;

        const fetchImage = async () => {
            if (!src) {
                setError(true);
                setIsLoading(false);
                return;
            }

            // Determine if the URL is from our own API
            const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8083/api').replace(/\/+$/, '');
            const isInternalApi = src.startsWith(apiBase) || src.startsWith('http://localhost:8083/api') || src.startsWith('/api');

            try {
                // If it's an internal absolute URL or starts with /api, convert to relative for axios
                let requestPath = src;

                // 1. Strip absolute base
                if (src.startsWith(apiBase)) {
                    requestPath = src.substring(apiBase.length);
                } else if (src.startsWith('http://localhost:8083/api')) {
                    requestPath = src.substring('http://localhost:8083/api'.length);
                }
                // 2. Strip leading /api if it's relative
                else if (requestPath.startsWith('/api/')) {
                    requestPath = requestPath.substring(4);
                } else if (requestPath.startsWith('api/')) {
                    requestPath = '/' + requestPath.substring(4);
                }

                // Ensure it ends up as a proper relative path for axios (starting with /)
                if (!requestPath.startsWith('/') && !requestPath.startsWith('http')) {
                    requestPath = '/' + requestPath;
                }

                console.log(`🖼️ AuthenticatedImage fetching: ${requestPath} (orig: ${src})`);

                // Fetch image as blob
                const response = await api.get(requestPath, {
                    responseType: 'blob',
                    _silent: true
                });

                if (isMounted) {
                    objectUrl = URL.createObjectURL(response.data);
                    setImageUrl(objectUrl);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("❌ Failed to fetch authenticated image:", src, err);
                if (isMounted) {
                    setError(true);
                    setIsLoading(false);
                }
            }
        };

        fetchImage();

        return () => {
            isMounted = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [src]);

    if (isLoading) {
        return (
            <div className={`d-flex align-items-center justify-content-center bg-light bg-opacity-50 ${className}`} style={{ minHeight: '100px', ...style }}>
                <div className="spinner-border spinner-border-sm text-primary opacity-30" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error || !imageUrl) {
        return (
            <div className={`d-flex flex-column align-items-center justify-content-center bg-light text-muted ${className}`} style={{ minHeight: '100px', ...style }}>
                <ShieldAlert size={20} className="mb-2 opacity-30" />
                <span className="extra-small fw-bold opacity-30 uppercase tracking-widest" style={{ fontSize: '0.6rem' }}>
                    Access Restricted
                </span>
            </div>
        );
    }

    return (
        <img
            src={imageUrl}
            alt={alt}
            className={className}
            style={style}
            loading="lazy"
        />
    );
};

export default AuthenticatedImage;
