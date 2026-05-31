const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');
const { LANGUAGE_IDS, runOnTestCases } = require('../utils/judge0');

// POST /api/submissions
const submitCode = async (req, res) => {
  const { problemId, language, code } = req.body;
  if (!problemId || !language || !code) {
    return res.status(400).json({ message: 'problemId, language, and code are required' });
  }

  const languageId = LANGUAGE_IDS[language];
  if (!languageId) {
    return res.status(400).json({ message: `Unsupported language: ${language}` });
  }

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    // Create initial pending submission
    const submission = await Submission.create({
      user: req.user._id,
      problem: problemId,
      language,
      languageId,
      code,
      verdict: 'Pending',
      totalTestCases: problem.testCases.length,
    });

    // Update problem submission count
    await Problem.findByIdAndUpdate(problemId, { $inc: { totalSubmissions: 1 } });
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalSubmissions: 1 } });

    // Run on test cases via Judge0
    const { verdict, runtime, memory, testCasesPassed, errorOutput } = await runOnTestCases(
      code,
      languageId,
      problem.testCases
    );

    // Update submission
    submission.verdict = verdict;
    submission.runtime = runtime;
    submission.memory = memory;
    submission.testCasesPassed = testCasesPassed;
    submission.errorOutput = errorOutput;
    await submission.save();

    // If accepted, update problem & user
    if (verdict === 'Accepted') {
      await Problem.findByIdAndUpdate(problemId, { $inc: { acceptedSubmissions: 1 } });
      const user = await User.findById(req.user._id);
      if (!user.solvedProblems.includes(problemId)) {
        const points = problem.difficulty === 'Easy' ? 10 : problem.difficulty === 'Medium' ? 20 : 30;
        await User.findByIdAndUpdate(req.user._id, {
          $addToSet: { solvedProblems: problemId },
          $inc: { score: points },
        });
      }
    }

    res.json(submission);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Judge error: ' + err.message });
  }
};

// GET /api/submissions/me
const getMySubmissions = async (req, res) => {
  try {
    const { problemId } = req.query;
    const filter = { user: req.user._id };
    if (problemId) filter.problem = problemId;
    const submissions = await Submission.find(filter)
      .populate('problem', 'title slug difficulty')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/submissions/all (admin)
const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate('user', 'username')
      .populate('problem', 'title slug')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { submitCode, getMySubmissions, getAllSubmissions };
