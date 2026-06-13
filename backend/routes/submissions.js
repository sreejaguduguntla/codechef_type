const express = require('express');
const router = express.Router();
const { submitCode, runCode, getMySubmissions, getAllSubmissions } = require('../controllers/submissionController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, submitCode);
router.post('/run', protect, runCode);
router.get('/me', protect, getMySubmissions);
router.get('/all', protect, adminOnly, getAllSubmissions);

module.exports = router;
