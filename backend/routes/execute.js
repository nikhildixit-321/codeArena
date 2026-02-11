const express = require('express');
const axios = require('axios');
const router = express.Router();

// Judge0 API configuration
const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || 'YOUR_RAPIDAPI_KEY_HERE';
const JUDGE0_API_HOST = 'judge0-ce.p.rapidapi.com';

// Language IDs for Judge0
const LANGUAGE_IDS = {
  javascript: 63,  // Node.js
  python: 71,      // Python 3
  cpp: 54,         // C++ (GCC 9.2.0)
  c: 50,           // C (GCC 9.2.0)
  java: 62,        // Java (OpenJDK 13.0.1)
  typescript: 74,  // TypeScript
  go: 60,          // Go
  rust: 73,        // Rust
  ruby: 72,        // Ruby
  php: 68,         // PHP
  kotlin: 78,      // Kotlin
  swift: 83,       // Swift
  csharp: 51,      // C# (Mono 6.6.0.161)
};

// Execute code
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

    // Submit code to Judge0
    const submitResponse = await axios.post(
      `${JUDGE0_API_URL}/submissions`,
      {
        source_code: code,
        language_id: languageId,
        stdin: stdin,
        wait: false // Don't wait, we'll check status separately
      },
      {
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': JUDGE0_API_KEY,
          'X-RapidAPI-Host': JUDGE0_API_HOST
        }
      }
    );

    const token = submitResponse.data.token;

    // Poll for result
    let result;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

      const statusResponse = await axios.get(
        `${JUDGE0_API_URL}/submissions/${token}`,
        {
          headers: {
            'X-RapidAPI-Key': JUDGE0_API_KEY,
            'X-RapidAPI-Host': JUDGE0_API_HOST
          }
        }
      );

      result = statusResponse.data;

      // Check if processing is complete
      if (result.status.id > 2) { // 1: In Queue, 2: Processing
        break;
      }

      attempts++;
    }

    // Format output
    const output = {
      status: result.status.description,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      compile_output: result.compile_output || '',
      message: result.message || '',
      time: result.time,
      memory: result.memory
    };

    res.json(output);

  } catch (err) {
    console.error('Code execution error:', err.message);
    res.status(500).json({ 
      error: 'Failed to execute code',
      message: err.message 
    });
  }
});

// Get supported languages
router.get('/languages', (req, res) => {
  res.json({
    javascript: 'JavaScript (Node.js)',
    python: 'Python 3',
    cpp: 'C++',
    c: 'C',
    java: 'Java',
    typescript: 'TypeScript',
    go: 'Go',
    rust: 'Rust',
    ruby: 'Ruby',
    php: 'PHP',
    kotlin: 'Kotlin',
    swift: 'Swift',
    csharp: 'C#'
  });
});

module.exports = router;
