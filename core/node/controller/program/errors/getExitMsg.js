import stripAnsi from 'strip-ansi';

export default function getExitMsg(msg, { program, timeutils } = {}) {
  if (msg instanceof Error) {
    msg = msg.stack || msg;
  }

  const dmtStartedAt = program?.slot('device').get('dmtStartedAt');
  let startedAgo = '';
  if (dmtStartedAt) {
    startedAgo = `\n[ Process age was ${timeutils.prettyTime(dmtStartedAt)} ]`;
  }

  return `🛑 DMT PROCESS TERMINATED\n🪲⚠️ ${stripAnsi(msg.toString())}\n${startedAgo}`;
}
