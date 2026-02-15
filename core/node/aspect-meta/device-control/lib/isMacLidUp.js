import { isMacOS } from 'dmt/common';

import { execSync } from 'child_process';

export default function isMacLidUp() {
  if (!isMacOS()) return true;

  try {
    const output = execSync('ioreg -r -k AppleClamshellState | grep AppleClamshellState').toString();

    return !output.includes('"AppleClamshellState" = Yes');
  } catch (error) {
    return true;
  }
}
