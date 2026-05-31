const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isSample: { type: Boolean, default: false },
});

const exampleSchema = new mongoose.Schema({
  input: String,
  output: String,
  explanation: String,
});

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  inputFormat: { type: String, default: '' },
  outputFormat: { type: String, default: '' },
  constraints: { type: String, default: '' },
  examples: [exampleSchema],
  testCases: [testCaseSchema],
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy',
  },
  tags: [{ type: String }],
  timeLimit: { type: Number, default: 2 }, // seconds
  memoryLimit: { type: Number, default: 256 }, // MB
  totalSubmissions: { type: Number, default: 0 },
  acceptedSubmissions: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

problemSchema.virtual('acceptanceRate').get(function () {
  if (this.totalSubmissions === 0) return 0;
  return ((this.acceptedSubmissions / this.totalSubmissions) * 100).toFixed(1);
});

problemSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Problem', problemSchema);
