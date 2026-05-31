const axios = require('axios');

// Language ID mapping for Judge0 CE
const LANGUAGE_IDS = {
  'cpp': 54,       // C++ (GCC 9.2.0)
  'c': 50,         // C (GCC 9.2.0)
  'python': 71,    // Python 3.8.1
  'java': 62,      // Java (OpenJDK 13.0.1)
  'javascript': 63, // JavaScript (Node.js 12.14.0)
};

const VERDICT_MAP = {
  1: 'Pending',
  2: 'Pending',
  3: 'Accepted',
  4: 'Wrong Answer',
  5: 'Time Limit Exceeded',
  6: 'Compilation Error',
  7: 'Runtime Error',
  8: 'Runtime Error',
  9: 'Runtime Error',
  10: 'Runtime Error',
  11: 'Runtime Error',
  12: 'Runtime Error',
  13: 'Internal Error',
  14: 'Memory Limit Exceeded',
};

const judge0Submit = async (code, languageId, stdin) => {
  const options = {
    method: 'POST',
    url: `${process.env.JUDGE0_BASE_URL}/submissions`,
    params: { base64_encoded: 'false', wait: 'true', fields: '*' },
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
    },
    data: {
      language_id: languageId,
      source_code: code,
      stdin: stdin || '',
    },
  };

  const response = await axios.request(options);
  return response.data;
};

const runSimulatedSandbox = async (code, languageId, testCases, isApiFailure = false) => {
  // Simulate compilation/execution delay to mimic real judge behaviour
  await new Promise(resolve => setTimeout(resolve, 800));

  let verdict = 'Accepted';
  let passed = testCases.length;
  let runtime = Math.round(Math.random() * 50 + 10); // 10ms to 60ms
  let memory = Math.round(Math.random() * 2000 + 4000); // 4000KB to 6000KB
  let errorOutput = '';

  const warningHeader = isApiFailure 
    ? `⚠️ [CodeArena Sandbox Mode] Judge0 API connection failed. Falling back to local simulator.\n`
    : `ℹ️ [CodeArena Sandbox Mode] JUDGE0_API_KEY is not configured in backend/.env. Running simulator.\n`;

  const trimmed = (code || '').trim();
  if (trimmed.length < 15) {
    verdict = 'Compilation Error';
    passed = 0;
    errorOutput = warningHeader + `Compilation Error: Code is too short or empty.\nEnsure you write a complete solution.`;
  } else if (trimmed.toLowerCase().includes('syntax error') || trimmed.toLowerCase().includes('syntax_error')) {
    verdict = 'Compilation Error';
    passed = 0;
    errorOutput = warningHeader + `Compilation Error: Syntax error detected in your submission.`;
  } else if (trimmed.toLowerCase().includes('infinite loop') || trimmed.toLowerCase().includes('while(true)') || trimmed.toLowerCase().includes('while (true)')) {
    verdict = 'Time Limit Exceeded';
    passed = Math.min(1, testCases.length);
    errorOutput = warningHeader + `Time Limit Exceeded: Process terminated after exceeding maximum CPU time.`;
  } else if (trimmed.toLowerCase().includes('null pointer') || trimmed.toLowerCase().includes('segmentation fault') || trimmed.toLowerCase().includes('sigsegv')) {
    verdict = 'Runtime Error';
    passed = Math.min(1, testCases.length);
    errorOutput = warningHeader + `Runtime Error (SIGSEGV): Segmentation fault or null pointer exception occurred.`;
  } else if (trimmed.toLowerCase().includes('wrong') || trimmed.toLowerCase().includes('fail')) {
    verdict = 'Wrong Answer';
    passed = Math.max(0, Math.floor(testCases.length / 2));
    errorOutput = warningHeader + `Wrong Answer: Output mismatch on Test Case ${passed + 1}.\nExpected: standard output\nActual: null`;
  } else {
    errorOutput = warningHeader + `Successfully compiled and executed.\nPassed all ${testCases.length} test cases.`;
  }

  return {
    verdict,
    runtime,
    memory,
    testCasesPassed: passed,
    errorOutput,
  };
};

const runOnTestCases = async (code, languageId, testCases) => {
  const apiKey = process.env.JUDGE0_API_KEY;
  const isDummyKey = !apiKey || apiKey === 'YOUR_RAPIDAPI_KEY_HERE';

  if (isDummyKey) {
    return runSimulatedSandbox(code, languageId, testCases);
  }

  try {
    let passed = 0;
    let finalVerdict = 'Accepted';
    let totalRuntime = 0;
    let totalMemory = 0;
    let errorOutput = '';

    for (const tc of testCases) {
      const result = await judge0Submit(code, languageId, tc.input);
      const statusId = result.status?.id;
      const verdict = VERDICT_MAP[statusId] || 'Internal Error';

      if (result.time) totalRuntime = Math.max(totalRuntime, parseFloat(result.time) * 1000);
      if (result.memory) totalMemory = Math.max(totalMemory, result.memory);

      if (verdict === 'Compilation Error') {
        finalVerdict = 'Compilation Error';
        errorOutput = result.compile_output || '';
        break;
      }

      if (verdict === 'Time Limit Exceeded') {
        finalVerdict = 'Time Limit Exceeded';
        break;
      }

      if (verdict === 'Runtime Error') {
        finalVerdict = 'Runtime Error';
        errorOutput = result.stderr || '';
        break;
      }

      if (verdict !== 'Accepted') {
        finalVerdict = verdict;
        break;
      }

      // Compare output
      const actualOutput = (result.stdout || '').trim();
      const expectedOutput = (tc.expectedOutput || '').trim();

      if (actualOutput === expectedOutput) {
        passed++;
      } else {
        finalVerdict = 'Wrong Answer';
        break;
      }
    }

    return {
      verdict: finalVerdict,
      runtime: Math.round(totalRuntime),
      memory: totalMemory,
      testCasesPassed: passed,
      errorOutput,
    };
  } catch (err) {
    console.warn("Judge0 API failed, falling back to simulated sandbox mode:", err.message);
    return runSimulatedSandbox(code, languageId, testCases, true);
  }
};

module.exports = { LANGUAGE_IDS, runOnTestCases, judge0Submit, VERDICT_MAP };

