const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  constraints: [String],
  difficulty: {
    type: String, // Easy, Medium, Hard
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  source: {
    type: String, // Codeforces, LeetCode
    required: true
  },
  leetcodeSlug: String,
  leetcodeId: String,
  officialLink: String,
  testCases: [{
    input: String,
    output: String,
    isHidden: { type: Boolean, default: false }
  }],
  hints: [String],
  functionName: {
    type: String,
    default: 'solution'
  },
  starterCode: {
    javascript: String,
    python: String,
    cpp: String,
    java: String
  },
  timeLimit: {
    type: Number, // in seconds
    default: 900 // 15 minutes default
  },
  memoryLimit: {
    type: Number, // in MB
    default: 256
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Question', QuestionSchema);
