const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user info (header data)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User info
 */
router.get('/me', authMiddleware, userController.getMe);

/**
 * @swagger
 * /api/users/me/body:
 *   patch:
 *     summary: Update body measurements
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               height:
 *                 type: number
 *               weight:
 *                 type: number
 *               shoulderWidth:
 *                 type: number
 *               chestCircum:
 *                 type: number
 *               waistCircum:
 *                 type: number
 *               hipCircum:
 *                 type: number
 *               armLength:
 *                 type: number
 *               legLength:
 *                 type: number
 *               neckCircum:
 *                 type: number
 *               wristCircum:
 *                 type: number
 *     responses:
 *       200:
 *         description: Updated body metrics
 */
router.patch('/me/body', authMiddleware, userController.updateBodyMetrics);

/**
 * @swagger
 * /api/users/me/profile:
 *   get:
 *     summary: Get full user profile
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Full profile data
 *   patch:
 *     summary: Update user profile (name, tags, etc.)
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               profile_img_url:
 *                 type: string
 *               styleTags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Updated profile
 */
router.get('/me/profile', authMiddleware, userController.getProfile);
router.patch('/me/profile', authMiddleware, userController.updateProfile);

/**
 * @swagger
 * /api/users/me:
 *   delete:
 *     summary: Delete current user account
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Account deleted
 */
router.delete('/me', authMiddleware, userController.deleteMe);

const uploadMiddleware = require('../middlewares/uploadMiddleware');

/**
 * @swagger
 * /api/users/me/photo:
 *   post:
 *     summary: Upload user profile/base photo
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Photo uploaded and profile updated
 */
router.post('/me/photo', authMiddleware, uploadMiddleware.single('photo'), userController.uploadProfilePhoto);

module.exports = router;
