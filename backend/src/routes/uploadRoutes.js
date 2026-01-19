const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route: POST /api/upload/:category
// Categories: fitting-input, profile, brand-logo, etc.
// Use authMiddleware? Yes, usually.
/**
 * @swagger
 * /api/upload/{category}:
 *   post:
 *     summary: Upload a file (image)
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [fitting-input, clothes/inputs, brands/logos, users/profiles]
 *         description: Storage category for the file
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: /images/fitting-input/12345.png
 */
router.post('/:category', authMiddleware, uploadController.uploader, uploadController.uploadFile);

module.exports = router;
