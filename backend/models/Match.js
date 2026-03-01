const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  players: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    socketId: String,
    status: {
      type: String,
      enum: ['pending', 'ready', 'fighting', 'finished'],
      default: 'pending'
    },
    code: String,
    score: Number,
    executionTime: Number,
    memoryUsed: Number
  }],
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'completed'],
    default: 'waiting'
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reason: { // SOLVED, TIMEOUT, DISCONNECT, RESIGN, ABORT
    type: String
  },
  ratingChanges: [{
    userId: mongoose.Schema.Types.ObjectId,
    change: Number
  }],
  startTime: Date,
  endTime: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Match', MatchSchema);
