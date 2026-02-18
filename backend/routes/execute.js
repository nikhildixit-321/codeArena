const express = require('express');
const axios = require('axios');
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

    // Submit code to Judge0 CE (FREE) - wait=true for sync execution
    const response = await axios.post(
      `${JUDGE0_API_URL}/submissions?wait=true`,
      {
        source_code: code,
        language_id: languageId,
        stdin: stdin
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const result = response.data;

    res.json({
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      compile_output: result.compile_output || '',
      message: result.message || '',
      status: result.status?.description || 'Unknown',
      time: result.time || '0',
      memory: result.memory || 0,
      error: result.stderr || result.compile_output || null
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
    const response = await axios.post(
      `${JUDGE0_API_URL}/submissions?wait=true`,
      {
        source_code: 'print("test")',
        language_id: 71
      }
    );
    res.json({ 
      status: 'ok', 
      service: 'judge0-ce',
      test: response.data.stdout 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

module.exports = router;
