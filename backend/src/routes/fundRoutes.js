const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');
const fundController = require('../controllers/fundController');

/**
 * @swagger
 * /api/funds/feed:
 *   get:
 *     summary: List funding feed
 *     tags: [Funds]
 *     responses:
 *       200:
 *         description: Funding feed list
 */
router.get('/feed', optionalAuthMiddleware, fundController.listFundingFeed);
router.post('/reminders', authMiddleware, fundController.processFundingReminders);
router.post('/failures', authMiddleware, fundController.processFundingFailures);

/**
 * @swagger
 * /api/funds/owner:
 *   get:
 *     summary: List funds created by me (Brand Owner)
 *     tags: [Funds]
 *     responses:
 *       200:
 *         description: List of my funds
 */
router.get('/owner', authMiddleware, fundController.listOwnerFunds);

/**
 * @swagger
 * /api/funds/investments/me:
 *   get:
 *     summary: List my investments
 *     tags: [Funds]
 *     responses:
 *       200:
 *         description: List of investments
 */
router.get('/investments/me', authMiddleware, fundController.listUserInvestments);

/**
 * @swagger
 * /api/funds/investments/{investId}:
 *   delete:
 *     summary: Cancel investment
 *     tags: [Funds]
 *     parameters:
 *       - in: path
 *         name: investId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Investment cancelled
 */
router.delete('/investments/:investId', authMiddleware, fundController.cancelInvestment);

/**
 * @swagger
 * /api/funds/{fundId}:
 *   get:
 *     summary: Get funding detail
 *     tags: [Funds]
 *     parameters:
 *       - in: path
 *         name: fundId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Funding details
 */
router.get('/:fundId', optionalAuthMiddleware, fundController.getFundDetail);

/**
 * @swagger
 * /api/funds/{fundId}/comments:
 *   get:
 *     summary: List comments for a fund
 *     tags: [Funds]
 *     parameters:
 *       - in: path
 *         name: fundId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comments list
 */
router.get('/:fundId/comments', fundController.listComments);

/**
 * @swagger
 * /api/funds/{fundId}/comments/{commentId}:
 *   patch:
 *     summary: Update a comment
 *     tags: [Funds]
 *     parameters:
 *       - in: path
 *         name: fundId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               rating:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Comment updated
 */
router.patch(
  '/:fundId/comments/:commentId',
  authMiddleware,
  fundController.updateComment
);

/**
 * @swagger
 * /api/funds/{fundId}/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Funds]
 *     parameters:
 *       - in: path
 *         name: fundId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comment deleted
 */
router.delete(
  '/:fundId/comments/:commentId',
  authMiddleware,
  fundController.deleteComment
);

/**
 * @swagger
 * /api/funds:
 *   post:
 *     summary: Create a new funding project
 *     tags: [Funds]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clothing_id
 *               - goal_amount
 *               - title
 *             properties:
 *               clothing_id:
 *                 type: integer
 *               goal_amount:
 *                 type: integer
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Funding created
 */
router.post('/', authMiddleware, fundController.createFund);

/**
 * @swagger
 * /api/funds/{fundId}/invest:
 *   post:
 *     summary: Invest in a fund
 *     tags: [Funds]
 *     parameters:
 *       - in: path
 *         name: fundId
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
 *               - amount
 *             properties:
 *               amount:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Investment successful
 */
router.post('/:fundId/invest', authMiddleware, fundController.createInvestment);

/**
 * @swagger
 * /api/funds/{fundId}/comments:
 *   post:
 *     summary: Create a comment
 *     tags: [Funds]
 *     parameters:
 *       - in: path
 *         name: fundId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created
 */
router.post('/:fundId/comments', authMiddleware, fundController.createComment);

/**
 * @swagger
 * /api/funds/{fundId}/like:
 *   post:
 *     summary: Toggle like for a fund
 *     tags: [Funds]
 *     parameters:
 *       - in: path
 *         name: fundId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Like toggled
 */
router.post('/:fundId/like', authMiddleware, fundController.toggleFundingLike);

/**
 * @swagger
 * /api/funds/{fundId}/production-note:
 *   patch:
 *     summary: Update production note (Owner only)
 *     tags: [Funds]
 *     parameters:
 *       - in: path
 *         name: fundId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               production_note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Note updated
 */
router.patch('/:fundId/production-note', authMiddleware, fundController.updateProductionNote);

/**
 * @swagger
 * /api/funds/{fundId}/status:
 *   patch:
 *     summary: Update funding status (Admin/System)
 *     tags: [Funds]
 *     parameters:
 *       - in: path
 *         name: fundId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [FUNDING, SUCCESS, FAIL, MAKING, DELIVERY, COMPLETED]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/:fundId/status', authMiddleware, fundController.updateFundingStatus);

module.exports = router;
