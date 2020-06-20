function metaMaskInstalled() {
  return typeof ethereum != 'undefined' && ethereum.isMetaMask;
}

function getFirstAccount(accounts) {
  if (accounts.length > 0) {
    return accounts[0];
  }
}

function metamaskConnectWrapper(accountChangedCallback) {
  const connect = () => {
    return new Promise((success, reject) => {
      metamaskConnect()
        .then(accounts => {
          const acc = getFirstAccount(accounts);
          if (acc) {
            accountChangedCallback(acc);
          } else {
            console.log('WARNING: received this from eth_requestAccounts, could not parse out a single account:');
            console.log(accounts);
            console.log('--------------------');
          }
        })
        .catch(reject);
    });
  };

  return connect;
}

function metamaskConnect() {
  return new Promise((success, reject) => {
    if (metaMaskInstalled()) {
      ethereum
        .send('eth_requestAccounts')
        .then(rpcResult => {
          success(rpcResult.result);
        })
        .catch(err => {
          if (err.code === 4001) {
            reject(new Error('Please connect to MetaMask.'));
          } else {
            reject(err);
          }
        });
    } else {
      reject(new Error('Metamask not installed! Why was the connect button shown ?'));
    }
  });
}

const MAX_RETRIES = 20;

function metamaskInit(accountChangedCallback = () => {}, { retryCount = MAX_RETRIES } = {}) {
  const retryInterval = 100;

  const first = retryCount == MAX_RETRIES;

  if (metaMaskInstalled()) {
    if (ethereum.selectedAddress) {
      console.log(`Success at ${MAX_RETRIES - retryCount}`);
      accountChangedCallback(ethereum.selectedAddress);
    } else if (retryCount > 0) {
      setTimeout(() => metamaskInit(accountChangedCallback, { retryCount: retryCount - 1 }), retryInterval);
    }

    if (first) {
      ethereum.on('accountsChanged', accounts => {
        const acc = getFirstAccount(accounts);
        if (acc) {
          accountChangedCallback(acc);
        }
      });
    }
  } else {
    console.log('METAMASK INIT FAILED: not installed');
    return false;
  }

  return metamaskConnectWrapper(accountChangedCallback);
}

export { metamaskInit };
