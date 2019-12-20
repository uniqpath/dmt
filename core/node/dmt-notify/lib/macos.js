const { exec } = require('child_process');

const { platform } = process;

module.exports = {
  notify(title, msg) {
    if (platform == 'darwin') {
      exec(`osascript -e 'display notification "${msg}" with title "${title}"'`, (err, stdout, stderr) => {});
    }
  }
};
