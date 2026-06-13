const fs = require('fs');

/**
 * Recursively deletes the specified directory.
 * @param {string} dirPath - Folder path to delete.
 */
const cleanDir = (dirPath) => {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  } catch (err) {
    console.error(`Error cleaning up directory ${dirPath}:`, err);
  }
};

module.exports = {
  cleanDir
};
