function resolveToIPandPORT(ensName) {
  switch (ensName) {
    case 'zeta.eth':
      return { ip: '134.122.75.242', port: '7780' };
    default:
      throw new Error(`ENS mock: unknown domain: ${ensName}`);
  }
}

export default resolveToIPandPORT;
