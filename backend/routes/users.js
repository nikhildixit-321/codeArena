const express = require('express');
const router = express.Router();
const User = require('../models/User');

const auth = require('../middleware/auth');

// Search users
router.get('/search', auth, async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json([]);

        const currentUser = await User.findById(req.user.id);
        const users = await User.find({
            _id: { $ne: req.user.id },
            username: { $regex: query, $options: 'i' }
        })
            .select('username avatar rating friendRequests friends')
            .limit(10);

        const results = users.map(u => {
            const isFriend = currentUser.friends.some(id => id.toString() === u._id.toString());
            const hasSentRequest = u.friendRequests.some(id => id.toString() === req.user.id);
            const hasReceivedRequest = currentUser.friendRequests.some(id => id.toString() === u._id.toString());

            return {
                _id: u._id,
                username: u.username,
                avatar: u.avatar,
                rating: u.rating,
                isFriend,
                requested: hasSentRequest,
                received: hasReceivedRequest
            };
        });

        res.json(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Send friend request
router.post('/send-request/:userId', auth, async (req, res) => {
    try {
        const targetUserId = req.params.userId;
        const senderId = req.user.id;

        if (targetUserId === senderId.toString()) {
            return res.status(400).json({ message: "You can't add yourself" });
        }

        const targetUser = await User.findById(targetUserId);
        const currentUser = await User.findById(senderId);

        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        if (currentUser.friends.some(id => id.toString() === targetUserId)) {
            return res.status(400).json({ message: 'Already friends with this user' });
        }

        if (targetUser.friendRequests.some(id => id.toString() === senderId)) {
            return res.status(400).json({ message: 'You have already sent a request to this user' });
        }

        if (currentUser.friendRequests.some(id => id.toString() === targetUserId)) {
            return res.status(400).json({ message: 'This user has already sent you a request. Check your requests tab!' });
        }

        targetUser.friendRequests.push(senderId);
        await targetUser.save();

        res.json({ message: 'Friend request sent successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get pending requests
router.get('/requests', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('friendRequests', 'username avatar rating');
        res.json(user.friendRequests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Accept friend request
router.post('/accept-request/:userId', auth, async (req, res) => {
    try {
        const senderId = req.params.userId;
        const userId = req.user.id;

        const user = await User.findById(userId);
        const sender = await User.findById(senderId);

        if (!sender) return res.status(404).json({ message: 'Sender not found' });

        // Remove from requests
        user.friendRequests = user.friendRequests.filter(id => id.toString() !== senderId);

        // Add to friends for both
        if (!user.friends.some(id => id.toString() === senderId)) user.friends.push(senderId);
        if (!sender.friends.some(id => id.toString() === userId)) sender.friends.push(userId);

        await user.save();
        await sender.save();

        res.json({ message: 'Friend request accepted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Reject friend request
router.post('/reject-request/:userId', auth, async (req, res) => {
    try {
        const senderId = req.params.userId;
        const userId = req.user.id;

        const user = await User.findById(userId);
        user.friendRequests = user.friendRequests.filter(id => id.toString() !== senderId);
        await user.save();

        res.json({ message: 'Friend request rejected' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get friends list
router.get('/friends', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('friends', 'username avatar rating matchesPlayed matchesWon');
        res.json(user.friends);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
