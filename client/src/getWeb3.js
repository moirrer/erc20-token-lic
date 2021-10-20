import Web3 from "web3";
import Log from "./util/Log"

const getWeb3 = (onAccountsChanged = null) =>
  new Promise( async (resolve, reject) => {
    const log = new Log('getWeb3.js', '#1c9e1c', false)
    log.info('ini')
    
    // Modern dapp browsers
    if (window.ethereum) {
      log.info('window.ethereum')
      const web3 = new Web3(window.ethereum);
      try {
        // Request account access if needed
        await window.ethereum.enable();
        // Accounts now exposed
        resolve(web3);
      } catch (error) {
        reject(error);
      }
    }
    // Legacy dapp browsers
    else if (window.web3) {
      log.info('window.web3')
      // Use Mist/MetaMask's provider.
      const web3 = window.web3;
      log.info("Injected web3 detected.");
      resolve(web3);
    }
    // Fallback to localhost; use dev console port by default
    else {
      log.info('Fallback to localhost')
      const provider = new Web3.providers.HttpProvider(
        "http://127.0.0.1:8545"
      );
      const web3 = new Web3(provider);
      log.info("No web3 instance injected, using Local web3.");
      resolve(web3);
    }

    // Listen for metamask accountsChanged event
    window.ethereum.on('accountsChanged', (accounts) => {
      log.info('accountsChanged', accounts)
      if (typeof(onAccountsChanged) === 'function') {
        onAccountsChanged(accounts)
      }
    })

    log.info('done')
});

export default getWeb3;
