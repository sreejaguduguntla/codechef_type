const spawnHelper = require('../utils/spawnHelper');

/**
 * Compiles and executes C code.
 * @param {object} param0 - Parameters.
 * @param {string} param0.tempDir - Temporary directory path.
 * @param {string} param0.inputFilePath - Stdin input file path.
 * @returns {Promise<object>} Compile or execute result.
 */
const execute = async ({ tempDir, inputFilePath }) => {
  // Compile
  const compileResult = await spawnHelper.runProcess({
    cmd: 'gcc',
    args: ['solution.c', '-o', 'solution'],
    cwd: tempDir,
    timeoutMs: 5000 // Allow up to 5s for compiling
  });

  if (compileResult.code !== 0) {
    return {
      status: 'Compilation Error',
      compile_output: compileResult.stderr || compileResult.stdout || 'Compilation failed.'
    };
  }

  // Run
  return await spawnHelper.runProcess({
    cmd: './solution',
    args: [],
    cwd: tempDir,
    inputFilePath,
    timeoutMs: 3000
  });
};

module.exports = { execute };
