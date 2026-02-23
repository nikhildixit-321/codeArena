const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for Avatar Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/avatars';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only images (jpg, png, webp) are allowed'));
  }
});

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, username: user.username },
    process.env.SESSION_SECRET,
    { expiresIn: '7d' }
  );
};

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.SESSION_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login with google 
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json(info);

    const token = generateToken(user);
    return res.json({ message: 'Logged in successfully', user, token });
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.json({ message: 'Logged out successfully' });
  });
});

// Google Auth
router.get('/google', (req, res, next) => {
  const origin = req.query.origin || req.get('referer') || process.env.FRONTEND_URL;
  const state = Buffer.from(JSON.stringify({ origin })).toString('base64');
  passport.authenticate('google', { scope: ['profile', 'email'], state, session: false })(req, res, next);
});

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `/login`, session: false }),
  (req, res) => {
    try {
      const state = req.query.state ? JSON.parse(Buffer.from(req.query.state, 'base64').toString()) : {};
      const targetOrigin = (state.origin && state.origin !== 'undefined') ? state.origin : (process.env.FRONTEND_URL.split(',')[0]);

      // Clean up targetOrigin to remove trailing slash if any
      const cleanOrigin = targetOrigin.replace(/\/$/, '');

      const token = generateToken(req.user);
      res.redirect(`${cleanOrigin}/auth/callback?token=${token}`);
    } catch (err) {
      console.error('OAuth Callback Error:', err);
      res.redirect(`${process.env.FRONTEND_URL.split(',')[0]}/login`);
    }
  }
);

// GitHub Auth
router.get('/github', (req, res, next) => {
  const origin = req.query.origin || req.get('referer') || process.env.FRONTEND_URL;
  const state = Buffer.from(JSON.stringify({ origin })).toString('base64');
  passport.authenticate('github', { scope: ['user:email'], state, session: false })(req, res, next);
});

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: `/login`, session: false }),
  (req, res) => {
    try {
      const state = req.query.state ? JSON.parse(Buffer.from(req.query.state, 'base64').toString()) : {};
      const targetOrigin = (state.origin && state.origin !== 'undefined') ? state.origin : (process.env.FRONTEND_URL.split(',')[0]);

      const cleanOrigin = targetOrigin.replace(/\/$/, '');

      const token = generateToken(req.user);
      res.redirect(`${cleanOrigin}/auth/callback?token=${token}`);
    } catch (err) {
      console.error('OAuth Callback Error:', err);
      res.redirect(`${process.env.FRONTEND_URL.split(',')[0]}/login`);
    }
  }
);

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Daily Streak Logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let lastActive = user.streak?.lastActive ? new Date(user.streak.lastActive) : null;
    if (lastActive) lastActive.setHours(0, 0, 0, 0);

    // If last active was yesterday, increment streak
    if (lastActive) {
      const diffTime = Math.abs(today - lastActive);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Continued streak
        if (user.streak.lastActive.getDate() !== new Date().getDate()) {
          user.streak.current += 1;
          user.streak.lastActive = new Date();
          user.points += 10; // Bonus for streak
          await user.save();
        }
      } else if (diffDays > 1) {
        // Broken streak
        user.streak.current = 1;
        user.streak.lastActive = new Date();
        await user.save();
      }
      // If diffDays === 0, already logged in today, do nothing
    } else {
      // First time
      user.streak = { current: 1, lastActive: new Date() };
      user.points += 5; // First login bonus
      await user.save();
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Avatar
router.post('/avatar', authenticateToken, (req, res) => {
  upload.single('avatar')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File is too large. Max limit is 5MB' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Please upload an image' });
      }

      const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
      const avatarUrl = `${backendUrl}/uploads/avatars/${req.file.filename}`;

      await User.findByIdAndUpdate(req.user.id, { avatar: avatarUrl });

      res.json({ message: 'Avatar updated successfully', avatarUrl });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
});

// Update Settings
router.post('/settings', authenticateToken, async (req, res) => {
  try {
    const { settings } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { settings } },
      { new: true }
    ).select('-password');

    res.json({ message: 'Settings updated successfully', settings: user.settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Change Password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.password) {
      return res.status(400).json({ message: 'Social login users cannot change password this way' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Account
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
