import axios from './axios';

export const login = async (email, password) => {
    const response = await axios.post('/api/auth/login', { email, password });
    return response.data;
};

export const signup = async (userData) => {
    // userData matches the backend expectation: email, password, userName, height, weight
    const response = await axios.post('/api/auth/signup', userData);
    return response.data;
};

export const getMe = async () => {
    const response = await axios.get('/api/users/me');
    return response.data;
};

export const getProfile = async () => {
    const response = await axios.get('/api/users/me/profile');
    return response.data.data;
};

export const updateBodyMetrics = async (metrics) => {
    const response = await axios.patch('/api/users/me/body', metrics);
    return response.data.data;
};

export const updateProfile = async (profileData) => {
    const response = await axios.patch('/api/users/me/profile', profileData);
    return response.data;
};
