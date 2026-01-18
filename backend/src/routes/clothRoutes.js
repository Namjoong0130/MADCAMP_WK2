const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const clothController = require('../controllers/clothController');

router.get('/', clothController.listCloths);
router.get('/design/history', authMiddleware, clothController.listDesignHistory);
router.get('/:clothId', clothController.getClothDetail);
router.post('/', authMiddleware, clothController.createCloth);
router.patch('/:clothId/physics', authMiddleware, clothController.updateClothPhysics);
router.get('/:clothId/attempts', authMiddleware, clothController.listDesignAttempts);
router.post('/:clothId/attempts', authMiddleware, clothController.createDesignAttempt);
/**
 * @swagger
 * /api/clothes/{clothId}/generate:
 *   post:
 *     summary: Generate an AI design for a clothing item
 *     tags: [Clothes]
 *     parameters:
 *       - in: path
 *         name: clothId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *     responses:
 *       200:
 *         description: AI Design Generated
 */
router.post('/:clothId/generate', authMiddleware, clothController.generateDesign); // Added

module.exports = router;
