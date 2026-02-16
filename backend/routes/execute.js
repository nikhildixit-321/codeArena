const express = require('express');
const axios = require('axios');
const router = express.Router();

// Piston API - Using alternative public instance
const PISTON_API_URL = 'https://piston.tabby.page/api/v2';

// Create axios instance with timeout
const pistonClient = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Language versions for Piston
const LANGUAGES = {
  javascript: { language: 'javascript', version: '18.15.0' },
  python: { language: 'python', version: '3.10.0' },
  cpp: { language: 'cpp', version: '10.2.0' },
  c: { language: 'c', version: '10.2.0' },
  java: { language: 'java', version: '15.0.2' },
  typescript: { language: 'typescript', version: '5.0.3' },
  go: { language: 'go', version: '1.16.2' },
  rust: { language: 'rust', version: '1.68.2' },
  ruby: { language: 'ruby', version: '3.0.1' },
  php: { language: 'php', version: '8.2.3' },
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

    // Execute code using Piston
    const response = await pistonClient.post(
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
      }
    );

    const result = response.data;

    // Format response similar to Judge0 for compatibility
    res.json({
      stdout: result.run?.stdout || '',
      stderr: result.run?.stderr || '',
      compile_output: result.compile?.stderr || '',
      message: result.run?.output || '',
      status: result.run?.code === 0 ? 'Accepted' : 'Error',
      time: result.run?.runtime ? `${result.run.runtime}ms` : '0ms',
      memory: result.run?.memory ? `${result.run.memory}KB` : '0KB',
      error: result.run?.stderr || result.compile?.stderr || null
    });

  } catch (error) {
    console.error('Piston execution error:', error.message);
    console.error('Error details:', error.response?.data);
    res.status(500).json({
      error: 'Code execution failed',
      message: error.response?.data?.message || error.message,
      details: error.response?.data || 'No additional details'
    });
  }
});

// Get available runtimes (languages)
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
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'piston' });
});

module.exports = router;
