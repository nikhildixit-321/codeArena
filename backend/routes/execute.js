const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const router = express.Router();

// Judge0 CE - FREE Public API (No API Key Required)
const JUDGE0_API_URL = 'https://ce.judge0.com';

// Language IDs for Judge0
const LANGUAGE_IDS = {
  javascript: 63,  // Node.js
  python: 71,      // Python 3
  cpp: 54,         // C++ (GCC 9.2.0)
  c: 50,           // C (GCC 9.2.0)
  java: 62,        // Java (OpenJDK 13.0.1)
  go: 60,          // Go
  rust: 73,        // Rust
  ruby: 72,        // Ruby
  php: 68,         // PHP
  typescript: 74,  // TypeScript
  kotlin: 78,      // Kotlin
  swift: 83,       // Swift
  csharp: 51,      // C# (Mono 6.6.0.161)
};

// Execute code using Judge0 CE (FREE)
router.post('/run', async (req, res) => {
  try {
    const { code, language, stdin = '' } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    const languageId = LANGUAGE_IDS[language];
    if (!languageId) {
      return res.status(400).json({ error: `Language '${language}' is not supported` });
    }

    // Encode the source code and stdin in base64 as required by Judge0 free tier
    const encodedCode = Buffer.from(code, 'utf8').toString('base64');
    const encodedStdin = Buffer.from(stdin, 'utf8').toString('base64');

    // Submit code to Judge0 CE (FREE) - wait=true for sync execution
    const response = await axios.post(
      `${JUDGE0_API_URL}/submissions?wait=true&base64_encoded=true`,
      {
        source_code: encodedCode,
        language_id: languageId,
        stdin: encodedStdin
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const result = response.data;

    // Decode base64 responses from Judge0
    const decodeBase64 = (str) => {
      if (!str) return '';
      try {
        return Buffer.from(str, 'base64').toString('utf8');
      } catch (error) {
        console.error('Base64 decode error:', error);
        return str; // Return original string if decoding fails
      }
    };

    res.json({
      stdout: decodeBase64(result.stdout) || '',
      stderr: decodeBase64(result.stderr) || '',
      compile_output: decodeBase64(result.compile_output) || '',
      message: result.message || '',
      status: result.status?.description || 'Unknown',
      time: result.time || '0',
      memory: result.memory || 0,
      error: decodeBase64(result.stderr) || decodeBase64(result.compile_output) || null
    });

  } catch (error) {
    console.error('Judge0 execution error:', error.message);
    console.error('Error details:', error.response?.data);
    res.status(500).json({
      error: 'Code execution failed',
      message: error.response?.data?.message || error.message
    });
  }
});

// Get supported languages
router.get('/languages', async (req, res) => {
  try {
    const response = await axios.get(`${JUDGE0_API_URL}/languages`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch languages' });
  }
});

// Health check
router.get('/health', async (req, res) => {
  try {
    const encodedTestCode = Buffer.from('print("test")', 'utf8').toString('base64');
    const response = await axios.post(
      `${JUDGE0_API_URL}/submissions?wait=true&base64_encoded=true`,
      {
        source_code: encodedTestCode,
        language_id: 71
      }
    );
    // Decode the test response
    const decodeBase64 = (str) => {
      if (!str) return '';
      try {
        return Buffer.from(str, 'base64').toString('utf8');
      } catch (error) {
        console.error('Base64 decode error:', error);
        return str; // Return original string if decoding fails
      }
    };

    res.json({
      status: 'ok',
      service: 'judge0-ce',
      test: decodeBase64(response.data.stdout)
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Submit Practice Code (Awards Points and Updates Streak)
router.post('/submit-practice', require('../middleware/auth'), async (req, res) => {
  try {
    const { questionId, passed } = req.body;
    // req.user is set by the middleware
    const userId = req.user.id || req.user._id;

    if (!passed) {
      return res.json({ message: 'Keep trying!' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Award Points
    user.points += 5;

    // --- Daily Streak Logic (Consolidated) ---
    // Updates streak if not already updated today, and handles streak resets.
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let lastActive = user.streak?.lastActive ? new Date(user.streak.lastActive) : null;
    if (lastActive) lastActive.setHours(0, 0, 0, 0);

    // Only update streak if not already updated today
    if (!lastActive || lastActive.getTime() < today.getTime()) {
      if (lastActive) {
        const diffTime = Math.abs(today - lastActive);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Continued streak
          user.streak.current += 1;
          user.points += 10; // Bonus for streak continuation
        } else if (diffDays > 1) {
          // Broken streak
          user.streak.current = 1;
        }
      } else {
        // First time ever
        user.streak = { current: 1, lastActive: new Date() };
        user.points += 5; // First time bonus
      }
      // Update last active to today
      user.streak.lastActive = new Date();
    }

    await user.save();

    res.json({
      message: 'Practice problem solved! Points awarded.',
      points: user.points,
      streak: user.streak.current
    });

  } catch (err) {
    console.error("Practice submission error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
