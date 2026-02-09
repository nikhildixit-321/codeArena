const { VM } = require('vm2');

const executeCode = (code, testCases) => {
  const results = testCases.map(tc => {
    const vm = new VM({
      timeout: 1000,
      sandbox: {}
    });

    try {
      // Assuming the code is a function or a script that returns a result
      // For LeetCode style, we might need to wrap the code
      const script = `${code}\nsolution(${tc.input})`;
      const startTime = process.hrtime();
      const output = vm.run(script);
      const endTime = process.hrtime(startTime);
      
      const executionTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2); // in ms
      
      return {
        passed: String(output) === tc.output,
        actual: String(output),
        expected: tc.output,
        executionTime: parseFloat(executionTime)
      };
    } catch (err) {
      return {
        passed: false,
        error: err.message,
        executionTime: 0
      };
    }
  });

  const allPassed = results.every(r => r.passed);
  const totalTime = results.reduce((acc, r) => acc + r.executionTime, 0);
  const avgTime = (totalTime / results.length).toFixed(2);

  return {
    allPassed,
    avgTime: parseFloat(avgTime),
    results
  };
};

module.exports = { executeCode };
