const DART = artifacts.require('DART');

const HDWalletProvider = require('truffle-hdwallet-provider');
const infuraApikey = 'nbCbdzC6IG9CF6hmvAVQ';
let mnemonic = require('../mnemonic');

module.exports = function (deployer, network, accounts) {

  console.log(`Deploying DART contract to ${network}...`);

  let _curatorAccount = accounts[0];

  if (network === 'ropsten' || network === 'rinkeby') {
    _curatorAccount = new HDWalletProvider(mnemonic, `https://${network}.infura.io/${infuraApikey}`, 0).getAddress();

  }

  if (network === 'live') {
    let mnemonic_live = require('../mnemonic_live');
    _curatorAccount = new HDWalletProvider(mnemonic_live, `https://mainnet.infura.io/${infuraApikey}`, 0).getAddress();
  }

  console.log(`_curatorAccount = ${_curatorAccount}`);

  deployer.deploy(DART);
};
