const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const brandController = require('../controllers/brandController');

/**
 * @swagger
 * /api/brands/public:
 *   get:
 *     summary: List all public brands
 *     tags: [Brands]
 *     responses:
 *       200:
 *         description: List of brands
 */
router.get('/public', brandController.listPublicBrands);

/**
 * @swagger
 * /api/brands/profiles:
 *   get:
 *     summary: List brand profiles (filtered)
 *     tags: [Brands]
 *     responses:
 *       200:
 *         description: List of brand profiles
 */
router.get('/profiles', brandController.listBrandProfiles);

/**
 * @swagger
 * /api/brands/{brandId}/profile:
 *   get:
 *     summary: Get specific brand profile
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Brand profile details
 */
router.get('/:brandId/profile', brandController.getBrandProfile);

/**
 * @swagger
 * /api/brands/{brandId}:
 *   get:
 *     summary: Get brand details
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Brand details
 */
router.get('/:brandId', brandController.getBrandDetail);

/**
 * @swagger
 * /api/brands:
 *   post:
 *     summary: Create a new brand
 *     tags: [Brands]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - brand_name
 *             properties:
 *               brand_name:
 *                 type: string
 *               brand_logo:
 *                 type: string
 *               brand_story:
 *                 type: string
 *     responses:
 *       201:
 *         description: Brand created
 */
router.post('/', authMiddleware, brandController.createBrand);
/**
 * @swagger
 * /api/brands/{brandId}:
 *   delete:
 *     summary: Delete a brand
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Brand deleted
 */
router.delete('/:brandId', authMiddleware, brandController.deleteBrand);

/**
 * @swagger
 * /api/brands/{brandId}/follow:
 *   post:
 *     summary: Toggle follow brand
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Follow status toggled
 */
router.post('/:brandId/follow', authMiddleware, brandController.toggleFollow);

module.exports = router;
