function metaMaskInstalled() {
  return typeof ethereum != 'undefined' && ethereum.isMetaMask;
}

if (metaMaskInstalled()) {
  let currentChainId = null;
  ethereum
    .send('eth_chainId')
    .then(handleChainChanged)
    .catch(err => console.error(err));

  ethereum.on('chainChanged', handleChainChanged);

  function handleChainChanged(chainId) {
    if (currentChainId !== chainId) {
      currentChainId = chainId;
    }
  }

  let currentAccount = null;
  ethereum
    .send('eth_accounts')
    .then(handleAccountsChanged)
    .catch(err => {
      if (err.code === 4100) {
        console.log('Please connect to MetaMask.');
      } else {
        console.error(err);
      }
    });

  ethereum.on('accountsChanged', handleAccountsChanged);

  function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      console.log('Please connect to MetaMask.');
    } else if (accounts[0] !== currentAccount) {
      currentAccount = accounts[0];
    }
  }
}
function connect() {
  if (metaMaskInstalled()) {
    ethereum
      .send('eth_requestAccounts')
      .then(handleAccountsChanged)
      .catch(err => {
        if (err.code === 4001) {
          console.log('Please connect to MetaMask.');
        } else {
          console.error(err);
        }
      });
  }
}

export { metaMaskInstalled, connect };
