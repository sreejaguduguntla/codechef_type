const { spawn } = require('child_process');
const fs = require('fs');

/**
 * Runs a command as a child process.
 * @param {object} param0 - Parameters.
 * @param {string} param0.cmd - Command to execute.
 * @param {string[]} param0.args - Arguments array.
 * @param {string} param0.cwd - Current working directory.
 * @param {string} [param0.inputFilePath] - Optional file path to redirect to stdin.
 * @param {number} [param0.timeoutMs=3000] - Process timeout limit in milliseconds.
 * @returns {Promise<{code: number, signal: string, stdout: string, stderr: string, isTimeout: boolean, elapsedMs: number, memoryMB: number}>}
 */
const runProcess = ({ cmd, args, cwd, inputFilePath, timeoutMs = 3000 }) => {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let isTimeout = false;
    const startTime = process.hrtime();
    let maxMemory = 0;
    let memoryInterval = null;

    let inFd = null;
    let stdioConfig = ['pipe', 'pipe', 'pipe'];

    if (inputFilePath && fs.existsSync(inputFilePath)) {
      try {
        inFd = fs.openSync(inputFilePath, 'r');
        stdioConfig = [inFd, 'pipe', 'pipe'];
      } catch (err) {
        console.error('Failed to open stdin file:', err.message);
      }
    }

    // Spawn process detached to facilitate process group SIGKILL
    const child = spawn(cmd, args, {
      cwd,
      stdio: stdioConfig,
      detached: true
    });

    if (inFd) {
      // Safe to close in parent as it was passed to and cloned by child
      try {
        fs.closeSync(inFd);
      } catch (err) {
        console.error('Error closing inFd:', err);
      }
    }

    // Track memory usage in a lightweight interval
    if (child.pid) {
      memoryInterval = setInterval(() => {
        if (!child.pid) return;
        const ps = spawn('ps', ['-o', 'rss=', '-p', child.pid.toString()]);
        let psOutput = '';
        ps.stdout.on('data', (data) => {
          psOutput += data.toString();
        });
        ps.on('close', () => {
          const rssKb = parseInt(psOutput.trim(), 10);
          if (!isNaN(rssKb)) {
            const rssMb = rssKb / 1024;
            if (rssMb > maxMemory) {
              maxMemory = rssMb;
            }
          }
        });
      }, 50);
    }

    // Process Timeout mechanism
    const timer = setTimeout(() => {
      isTimeout = true;
      clearInterval(memoryInterval);
      if (child.pid) {
        try {
          // Send SIGKILL to the entire process group
          process.kill(-child.pid, 'SIGKILL');
        } catch (e) {
          try {
            child.kill('SIGKILL');
          } catch (err) {}
        }
      }
    }, timeoutMs);

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      clearInterval(memoryInterval);
      resolve({
        code: -1,
        signal: null,
        stdout,
        stderr: stderr || err.message,
        isTimeout,
        elapsedMs: 0,
        memoryMB: 0
      });
    });

    child.on('close', (code, signal) => {
      clearTimeout(timer);
      clearInterval(memoryInterval);
      
      const diff = process.hrtime(startTime);
      const elapsedMs = Math.round(diff[0] * 1000 + diff[1] / 1000000);

      resolve({
        code,
        signal,
        stdout,
        stderr,
        isTimeout,
        elapsedMs,
        memoryMB: maxMemory
      });
    });
  });
};

module.exports = {
  runProcess
};
