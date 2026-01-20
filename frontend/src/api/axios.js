import axios from 'axios';

// Determine the base URL based on environment
// In production (K-Cloud VM), use the actual server IP
// In development, use empty string to rely on Vite proxy
const getBaseURL = () => {
    // Check if running in development mode
    if (import.meta.env.DEV) {
        return ''; // Vite proxy handles /api in development
    }

    // Production: use the K-Cloud VM IP
    // This can be overridden by setting VITE_API_BASE_URL in .env
    return import.meta.env.VITE_API_BASE_URL || 'http://172.10.5.178';
};

const instance = axios.create({
    baseURL: getBaseURL(),
    timeout: 300000, // 5 minutes timeout for all requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors consistently
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Server responded with error status
            const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
            console.error('API Error:', {
                status: error.response.status,
                message,
                url: error.config?.url,
            });

            // Handle 401 Unauthorized - redirect to login
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        } else if (error.request) {
            // Request made but no response received
            console.error('Network error:', error.message);
        } else {
            // Something else happened
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default instance;
