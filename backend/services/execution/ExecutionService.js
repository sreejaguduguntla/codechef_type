const path = require('path');
const tempFileManager = require('./utils/tempFileManager');
const { cleanDir } = require('./utils/cleanup');

const pythonExecutor = require('./executors/PythonExecutor');
const javascriptExecutor = require('./executors/JavascriptExecutor');
const cppExecutor = require('./executors/CppExecutor');
const cExecutor = require('./executors/CExecutor');
const javaExecutor = require('./executors/JavaExecutor');

const EXECUTORS = {
  'python': { executor: pythonExecutor, filename: 'solution.py', baselineMemory: 8.5 },
  'javascript': { executor: javascriptExecutor, filename: 'solution.js', baselineMemory: 22.4 },
  'cpp': { executor: cppExecutor, filename: 'solution.cpp', baselineMemory: 1.2 },
  'c': { executor: cExecutor, filename: 'solution.c', baselineMemory: 1.1 },
  'java': { executor: javaExecutor, filename: 'Main.java', baselineMemory: 32.7 }
};

const LANGUAGE_MAP = {
  'python': { name: 'python', ext: 'py' },
  'javascript': { name: 'javascript', ext: 'js' },
  'cpp': { name: 'c++', ext: 'cpp' },
  'c': { name: 'c', ext: 'c' },
  'java': { name: 'java', ext: 'java' }
};

/**
 * Main function to compile/execute code locally.
 * @param {object} param0 - Request parameters.
 * @param {string} param0.language - The programming language key.
 * @param {string} param0.code - User's submission source code.
 * @param {string} param0.stdin - Stdin data to provide.
 * @returns {Promise<{success: boolean, status: string, stdout: string, stderr: string, compile_output: string, execution_time: string, memory: string}>}
 */
const execute = async ({ language, code, stdin }) => {
  const config = EXECUTORS[language];
  if (!config) {
    return {
      success: false,
      status: 'Internal Server Error',
      stdout: '',
      stderr: `Unsupported language: ${language}`,
      compile_output: '',
      execution_time: '0 ms',
      memory: '0.0 MB'
    };
  }

  let tempDirObj = null;
  try {
    // 1. Create a unique, isolated temp folder
    tempDirObj = tempFileManager.createTempDir();
    const { dirPath } = tempDirObj;

    // 2. Write source code file and input file
    tempFileManager.writeCodeFile(dirPath, config.filename, code);
    const inputFilePath = tempFileManager.writeInputFile(dirPath, stdin);

    // 3. Trigger compilation & execution
    const result = await config.executor.execute({
      tempDir: dirPath,
      inputFilePath
    });

    // 4. Handle compilation errors
    if (result.status === 'Compilation Error') {
      return {
        success: false,
        status: 'Compilation Error',
        stdout: '',
        stderr: '',
        compile_output: result.compile_output,
        execution_time: '0 ms',
        memory: '0.0 MB'
      };
    }

    // 5. Calculate final execution status
    let status = 'Accepted';
    if (result.isTimeout) {
      status = 'Time Limit Exceeded';
    } else if (result.code !== 0 || result.signal) {
      status = 'Runtime Error';
    }

    // Compute execution time string (MERN submissionController expects integer representation parsed out)
    const execution_time = `${result.elapsedMs} ms`;
    
    // Compute memory footprint (MB)
    const finalMemoryMB = result.memoryMB > 0 ? result.memoryMB : config.baselineMemory;
    const memory = `${finalMemoryMB.toFixed(1)} MB`;

    return {
      success: status === 'Accepted',
      status,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      compile_output: '',
      execution_time,
      memory
    };

  } catch (err) {
    console.error(`Internal Execution Error for language ${language}:`, err);
    return {
      success: false,
      status: 'Internal Server Error',
      stdout: '',
      stderr: err.message,
      compile_output: '',
      execution_time: '0 ms',
      memory: '0.0 MB'
    };
  } finally {
    // 6. Ensure automated cleanup of temporary directory ALWAYS occurs
    if (tempDirObj) {
      cleanDir(tempDirObj.dirPath);
    }
  }
};

module.exports = {
  execute,
  LANGUAGE_MAP
};
