const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const studioController = require('../controllers/studioController');

/**
 * @swagger
 * /api/studio:
 *   post:
 *     summary: Upload front and back studio photos for processing
 *     tags: [Studio]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - front_photo
 *               - back_photo
 *             properties:
 *               front_photo:
 *                 type: string
 *                 format: binary
 *                 description: Front view photo
 *               back_photo:
 *                 type: string
 *                 format: binary
 *                 description: Back view photo
 *     responses:
 *       201:
 *         description: Studio photos uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     studio_photo_id:
 *                       type: integer
 *                     front_photo_url:
 *                       type: string
 *                     back_photo_url:
 *                       type: string
 *                     processing_status:
 *                       type: string
 *                       enum: [pending, processing, completed, failed]
 *       400:
 *         description: Missing required photos
 */
router.post(
  '/',
  authMiddleware,
  uploadMiddleware.fields([
    { name: 'front_photo', maxCount: 1 },
    { name: 'back_photo', maxCount: 1 },
  ]),
  studioController.uploadStudioPhotos
);

/**
 * @swagger
 * /api/studio:
 *   get:
 *     summary: Get all studio photos for the current user
 *     tags: [Studio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *         description: Filter by processing status
 *     responses:
 *       200:
 *         description: List of studio photos
 */
router.get('/', authMiddleware, studioController.listStudioPhotos);

/**
 * @swagger
 * /api/studio/{studioPhotoId}:
 *   get:
 *     summary: Get a single studio photo
 *     tags: [Studio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studioPhotoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Studio photo details
 *       404:
 *         description: Studio photo not found
 */
router.get('/:studioPhotoId', authMiddleware, studioController.getStudioPhoto);

/**
 * @swagger
 * /api/studio/{studioPhotoId}:
 *   delete:
 *     summary: Delete a studio photo
 *     tags: [Studio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studioPhotoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Studio photo deleted successfully
 */
router.delete('/:studioPhotoId', authMiddleware, studioController.deleteStudioPhoto);

/**
 * @swagger
 * /api/studio/{studioPhotoId}/status:
 *   get:
 *     summary: Get processing status of a studio photo
 *     tags: [Studio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studioPhotoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Processing status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     studio_photo_id:
 *                       type: integer
 *                     processing_status:
 *                       type: string
 *                     combined_image_url:
 *                       type: string
 *                     processed_image_url:
 *                       type: string
 *                     ai_metadata:
 *                       type: object
 */
router.get('/:studioPhotoId/status', authMiddleware, studioController.getStudioPhotoStatus);

module.exports = router;