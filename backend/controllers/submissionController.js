const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');
const ExecutionService = require('../services/execution/ExecutionService');

const LANGUAGE_IDS = {
  'cpp': 54,
  'c': 50,
  'python': 71,
  'java': 62,
  'javascript': 63,
  'go': 60,
  'rust': 73,
  'typescript': 74
};

// POST /api/submissions/run
const runCode = async (req, res) => {
  const { language, code, customInput } = req.body;
  if (!language || !code) {
    return res.status(400).json({ message: 'language and code are required' });
  }

  try {
    const result = await ExecutionService.execute({ language, code, stdin: customInput || '' });
    res.json({
      success: result.success,
      status: result.status,
      stdout: result.stdout,
      stderr: result.stderr,
      compile_output: result.compile_output,
      execution_time: result.execution_time,
      memory: result.memory
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, status: 'Internal Server Error', stderr: err.message });
  }
};

// POST /api/submissions
const submitCode = async (req, res) => {
  const { problemId, language, code } = req.body;
  if (!problemId || !language || !code) {
    return res.status(400).json({ message: 'problemId, language, and code are required' });
  }

  const langConfig = ExecutionService.LANGUAGE_MAP[language];
  if (!langConfig) {
    return res.status(400).json({ message: `Unsupported language: ${language}` });
  }

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const languageId = LANGUAGE_IDS[language] || 0;

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

    let passedCount = 0;
    let finalVerdict = 'Accepted';
    let failedTestDetails = null;
    let lastStdout = '';
    let lastExecutionTime = '0 ms';
    let lastMemory = '0.0 MB';
    let errorOutputMsg = '';

    for (let i = 0; i < problem.testCases.length; i++) {
      const tc = problem.testCases[i];
      const result = await ExecutionService.execute({ language, code, stdin: tc.input });

      lastExecutionTime = result.execution_time;
      lastMemory = result.memory;

      if (result.status === 'Compilation Error') {
        finalVerdict = 'Compilation Error';
        errorOutputMsg = result.compile_output;
        failedTestDetails = {
          status: 'Compilation Error',
          compile_output: result.compile_output,
          passed: passedCount,
          total: problem.testCases.length,
          execution_time: lastExecutionTime,
          memory: lastMemory
        };
        break;
      }

      if (result.status === 'Runtime Error') {
        finalVerdict = 'Runtime Error';
        errorOutputMsg = result.stderr;
        failedTestDetails = {
          status: 'Runtime Error',
          stderr: result.stderr,
          passed: passedCount,
          total: problem.testCases.length,
          execution_time: lastExecutionTime,
          memory: lastMemory
        };
        break;
      }

      if (result.status === 'Time Limit Exceeded') {
        finalVerdict = 'Time Limit Exceeded';
        errorOutputMsg = result.stderr || 'Time Limit Exceeded';
        failedTestDetails = {
          status: 'Time Limit Exceeded',
          passed: passedCount,
          total: problem.testCases.length,
          execution_time: lastExecutionTime,
          memory: lastMemory
        };
        break;
      }

      // Compare trimmed outputs
      const actualOutput = (result.stdout || '').replace(/\r\n/g, '\n').trim();
      const expectedOutput = (tc.expectedOutput || '').replace(/\r\n/g, '\n').trim();

      if (actualOutput === expectedOutput) {
        passedCount++;
        lastStdout = result.stdout;
      } else {
        finalVerdict = 'Wrong Answer';
        errorOutputMsg = `Wrong Answer on Test Case ${i + 1}.\nExpected: ${expectedOutput}\nActual: ${actualOutput}`;
        failedTestDetails = {
          status: 'Wrong Answer',
          failedTest: i + 1,
          expected: expectedOutput,
          received: actualOutput,
          passed: passedCount,
          total: problem.testCases.length,
          execution_time: lastExecutionTime,
          memory: lastMemory
        };
        break;
      }
    }

    // Save final stats to DB
    submission.verdict = finalVerdict;
    submission.testCasesPassed = passedCount;
    submission.errorOutput = errorOutputMsg;
    submission.runtime = parseInt(lastExecutionTime) || 0; 
    const memoryNum = parseFloat(lastMemory);
    submission.memory = isNaN(memoryNum) ? 0 : Math.round(memoryNum * 1024); // MB to KB
    await submission.save();

    // If accepted, update user & problem solve counts
    if (finalVerdict === 'Accepted') {
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

    // Return response JSON
    if (finalVerdict === 'Accepted') {
      res.json({
        status: 'Accepted',
        passed: passedCount,
        total: problem.testCases.length,
        execution_time: lastExecutionTime,
        stdout: lastStdout
      });
    } else {
      res.json(failedTestDetails);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'Internal Server Error', message: err.message });
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

module.exports = { submitCode, runCode, getMySubmissions, getAllSubmissions };
