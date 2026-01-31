// Simple utility functions - no dependencies on other utils
export const logApiCall = (method, url, data, response, error) => {
    if (import.meta.env.DEV) {
        console.log(`API Call: ${method} ${url}`, { data, response, error });
    }
};

export const parseError = (error) => {
    if (error.response) {
        return {
            type: 'response',
            status: error.response.status,
            message: error.response.data?.message || error.response.statusText
        };
    } else if (error.request) {
        return {
            type: 'request',
            message: 'No response from server'
        };
    } else {
        return {
            type: 'setup',
            message: error.message
        };
    }
};

export const logError = (error) => {
    if (import.meta.env.DEV) {
        console.error('API Error:', parseError(error));
    }
};
