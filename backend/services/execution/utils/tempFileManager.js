const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const TEMP_BASE_DIR = path.resolve(__dirname, '..', 'temp');

// Ensure base temp directory exists
if (!fs.existsSync(TEMP_BASE_DIR)) {
  fs.mkdirSync(TEMP_BASE_DIR, { recursive: true });
}

/**
 * Creates a unique folder using random UUID.
 * @returns {{uuid: string, dirPath: string}} Object with folder UUID and path.
 */
const createTempDir = () => {
  const uuid = crypto.randomUUID();
  const dirPath = path.join(TEMP_BASE_DIR, uuid);
  fs.mkdirSync(dirPath, { recursive: true });
  return { uuid, dirPath };
};

/**
 * Writes code to a file inside the specified directory.
 * @param {string} dirPath - Folder path.
 * @param {string} filename - Filename.
 * @param {string} code - Source code string.
 * @returns {string} Path to the created file.
 */
const writeCodeFile = (dirPath, filename, code) => {
  const filePath = path.join(dirPath, filename);
  fs.writeFileSync(filePath, code, 'utf8');
  return filePath;
};

/**
 * Writes stdin input to input.txt inside the specified directory.
 * @param {string} dirPath - Folder path.
 * @param {string} stdin - Input string.
 * @returns {string} Path to the created file.
 */
const writeInputFile = (dirPath, stdin) => {
  const filePath = path.join(dirPath, 'input.txt');
  fs.writeFileSync(filePath, stdin || '', 'utf8');
  return filePath;
};

module.exports = {
  createTempDir,
  writeCodeFile,
  writeInputFile
};
