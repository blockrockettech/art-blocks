const DART = artifacts.require('DART');

const HDWalletProvider = require('truffle-hdwallet-provider');
const infuraApikey = 'nbCbdzC6IG9CF6hmvAVQ';
let mnemonic = require('../mnemonic');

module.exports = function (deployer, network, accounts) {

  console.log(`Minting a test token on DART contract to ${network}...`);

  let _curatorAccount = accounts[0];

  if (network === 'ropsten' || network === 'rinkeby') {
    _curatorAccount = new HDWalletProvider(mnemonic, `https://${network}.infura.io/${infuraApikey}`, 0).getAddress();

  }

  if (network === 'live') {
    let mnemonicLive = require('../mnemonic_live');
    _curatorAccount = new HDWalletProvider(mnemonicLive, `https://mainnet.infura.io/${infuraApikey}`, 0).getAddress();
  }

  console.log(`_curatorAccount = ${_curatorAccount}`);

  deployer
    .then(() => DART.deployed())
    .then((instance) => {
      if (network === 'ganache' || network === 'ropsten' || network === 'rinkeby' || network === 'live') {
        return instance.mint("0x255f9565aad18cc5ff0103e1cf91c5c789c90a6af06d7ebfc692d0a93ddb00b5", 98722, "Minty");
      }
    });
};
