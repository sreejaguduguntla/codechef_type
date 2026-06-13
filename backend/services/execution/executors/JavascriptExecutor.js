const spawnHelper = require('../utils/spawnHelper');

/**
 * Executes JavaScript code inside a directory.
 * @param {object} param0 - Parameters.
 * @param {string} param0.tempDir - Temporary directory path.
 * @param {string} param0.inputFilePath - Stdin input file path.
 * @returns {Promise<object>} Execution results.
 */
const execute = async ({ tempDir, inputFilePath }) => {
  return await spawnHelper.runProcess({
    cmd: 'node',
    args: ['solution.js'],
    cwd: tempDir,
    inputFilePath,
    timeoutMs: 3000
  });
};

module.exports = { execute };
