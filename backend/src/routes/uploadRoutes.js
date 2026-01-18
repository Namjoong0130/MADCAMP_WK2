const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route: POST /api/upload/:category
// Categories: fitting-input, profile, brand-logo, etc.
// Use authMiddleware? Yes, usually.
router.post('/:category', authMiddleware, uploadController.uploader, uploadController.uploadFile);

module.exports = router;
