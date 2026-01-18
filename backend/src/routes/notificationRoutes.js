const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const notificationController = require('../controllers/notificationController');

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: List notifications
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get('/', authMiddleware, notificationController.listNotifications);

/**
 * @swagger
 * /api/notifications/{notiId}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: notiId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Marked as read
 */
router.patch('/:notiId/read', authMiddleware, notificationController.markAsRead);

module.exports = router;
