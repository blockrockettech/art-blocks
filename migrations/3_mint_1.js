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
      return instance.mint("0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3", 123, "TEST MINT 001");
    });
};
