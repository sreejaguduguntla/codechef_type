const User = require('../models/User');

// GET /api/users/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('username score solvedProblems totalSubmissions createdAt')
      .sort({ score: -1, solvedProblems: -1 })
      .limit(50);
    const ranked = users.map((u, i) => ({
      rank: i + 1,
      username: u.username,
      score: u.score,
      solved: u.solvedProblems.length,
      totalSubmissions: u.totalSubmissions,
      joinedAt: u.createdAt,
    }));
    res.json(ranked);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/:username
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password')
      .populate('solvedProblems', 'title slug difficulty tags');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getLeaderboard, getUserProfile };
