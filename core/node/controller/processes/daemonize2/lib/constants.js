const exitCodes = {
  argMainRequired: [96, "'main' argument is required"],
  mainNotFound: [97, "Specified 'main' module cannot be found"],
  chdirFailed: [99, 'Failed to change working directory to root'],
  setgidNoPriv: [100, 'No privilege to change group id'],
  setgidFailed: [101, 'Failed to change group id'],
  setuidNoPriv: [102, 'No privilege to change user id'],
  setuidFailed: [103, 'Failed to change user id']
};

function findExitCode(code) {
  for (const name in exitCodes) if (exitCodes[name][0] == code) return exitCodes[name][1];
  return code;
}

export { findExitCode, exitCodes };
