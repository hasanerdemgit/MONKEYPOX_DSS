const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Giriş doğrulama rotası
router.post('/login', authController.login);

module.exports = router;
