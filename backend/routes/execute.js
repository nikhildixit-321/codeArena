const express = require('express');
const axios = require('axios');
const router = express.Router();

// Self-hosted Piston API
const PISTON_API_URL = 'http://localhost:2000/api/v2';

// Language versions for Piston
const LANGUAGES = {
  javascript: { language: 'javascript', version: '18.15.0' },
  python: { language: 'python', version: '3.10.0' },
  cpp: { language: 'cpp', version: '10.2.0' },
  c: { language: 'c', version: '10.2.0' },
  java: { language: 'java', version: '15.0.2' },
  go: { language: 'go', version: '1.16.2' },
  rust: { language: 'rust', version: '1.68.2' },
  ruby: { language: 'ruby', version: '3.0.1' },
  php: { language: 'php', version: '8.2.3' },
  typescript: { language: 'typescript', version: '5.0.3' },
  kotlin: { language: 'kotlin', version: '1.8.20' },
  swift: { language: 'swift', version: '5.3.3' },
  csharp: { language: 'csharp', version: '6.12.0' },
};

// Execute code using Piston
router.post('/run', async (req, res) => {
  try {
    const { code, language, stdin = '' } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    const langConfig = LANGUAGES[language];
    if (!langConfig) {
      return res.status(400).json({ error: `Language '${language}' not supported` });
    }

    const response = await axios.post(
      `${PISTON_API_URL}/execute`,
      {
        language: langConfig.language,
        version: langConfig.version,
        files: [{ content: code }],
        stdin: stdin
      },
      { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
    );

    const result = response.data;
    res.json({
      stdout: result.run?.stdout || '',
      stderr: result.run?.stderr || '',
      error: result.run?.stderr || null,
      status: result.run?.code === 0 ? 'Accepted' : 'Error'
    });

  } catch (error) {
    console.error('Piston error:', error.message);
    res.status(500).json({
      error: 'Execution failed',
      message: error.response?.data?.message || error.message
    });
  }
});

// Install language
router.post('/install/:language', async (req, res) => {
  try {
    const { language } = req.params;
    const langConfig = LANGUAGES[language];
    
    if (!langConfig) {
      return res.status(400).json({ error: 'Language not supported' });
    }

    const response = await axios.post(
      `${PISTON_API_URL}/packages`,
      {
        language: langConfig.language,
        version: langConfig.version
      }
    );

    res.json({ message: 'Installing...', data: response.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get installed runtimes
router.get('/runtimes', async (req, res) => {
  try {
    const response = await axios.get(`${PISTON_API_URL}/runtimes`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
