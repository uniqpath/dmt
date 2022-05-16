import stripAnsi from 'strip-ansi';

export default function getExitMsg(msg) {
  return `🪲⚠️ ${stripAnsi(msg)} → 🛑 DMT PROCESS TERMINATED`;
}
