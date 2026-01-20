import axios from './axios';

// Brands
export const getPublicBrands = async () => {
    const response = await axios.get('/api/brands/public');
    return response.data.data;
};

export const getBrandProfiles = async () => {
    const response = await axios.get('/api/brands/profiles');
    return response.data.data;
};

export const createBrand = async (payload) => {
    const response = await axios.post('/api/brands', payload);
    return response.data.data;
};

export const updateBrand = async (brandId, payload) => {
    const response = await axios.patch(`/api/brands/${brandId}`, payload);
    return response.data.data;
};

export const deleteBrand = async (brandId) => {
    const response = await axios.delete(`/api/brands/${brandId}`);
    return response.data.data;
};

export const uploadBrandLogo = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post('/api/upload/brand-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
};

// Clothes
export const getClothes = async () => {
    const response = await axios.get('/api/clothes');
    return response.data.data;
};

// Funds
export const getFundingFeed = async () => {
    // Add timestamp to prevent caching
    const response = await axios.get(`/api/funds/feed?t=${new Date().getTime()}`);
    return response.data.data;
};

export const getUserInvestments = async () => {
    const response = await axios.get('/api/funds/investments/me');
    return response.data.data;
};

// Fittings
export const getMyFittings = async () => {
    const response = await axios.get('/api/fittings');
    return response.data.data;
};

export const getDesignHistory = async () => {
    const response = await axios.get('/api/clothes/design/history');
    return response.data.data;
};

export const toggleLike = async (fundId) => {
    const response = await axios.post(`/api/funds/${fundId}/like`);
    return response.data.data;
};
