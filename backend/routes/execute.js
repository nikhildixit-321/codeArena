const express = require('express');
const axios = require('axios');
const router = express.Router();

// RapidAPI - Online Code Compiler
const RAPID_API_URL = 'https://online-code-compiler.p.rapidapi.com/v1/';
const RAPID_API_KEY = process.env.RAPID_API_KEY || '';
const RAPID_API_HOST = 'online-code-compiler.p.rapidapi.com';

// Language mapping for RapidAPI (use version_index instead of 'latest')
const LANGUAGES = {
  javascript: { language: 'nodejs', versionIndex: '2' },
  python: { language: 'python3', versionIndex: '3' },
  cpp: { language: 'cpp17', versionIndex: '0' },
  c: { language: 'c', versionIndex: '0' },
  java: { language: 'java', versionIndex: '3' },
  go: { language: 'go', versionIndex: '3' },
  rust: { language: 'rust', versionIndex: '3' },
  ruby: { language: 'ruby', versionIndex: '3' },
  php: { language: 'php', versionIndex: '3' },
  typescript: { language: 'typescript', versionIndex: '3' },
  kotlin: { language: 'kotlin', versionIndex: '2' },
  swift: { language: 'swift', versionIndex: '3' },
  csharp: { language: 'csharp', versionIndex: '3' },
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
        versionIndex: langConfig.versionIndex,
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
