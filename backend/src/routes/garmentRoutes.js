const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const garmentController = require('../controllers/garmentController');

/**
 * @swagger
 * /api/garments:
 *   post:
 *     summary: Upload a new garment image with background removal
 *     tags: [Garments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *               name:
 *                 type: string
 *                 description: Optional garment name
 *               category:
 *                 type: string
 *                 enum: [TOP, BOTTOM, OUTER, SHOES, HAT, ACC]
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Garment uploaded successfully
 */
router.post(
  '/',
  authMiddleware,
  uploadMiddleware.single('photo'),
  garmentController.uploadGarment
);

/**
 * @swagger
 * /api/garments:
 *   get:
 *     summary: Get all user's garments
 *     tags: [Garments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [TOP, BOTTOM, OUTER, SHOES, HAT, ACC]
 *     responses:
 *       200:
 *         description: List of garments
 */
router.get('/', authMiddleware, garmentController.listGarments);

/**
 * @swagger
 * /api/garments/{garmentId}:
 *   get:
 *     summary: Get a single garment
 *     tags: [Garments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: garmentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Garment details
 *       404:
 *         description: Garment not found
 */
router.get('/:garmentId', authMiddleware, garmentController.getGarment);

/**
 * @swagger
 * /api/garments/{garmentId}:
 *   patch:
 *     summary: Update garment metadata
 *     tags: [Garments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: garmentId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Garment updated
 */
router.patch('/:garmentId', authMiddleware, garmentController.updateGarment);

/**
 * @swagger
 * /api/garments/{garmentId}:
 *   delete:
 *     summary: Delete a garment
 *     tags: [Garments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: garmentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Garment deleted
 */
router.delete('/:garmentId', authMiddleware, garmentController.deleteGarment);

/**
 * @swagger
 * /api/garments/{garmentId}/status:
 *   get:
 *     summary: Get garment processing status
 *     tags: [Garments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: garmentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Processing status
 */
router.get('/:garmentId/status', authMiddleware, garmentController.getGarmentStatus);

module.exports = router;