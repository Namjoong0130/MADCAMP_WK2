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

// Clothes
export const getClothes = async () => {
    const response = await axios.get('/api/clothes');
    return response.data.data;
};

// Funds
export const getFundingFeed = async () => {
    const response = await axios.get('/api/funds/feed');
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
