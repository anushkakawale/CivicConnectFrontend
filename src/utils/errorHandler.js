// Error handler utility
export const parseError = (error) => {
    if (error.response) {
        return {
            type: 'response',
            status: error.response.status,
            message: error.response.data?.message || error.response.statusText,
            data: error.response.data
        };
    } else if (error.request) {
        return {
            type: 'request',
            message: 'No response received from server'
        };
    } else {
        return {
            type: 'setup',
            message: error.message
        };
    }
};

export const logError = (error) => {
    const parsed = parseError(error);
    console.error('Error:', parsed);
    return parsed;
};
