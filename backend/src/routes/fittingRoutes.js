const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const fittingController = require('../controllers/fittingController');

router.get('/', authMiddleware, fittingController.listFittings);
router.get('/album', authMiddleware, fittingController.listFittingAlbum);
router.get('/:fittingId', authMiddleware, fittingController.getFittingDetail);
router.post('/', authMiddleware, fittingController.createFitting);
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
router.post('/:fittingId/generate', authMiddleware, fittingController.generateFitting); // Added

module.exports = router;
