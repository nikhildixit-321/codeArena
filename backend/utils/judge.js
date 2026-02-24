const axios = require('axios');

const JUDGE0_API_URL = 'https://ce.judge0.com';

// Map to Judge0 Language IDs
const LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  cpp: 54,
  java: 62
};

const wrapCode = (code, language, input = null, functionName = 'solution') => {
  let sourceCode = code;

  if (language === 'javascript') {
    if (input !== null) {
      if (code.includes('class Solution')) {
        sourceCode += `\nconst sol = new Solution();\nconsole.log(JSON.stringify(sol.${functionName}(${input})));`;
      } else {
        sourceCode += `\nconsole.log(JSON.stringify(${functionName}(${input})));`;
      }
    }
  } else if (language === 'python') {
    if (input !== null) {
      if (code.includes('class Solution')) {
        sourceCode += `\nimport json\nsol = Solution()\nprint(sol.${functionName}(${input}))`;
      } else {
        sourceCode += `\nimport json\nprint(${functionName}(${input}))`;
      }
    }
  } else if (language === 'cpp') {
    if (!code.includes('main(') && !code.includes('main (')) {
      const isClass = code.includes('class Solution');
      const functionMatch = code.match(/(?:vector<[^>]+>|int|long|string|void|double|float|bool|auto|char)\s+([a-zA-Z0-9_]+)\s*\(/);
      const functionName = functionMatch ? functionMatch[1] : 'solution';

      sourceCode = `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <unordered_map>
#include <map>
#include <set>
#include <queue>
#include <stack>
#include <math.h>

using namespace std;

${code}

// Helper to print results
template<typename T>
void printRes(const T& t) { cout << t << endl; }

template<typename T>
void printRes(const vector<T>& v) {
    cout << "[";
    for(size_t i = 0; i < v.size(); ++i) {
        cout << v[i] << (i == v.size() - 1 ? "" : ",");
    }
    cout << "]" << endl;
}

int main() {
    ${isClass ? 'Solution sol;' : ''}
    try {
        ${input !== null ? `
        auto result = ${isClass ? 'sol.' : ''}${functionName}(${input.replace(/\[/g, '{').replace(/\]/g, '}')});
        printRes(result);` : '// No input provided for wrapper'}
    } catch (...) {
        return 1;
    }
    return 0;
}
`;
    }
  } else if (language === 'java') {
    if (!code.includes('public static void main')) {
      sourceCode = `import java.util.*;
import java.util.stream.*;

public class Main {
    ${code}
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        // Dynamic call would need reflection for Java, but let's assume 'solution' for now or standard method
        // For Java we usually expect Solution class with a method.
    }
}
`;
    }
  }
  return sourceCode;
};

const executeCode = async (code, testCases, language, functionName = 'solution') => {
  const languageId = LANGUAGE_IDS[language] || 63;
  const results = [];

  for (const tc of testCases) {
    const sourceCode = wrapCode(code, language, tc.input, functionName);
    const encodedCode = Buffer.from(sourceCode, 'utf8').toString('base64');

    try {
      const response = await axios.post(
        `${JUDGE0_API_URL}/submissions?wait=true&base64_encoded=true`,
        {
          source_code: encodedCode,
          language_id: languageId,
          stdin: Buffer.from("", 'utf8').toString('base64')
        }
      );

      const result = response.data;
      const stdout = result.stdout ? Buffer.from(result.stdout, 'base64').toString('utf8').trim() : '';
      const stderr = result.stderr ? Buffer.from(result.stderr, 'base64').toString('utf8').trim() : '';
      const compile_output = result.compile_output ? Buffer.from(result.compile_output, 'base64').toString('utf8').trim() : '';

      const passed = stdout === tc.output || stdout === tc.output.replace(/\s/g, '');

      results.push({
        passed,
        input: tc.input,
        actual: stdout || stderr || compile_output,
        expected: tc.output,
        executionTime: parseFloat(result.time || 0) * 1000
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

module.exports = { executeCode, wrapCode };
