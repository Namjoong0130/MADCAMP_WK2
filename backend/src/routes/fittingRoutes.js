const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const fittingController = require('../controllers/fittingController');

/**
 * @swagger
 * /api/fittings:
 *   get:
 *     summary: List my fittings
 *     tags: [Fittings]
 *     responses:
 *       200:
 *         description: List of fittings
 *   post:
 *     summary: Create a new fitting request
 *     tags: [Fittings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - base_photo_url
 *               - cloth_ids
 *             properties:
 *               base_photo_url:
 *                 type: string
 *               cloth_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Fitting created
 */
router.get('/', authMiddleware, fittingController.listFittings);

/**
 * @swagger
 * /api/fittings/album:
 *   get:
 *     summary: Get fitting photo album
 *     tags: [Fittings]
 *     responses:
 *       200:
 *         description: Fitting album
 */
router.get('/album', authMiddleware, fittingController.listFittingAlbum);

/**
 * @swagger
 * /api/fittings/{fittingId}:
 *   get:
 *     summary: Get fitting detail (results)
 *     tags: [Fittings]
 *     parameters:
 *       - in: path
 *         name: fittingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Fitting details
 */
router.get('/:fittingId', authMiddleware, fittingController.getFittingDetail);

// Upload middleware for cloth_image
const uploadMiddleware = require('../middlewares/uploadMiddleware');
router.post('/', authMiddleware, uploadMiddleware.array('cloth_image'), fittingController.createFitting);

/**
 * @swagger
 * /api/fittings/{fittingId}/results:
 *   post:
 *     summary: Manually add result to fitting
 *     tags: [Fittings]
 *     parameters:
 *       - in: path
 *         name: fittingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Result added
 */
router.post('/:fittingId/results', authMiddleware, fittingController.createFittingResult);

/**
 * @swagger
 * /api/fittings/{fittingId}/generate:
 *   post:
 *     summary: Trigger AI Fitting generation (Try-on + Mannequin)
 *     tags: [Fittings]
 *     parameters:
 *       - in: path
 *         name: fittingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Fitting initiated successfully
 */
router.post('/:fittingId/generate', authMiddleware, fittingController.generateFitting);

module.exports = router;
