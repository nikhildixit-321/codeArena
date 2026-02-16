const express = require('express');
const axios = require('axios');
const router = express.Router();

// Glot.io API - Free code execution
const GLOT_API_URL = 'https://glot.io/api/run';

// Language mapping for Glot
const LANGUAGES = {
  javascript: { language: 'javascript', version: 'latest' },
  python: { language: 'python', version: 'latest' },
  cpp: { language: 'cpp', version: 'latest' },
  c: { language: 'c', version: 'latest' },
  java: { language: 'java', version: 'latest' },
  go: { language: 'go', version: 'latest' },
  rust: { language: 'rust', version: 'latest' },
  ruby: { language: 'ruby', version: 'latest' },
  php: { language: 'php', version: 'latest' },
  typescript: { language: 'typescript', version: 'latest' },
};

// Execute code
router.post('/run', async (req, res) => {
  try {
    const { code, language, stdin = '' } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    const langConfig = LANGUAGES[language];
    if (!langConfig) {
      return res.status(400).json({ error: `Language '${language}' is not supported` });
    }

    // Execute using Glot.io
    const response = await axios.post(
      `${GLOT_API_URL}/${langConfig.language}/${langConfig.version}`,
      {
        files: [
          {
            name: language === 'java' ? 'Main.java' : `main.${language}`,
            content: code
          }
        ],
        stdin: stdin,
        command: ''
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );

    const result = response.data;

    res.json({
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      error: result.error || null,
      status: result.error ? 'Error' : 'Accepted'
    });

  } catch (error) {
    console.error('Glot execution error:', error.message);
    console.error('Error details:', error.response?.data);
    res.status(500).json({
      error: 'Code execution failed',
      message: error.response?.data?.message || error.message
    });
  }
});

// Health check
router.get('/health', async (req, res) => {
  try {
    const response = await axios.post(
      `${GLOT_API_URL}/javascript/latest`,
      { files: [{ name: 'main.js', content: 'console.log("test")' }] },
      { timeout: 10000 }
    );
    res.json({ 
      status: 'ok', 
      service: 'glot',
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
