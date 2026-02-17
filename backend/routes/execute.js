const express = require('express');
const axios = require('axios');
const router = express.Router();

// Piston API - Official EMKC instance (FREE)
const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

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

// Execute code using Piston API
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

    // Execute using Piston API
    const response = await axios.post(
      `${PISTON_API_URL}/execute`,
      {
        language: langConfig.language,
        version: langConfig.version,
        files: [
          {
            content: code
          }
        ],
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
      stdout: result.run?.stdout || '',
      stderr: result.run?.stderr || '',
      error: result.run?.stderr || result.compile?.stderr || null,
      status: result.run?.code === 0 ? 'Accepted' : 'Error',
      time: result.run?.runtime ? `${result.run.runtime}ms` : '0ms',
      memory: result.run?.memory ? `${result.run.memory}KB` : '0KB'
    });

  } catch (error) {
    console.error('Piston execution error:', error.message);
    console.error('Error details:', error.response?.data);
    res.status(500).json({
      error: 'Code execution failed',
      message: error.response?.data?.message || error.message
    });
  }
});

// Get available runtimes
router.get('/runtimes', async (req, res) => {
  try {
    const response = await axios.get(`${PISTON_API_URL}/runtimes`);
    res.json(response.data);
  } catch (error) {
    console.error('Failed to fetch runtimes:', error.message);
    res.status(500).json({ error: 'Failed to fetch runtimes' });
  }
});

// Health check
router.get('/health', async (req, res) => {
  try {
    const response = await axios.post(
      `${PISTON_API_URL}/execute`,
      {
        language: 'python',
        version: '3.10.0',
        files: [{ content: 'print("test")' }]
      }
    );
    res.json({ 
      status: 'ok', 
      service: 'piston',
      test: response.data.run?.stdout 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

module.exports = router;
