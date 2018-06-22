const DART = artifacts.require('DART');
const SimpleArtistContract = artifacts.require('SimpleArtistContract');

const HDWalletProvider = require('truffle-hdwallet-provider');
const infuraApikey = 'nbCbdzC6IG9CF6hmvAVQ';
let mnemonic = require('../mnemonic');

module.exports = function (deployer, network, accounts) {

  console.log(`Deploying DART contract to ${network}...`);

  let _curatorAccount = accounts[0];
  let _artist = accounts[1];

  if (network === 'ropsten' || network === 'rinkeby') {
    _curatorAccount = new HDWalletProvider(mnemonic, `https://${network}.infura.io/${infuraApikey}`, 0).getAddress();
    _artist = new HDWalletProvider(mnemonic, `https://${network}.infura.io/${infuraApikey}`, 1).getAddress();
  }

  if (network === 'live') {
    let mnemonicLive = require('../mnemonic_live');
    _curatorAccount = new HDWalletProvider(mnemonicLive, `https://mainnet.infura.io/${infuraApikey}`, 0).getAddress();
    _artist = new HDWalletProvider(mnemonicLive, `https://mainnet.infura.io/${infuraApikey}`, 1).getAddress();
  }

  console.log(`_curatorAccount = ${_curatorAccount}`);
  console.log(`_artist = ${_artist}`);

  deployer.deploy(DART)
    .then(function () {
      return deployer.deploy(SimpleArtistContract, DART.address, "10000000000000000", 20, 0xe1023C112A39c58238929153F25364c11A33B729);
    });
};
