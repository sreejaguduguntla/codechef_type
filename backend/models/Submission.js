const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  language: { type: String, required: true },
  languageId: { type: Number, required: true },
  code: { type: String, required: true },
  verdict: {
    type: String,
    enum: ['Pending', 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Compilation Error', 'Runtime Error', 'Memory Limit Exceeded', 'Internal Error'],
    default: 'Pending',
  },
  runtime: { type: Number, default: null }, // ms
  memory: { type: Number, default: null },  // KB
  errorOutput: { type: String, default: '' },
  testCasesPassed: { type: Number, default: 0 },
  totalTestCases: { type: Number, default: 0 },
  exitCode: { type: Number, default: 0 },
  sandbox: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
