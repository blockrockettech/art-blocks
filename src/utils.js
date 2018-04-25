const getNetIdString = () => {
  return window.web3.eth.net.getId()
    .then((id) => {

      console.log(`Running on network ID ${id}`);

      switch (id) {
        case 1:
          return 'Main';
        case 3:
          return 'Ropsten';
        case 4:
          return 'Rinkeby';
        case 42:
          return 'Kovan';
        case 'loading':
          return 'loading..';
        // Will be some random number when connected locally
        default:
          return 'Local';
      }
    });
};

const getEtherscanAddress = () => {
  return window.web3.eth.net.getId()
    .then((id) => {
      switch (id) {
        case 1:
          return 'http://etherscan.io';
        case 3:
          return 'http://ropsten.etherscan.io';
        case 4:
          return 'http://rinkeby.etherscan.io';
        case 42:
          return 'http://kovan.etherscan.io';
        default:
          return '';
      }
    })
    .then((etherScanAddress) => {
      console.log(`Setting etherscan address as ${etherScanAddress}`);
      return etherScanAddress;
    });
};

export {
  getNetIdString,
  getEtherscanAddress,
};
