function resolveToIPandPORT(ensName) {
  switch (ensName) {
    default:
      throw new Error(`ENS mock: unknown domain: ${ensName}`);
  }
}

export default resolveToIPandPORT;
