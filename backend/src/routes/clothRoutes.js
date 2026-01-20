const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const clothController = require('../controllers/clothController');

/**
 * @swagger
 * /api/clothes:
 *   get:
 *     summary: List all clothes (with filters)
 *     tags: [Clothes]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [latest, popular, price, price_desc]
 *     responses:
 *       200:
 *         description: List of clothes
 */
router.get('/', clothController.listCloths);

/**
 * @swagger
 * /api/clothes/design/history:
 *   get:
 *     summary: List my design history
 *     tags: [Clothes]
 *     responses:
 *       200:
 *         description: List of design attempts
 */
router.get('/design/history', authMiddleware, clothController.listDesignHistory);

/**
 * @swagger
 * /api/clothes/{clothId}:
 *   get:
 *     summary: Get cloth details
 *     tags: [Clothes]
 *     parameters:
 *       - in: path
 *         name: clothId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cloth details
 */
router.get('/:clothId', clothController.getClothDetail);

/**
 * @swagger
 * /api/clothes:
 *   post:
 *     summary: Create a new clothing item
 *     tags: [Clothes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Cloth created
 */
router.post('/', authMiddleware, clothController.createCloth);

/**
 * @swagger
 * /api/clothes/{clothId}/physics:
 *   patch:
 *     summary: Update cloth physics/specs
 *     tags: [Clothes]
 *     parameters:
 *       - in: path
 *         name: clothId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stretch:
 *                 type: integer
 *               weight:
 *                 type: integer
 *               layer_order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Physics updated
 */
router.patch('/:clothId/physics', authMiddleware, clothController.updateClothPhysics);

/**
 * @swagger
 * /api/clothes/{clothId}/attempts:
 *   get:
 *     summary: List design attempts for a cloth
 *     tags: [Clothes]
 *     parameters:
 *       - in: path
 *         name: clothId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of attempts
 *   post:
 *     summary: Save a manual design attempt
 *     tags: [Clothes]
 *     parameters:
 *       - in: path
 *         name: clothId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Attempt saved
 */
router.get('/:clothId/attempts', authMiddleware, clothController.listDesignAttempts);
router.post('/:clothId/attempts', authMiddleware, clothController.createDesignAttempt);

/**
 * @swagger
 * /api/clothes/{clothId}:
 *   delete:
 *     summary: Delete a clothing item
 *     tags: [Clothes]
 *     parameters:
 *       - in: path
 *         name: clothId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cloth deleted
 */
router.delete('/:clothId', authMiddleware, clothController.deleteCloth);

const uploadMiddleware = require('../middlewares/uploadMiddleware');

/**
 * @swagger
 * /api/clothes/{clothId}/generate:
 *   post:
 *     summary: Generate an AI design for a clothing item
 *     tags: [Clothes]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: AI Design Generated
 */
router.post('/:clothId/generate', authMiddleware, uploadMiddleware.array('images', 2), clothController.generateDesign);


module.exports = router;
