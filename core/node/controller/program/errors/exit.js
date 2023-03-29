import { log } from 'dmt/common';

export default function exit() {
  log.yellow('EXITING, bye ✋');
  process.exit();
}
