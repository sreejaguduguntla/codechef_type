const express = require('express');
const router = express.Router();
const { submitCode, getMySubmissions, getAllSubmissions } = require('../controllers/submissionController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, submitCode);
router.get('/me', protect, getMySubmissions);
router.get('/all', protect, adminOnly, getAllSubmissions);

module.exports = router;
