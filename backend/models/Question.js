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
  testCases: [{
    input: String,
    output: String
  }],
  timeLimit: {
    type: Number, // in seconds
    default: 1
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
