import { isDevMachine, device, log } from 'dmt/common';

export default function connectomeLogging() {
  const moreClientLogging = false;
  const moreServerLogging = false;

  const fiberPoolLog = moreClientLogging ? log : console.log;
  const verboseClient = moreClientLogging ? 'extra' : null;
  const verboseServer = moreServerLogging ? 'extra' : null;

  return { client: { verbose: verboseClient, fiberPoolLog }, server: { verbose: verboseServer } };
}
