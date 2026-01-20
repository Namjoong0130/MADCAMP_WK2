/*
(통합 관리)
*/

const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const brandRoutes = require('./brandRoutes');
const clothRoutes = require('./clothRoutes');
const fittingRoutes = require('./fittingRoutes');
const fundRoutes = require('./fundRoutes');
const notificationRoutes = require('./notificationRoutes');
const uploadRoutes = require('./uploadRoutes'); // Added

// /api/auth 로 들어오는 모든 요청은 authRoutes에서 처리
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/brands', brandRoutes);
router.use('/clothes', clothRoutes);
router.use('/fittings', fittingRoutes);
router.use('/funds', fundRoutes);
router.use('/notifications', notificationRoutes);
router.use('/upload', uploadRoutes); // Added

module.exports = router;
