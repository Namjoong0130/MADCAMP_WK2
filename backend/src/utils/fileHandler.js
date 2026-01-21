const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');

const UPLOAD_ROOT = path.join(__dirname, '../../public/images');
const BASE_URL = process.env.SERVER_URL || 'http://localhost:3000'; // Set in .env

/**
 * Ensures the directory exists.
 * @param {string} dirPath 
 */
const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

/**
 * Saves a buffer to a file.
 * @param {Buffer} buffer 
 * @param {string} category - 'clothes/inputs', 'clothes/results', etc.
 * @param {string} filename 
 * @returns {string} - The public URL of the saved file
 */
exports.saveLocalFile = (buffer, category, filename) => {
    const targetDir = path.join(UPLOAD_ROOT, category);
    ensureDir(targetDir);

    // If filename is provided, use it directly (assume it handles uniqueness or is specific ID based)
    // Otherwise generate unique timestamped name
    const finalName = filename || `${Date.now()}_${crypto.randomBytes(4).toString('hex')}.png`;
    const filePath = path.join(targetDir, finalName);

    fs.writeFileSync(filePath, buffer);

    return `${BASE_URL}/images/${category}/${finalName}`;
};

/**
 * Downloads an image from a URL and saves it locally.
 * @param {string} url 
 * @param {string} category 
 * @returns {Promise<string>} - The public URL of the saved file
 */
exports.saveFileFromUrl = async (url, category) => {
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'arraybuffer'
        });

        // Attempt to guess extension from content-type or url, default to .png
        let ext = '.png';
        const contentType = response.headers['content-type'];
        if (contentType === 'image/jpeg') ext = '.jpg';
        else if (contentType === 'image/webp') ext = '.webp';

        const filename = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;

        return exports.saveLocalFile(response.data, category, filename);
    } catch (error) {
        console.error('Error downloading file:', error);
        throw new Error('Failed to download and save file.');
    }
};

/**
 * Returns the full URL for a local path (optional helper)
 * @param {string} relativePath 
 * @returns {string}
 */
exports.getFullUrl = (relativePath) => {
    if (!relativePath) return null;
    if (relativePath.startsWith('http')) return relativePath;
    return `${BASE_URL}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
};
