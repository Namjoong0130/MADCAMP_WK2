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

// Comments
export const getFundComments = async (fundId) => {
    const response = await axios.get(`/api/funds/${fundId}/comments`);
    return response.data.data;
};

export const createFundComment = async (fundId, payload) => {
    const response = await axios.post(`/api/funds/${fundId}/comments`, payload);
    return response.data.data;
};

export const updateFundComment = async (fundId, commentId, payload) => {
    const response = await axios.patch(`/api/funds/${fundId}/comments/${commentId}`, payload);
    return response.data.data;
};

export const deleteFundComment = async (fundId, commentId) => {
    const response = await axios.delete(`/api/funds/${fundId}/comments/${commentId}`);
    return response.data.data;
};

// Garments (fal.ai integration)
export const uploadGarment = async (file, metadata = {}) => {
    const formData = new FormData();
    formData.append('photo', file);

    if (metadata.name) formData.append('name', metadata.name);
    if (metadata.category) formData.append('category', metadata.category);
    if (metadata.description) formData.append('description', metadata.description);

    const response = await axios.post('/api/garments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
};

export const getGarments = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);

    const response = await axios.get(`/api/garments?${params.toString()}`);
    return response.data.data;
};

export const getGarment = async (garmentId) => {
    const response = await axios.get(`/api/garments/${garmentId}`);
    return response.data.data;
};

export const updateGarment = async (garmentId, data) => {
    const response = await axios.patch(`/api/garments/${garmentId}`, data);
    return response.data.data;
};

export const deleteGarment = async (garmentId) => {
    const response = await axios.delete(`/api/garments/${garmentId}`);
    return response.data.data;
};

export const getGarmentStatus = async (garmentId) => {
    const response = await axios.get(`/api/garments/${garmentId}/status`);
    return response.data.data;
};

// Studio photo processing (fal.ai integration)
export const uploadStudioPhotos = async (frontPhoto, backPhoto) => {
    const formData = new FormData();
    formData.append('front_photo', frontPhoto);
    formData.append('back_photo', backPhoto);

    const response = await axios.post('/api/studio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
};

export const getStudioPhotos = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);

    const response = await axios.get(`/api/studio?${params.toString()}`);
    return response.data.data;
};

export const getStudioPhoto = async (studioPhotoId) => {
    const response = await axios.get(`/api/studio/${studioPhotoId}`);
    return response.data.data;
};

export const deleteStudioPhoto = async (studioPhotoId) => {
    const response = await axios.delete(`/api/studio/${studioPhotoId}`);
    return response.data.data;
};

export const getStudioPhotoStatus = async (studioPhotoId) => {
    const response = await axios.get(`/api/studio/${studioPhotoId}/status`);
    return response.data.data;
};
