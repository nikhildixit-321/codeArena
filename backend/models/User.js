const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String
  },
  googleId: String,
  githubId: String,
  avatar: String,
  rating: {
    type: Number,
    default: 600
  },
  matchesPlayed: {
    type: Number,
    default: 0
  },
  matchesWon: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0
  },
  streak: {
    current: { type: Number, default: 0 },
    lastActive: { type: Date }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  friendRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  settings: {
    notifications: { type: Boolean, default: true },
    publicProfile: { type: Boolean, default: true },
    soundEffects: { type: Boolean, default: true },
    language: { type: String, default: 'English' },
    leetcodeHandle: { type: String, default: '' },
    codeforcesHandle: { type: String, default: '' },
    leetcodeSession: { type: String, default: '' }, // LEETCODE_SESSION cookie
    autoSubmitEnabled: { type: Boolean, default: false }
  }
});

module.exports = mongoose.model('User', UserSchema);
