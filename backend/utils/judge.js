const axios = require('axios');

const JUDGE0_API_URL = 'https://ce.judge0.com';

// Map to Judge0 Language IDs
const LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  cpp: 54,
  java: 62
};

const executeCode = async (code, testCases, language) => {
  const languageId = LANGUAGE_IDS[language] || 63;
  const results = [];

  for (const tc of testCases) {
    let sourceCode = code;

    // WRAPPER LOGIC for Function-based problems (like LeetCode)
    // transforming to Stdin/Stdout based on language
    if (language === 'javascript') {
      // Append driver code
      sourceCode += `\nconsole.log(JSON.stringify(solution(${tc.input})));`;
    } else if (language === 'python') {
      // Python needs proper json parsing if input is json-like, or just eval if simple
      // Assuming input is like "1, 2" or "[1,2], 3"
      // We print the result
      sourceCode += `\nimport json\nprint(solution(${tc.input}))`;
    } else if (language === 'cpp') {
      // C++ is harder to wrap dynamically without a proper main template.
      // For now, we assume user writes a full solution or we skip C++ wrapping complexity 
      // and expect user to read from stdin in main().
      // BUT our frontend provides class Solution... 
      // Let's simple disable C++ auto-wrapping and expect user to write main? 
      // No, user expects Leetcode style.
      // Doing this properly requires a robust C++ AST or template.
      // Compromise: We might fail C++ for "function style" inputs unless we strictly format inputs.
    }

    // Encode
    const encodedCode = Buffer.from(sourceCode, 'utf8').toString('base64');

    try {
      const response = await axios.post(
        `${JUDGE0_API_URL}/submissions?wait=true&base64_encoded=true`,
        {
          source_code: encodedCode,
          language_id: languageId,
          stdin: Buffer.from("", 'utf8').toString('base64') // We injected input into source code for JS/Py
        }
      );

      const result = response.data;
      const stdout = result.stdout ? Buffer.from(result.stdout, 'base64').toString('utf8').trim() : '';
      const stderr = result.stderr ? Buffer.from(result.stderr, 'base64').toString('utf8').trim() : '';
      const compile_output = result.compile_output ? Buffer.from(result.compile_output, 'base64').toString('utf8').trim() : '';

      // Compare Output
      // We normalize string to handle newlines/spaces
      // Note: tc.output needs to be matched.
      // If tc.output is "2", and stdout is "2", it passes.
      // If tc.output is "[0,1]", stdout might be "[0, 1]" (space).
      // Simple trim equality for now.

      const passed = stdout === tc.output || stdout === tc.output.replace(/\s/g, '');

      results.push({
        passed,
        actual: stdout || stderr || compile_output, // Show error if fails
        expected: tc.output,
        executionTime: parseFloat(result.time || 0) * 1000 // s to ms
      });

    } catch (err) {
      console.error("Judge0 Error:", err.message);
      results.push({
        passed: false,
        actual: "Execution Error",
        expected: tc.output,
        executionTime: 0
      });
    }
  }

  const allPassed = results.every(r => r.passed);
  const totalTime = results.reduce((acc, r) => acc + r.executionTime, 0);
  const avgTime = results.length > 0 ? (totalTime / results.length).toFixed(2) : 0;

  return {
    allPassed,
    avgTime,
    results
  };
};

module.exports = { executeCode };
