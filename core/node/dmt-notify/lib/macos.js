import { exec } from 'child_process';

const { platform } = process;

function notify(title, msg) {
  if (platform == 'darwin') {
    exec(`osascript -e 'display notification "${msg}" with title "${title}"'`, (err, stdout, stderr) => {});
  }
}

export { notify };
