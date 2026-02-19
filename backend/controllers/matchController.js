const Match = require('../models/Match');
const Question = require('../models/Question');
const User = require('../models/User');

// --- ELO Rating Constants ---
const K_FACTOR = 32;

// --- Helper: Calculate Expected Score ---
// Ra: Rating of Player A, Rb: Rating of Player B
const getExpectedScore = (Ra, Rb) => {
    return 1 / (1 + Math.pow(10, (Rb - Ra) / 400));
};

exports.startLoop = async (req, res) => {
    // This function typically handles the matchmaking queue loop via sockets, 
    // but here we might expose an endpoint to "get a match question"
    // For simplicity, we'll return a random question suitable for a duel.
};

// Get a random question for the battle
exports.getRandomQuestion = async (req, res) => {
    try {
        const { platform, difficulty } = req.query;

        const matchStage = { $match: {} };
        if (platform) matchStage.$match.source = new RegExp(platform, 'i');
        if (difficulty) matchStage.$match.difficulty = difficulty;

        // Sample 1 random question
        const questions = await Question.aggregate([
            matchStage,
            { $sample: { size: 1 } }
        ]);

        if (questions.length === 0) {
            // Fallback if no questions match criteria, just get any random one
            const fallback = await Question.aggregate([{ $sample: { size: 1 } }]);
            if (fallback.length === 0) return res.status(404).json({ error: 'No questions found' });
            return res.json(fallback[0]);
        }

        res.json(questions[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Handle Match Result & Rating Update
exports.submitMatchResult = async (req, res) => {
    try {
        const { matchId, winnerId, loserId } = req.body;

        const winner = await User.findById(winnerId);
        const loser = await User.findById(loserId);

        if (!winner || !loser) {
            return res.status(404).json({ error: 'Users not found' });
        }

        // Calculate Ratings
        const expectedWinner = getExpectedScore(winner.rating, loser.rating);
        const expectedLoser = getExpectedScore(loser.rating, winner.rating);

        // Update Ratings
        // Winner gets 1 point, Loser gets 0
        const newWinnerRating = Math.round(winner.rating + K_FACTOR * (1 - expectedWinner));
        const newLoserRating = Math.round(loser.rating + K_FACTOR * (0 - expectedLoser));

        // Save changes
        winner.rating = newWinnerRating;
        winner.matchesWon += 1;
        winner.matchesPlayed += 1;
        await winner.save();

        loser.rating = newLoserRating;
        loser.matchesPlayed += 1;
        await loser.save();

        // Update Match Record
        // Assuming Match model exists and has 'winner' field
        if (matchId) {
            await Match.findByIdAndUpdate(matchId, {
                winner: winnerId,
                status: 'completed',
                endTime: new Date()
            });
        }

        res.json({
            message: 'Match recorded',
            winner: { id: winnerId, newRating: newWinnerRating, delta: newWinnerRating - winner.rating },
            loser: { id: loserId, newRating: newLoserRating, delta: newLoserRating - loser.rating }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Daily Challenge
exports.getDailyChallenge = async (req, res) => {
    try {
        // Simple deterministic strategy based on date
        // 1. Count total questions
        const count = await Question.countDocuments();
        if (count === 0) return res.status(404).json({ error: 'No questions available' });

        // 2. Generate an index from today's date
        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        const index = seed % count;

        // 3. Fetch question at that index
        const question = await Question.findOne().skip(index);

        res.json({
            date: today.toISOString().split('T')[0],
            question: question
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const users = await User.find().sort({ rating: -1 }).limit(50).select('username rating avatar matchesWon');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
