const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const auth = require('../middleware/auth'); // Assuming auth middleware exists

// Helper to get random question
router.get('/question/random', auth, matchController.getRandomQuestion);

// Submit match result (Win/Loss)
router.post('/result', auth, matchController.submitMatchResult);

// Get Daily Challenge
router.get('/daily', auth, matchController.getDailyChallenge);

// Get Leaderboard
router.get('/leaderboard', matchController.getLeaderboard); // Public route usually

module.exports = router;
