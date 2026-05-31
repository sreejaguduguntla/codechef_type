const Problem = require('../models/Problem');

// GET /api/problems
const getProblems = async (req, res) => {
  try {
    const { difficulty, tag, search, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (difficulty) filter.difficulty = difficulty;
    if (tag) filter.tags = tag;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const problems = await Problem.find(filter)
      .select('-testCases -description')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    const total = await Problem.countDocuments(filter);

    res.json({ problems, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/problems/:slug
const getProblem = async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug, isActive: true });
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    // Don't expose hidden test cases
    const problemObj = problem.toJSON();
    problemObj.testCases = problem.testCases.filter(tc => tc.isSample);
    res.json(problemObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/problems (admin)
const createProblem = async (req, res) => {
  try {
    const problem = await Problem.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(problem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/problems/:id (admin)
const updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json(problem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/problems/:id (admin)
const deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json({ message: 'Problem deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProblems, getProblem, createProblem, updateProblem, deleteProblem };
