const express = require('express');
const router = express.Router();
const { getLeaderboard, getUserProfile } = require('../controllers/userController');

router.get('/leaderboard', getLeaderboard);
router.get('/:username', getUserProfile);

module.exports = router;
