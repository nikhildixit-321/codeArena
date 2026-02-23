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

// Get Active Matches (Live)
router.get('/active', auth, matchController.getActiveMatches);

// Get Leaderboard
router.get('/leaderboard', matchController.getLeaderboard);

// Get Match History for User
router.get('/history', auth, matchController.getMatchHistory);

// Get Match Details
router.get('/:matchId', auth, matchController.getMatchDetails);

module.exports = router;
