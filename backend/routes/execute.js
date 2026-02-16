const express = require('express');
const axios = require('axios');
const router = express.Router();

// RapidAPI - Online Code Compiler
const RAPID_API_URL = 'https://online-code-compiler.p.rapidapi.com/v1/';
const RAPID_API_KEY = process.env.RAPID_API_KEY || '';
const RAPID_API_HOST = 'online-code-compiler.p.rapidapi.com';

// Language mapping for RapidAPI
const LANGUAGES = {
  javascript: { language: 'nodejs', version: 'latest' },
  python: { language: 'python3', version: 'latest' },
  cpp: { language: 'cpp17', version: 'latest' },
  c: { language: 'c', version: 'latest' },
  java: { language: 'java', version: 'latest' },
  go: { language: 'go', version: 'latest' },
  rust: { language: 'rust', version: 'latest' },
  ruby: { language: 'ruby', version: 'latest' },
  php: { language: 'php', version: 'latest' },
  typescript: { language: 'typescript', version: 'latest' },
  kotlin: { language: 'kotlin', version: 'latest' },
  swift: { language: 'swift', version: 'latest' },
  csharp: { language: 'csharp', version: 'latest' },
};

// Execute code using RapidAPI
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

    // Check if API key is configured
    if (!RAPID_API_KEY) {
      return res.status(500).json({ 
        error: 'RapidAPI key not configured',
        message: 'Please add RAPID_API_KEY to environment variables'
      });
    }

    // Execute using RapidAPI
    const response = await axios.post(
      `${RAPID_API_URL}`,
      {
        language: langConfig.language,
        version: langConfig.version,
        code: code,
        input: stdin
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': RAPID_API_KEY,
          'X-RapidAPI-Host': RAPID_API_HOST
        },
        timeout: 30000
      }
    );

    const result = response.data;

    res.json({
      stdout: result.output || '',
      stderr: result.error || '',
      error: result.error ? result.error : null,
      status: result.error ? 'Error' : 'Accepted'
    });

  } catch (error) {
    console.error('RapidAPI execution error:', error.message);
    console.error('Error details:', error.response?.data);
    res.status(500).json({
      error: 'Code execution failed',
      message: error.response?.data?.message || error.message
    });
  }
});

// Health check
router.get('/health', async (req, res) => {
  if (!RAPID_API_KEY) {
    return res.status(500).json({ 
      status: 'error', 
      message: 'RapidAPI key not configured'
    });
  }
  
  res.json({ 
    status: 'ok', 
    service: 'rapidapi',
    supported: Object.keys(LANGUAGES)
  });
});

module.exports = router;
