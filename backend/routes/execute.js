const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Use local execution for supported languages
// Fallback to mock execution for demo

const executeLocal = async (code, language) => {
  const tempDir = path.join(__dirname, '../../temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const timestamp = Date.now();
  let filename, command;

  switch (language) {
    case 'javascript':
      filename = `code_${timestamp}.js`;
      fs.writeFileSync(path.join(tempDir, filename), code);
      command = `cd ${tempDir} && node ${filename}`;
      break;
    case 'python':
      filename = `code_${timestamp}.py`;
      fs.writeFileSync(path.join(tempDir, filename), code);
      command = `cd ${tempDir} && python3 ${filename}`;
      break;
    default:
      return { 
        stdout: '', 
        stderr: `${language} execution requires external API. Please use JavaScript or Python for now.`,
        error: 'Language not supported in local mode'
      };
  }

  return new Promise((resolve) => {
    exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
      // Cleanup
      try { fs.unlinkSync(path.join(tempDir, filename)); } catch {}
      
      resolve({
        stdout: stdout || '',
        stderr: stderr || '',
        error: error ? error.message : null
      });
    });
  });
};

// Execute code
router.post('/run', async (req, res) => {
  try {
    const { code, language, stdin = '' } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    // Try local execution first
    const result = await executeLocal(code, language);

    res.json({
      stdout: result.stdout,
      stderr: result.stderr,
      error: result.error,
      status: result.error ? 'Error' : 'Accepted'
    });

  } catch (error) {
    console.error('Execution error:', error.message);
    res.status(500).json({
      error: 'Code execution failed',
      message: error.message
    });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'local-execution',
    supported: ['javascript', 'python']
  });
});

module.exports = router;
