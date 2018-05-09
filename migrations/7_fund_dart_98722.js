const DART = artifacts.require('DART');

const HDWalletProvider = require('truffle-hdwallet-provider');
const infuraApikey = 'nbCbdzC6IG9CF6hmvAVQ';
let mnemonic = require('../mnemonic');

module.exports = async function (deployer, network, accounts) {

  console.log(`Funding a token on DART contract to ${network}...`);

  let _curatorAccount = accounts[0];

  if (network === 'ropsten' || network === 'rinkeby') {
    _curatorAccount = new HDWalletProvider(mnemonic, `https://${network}.infura.io/${infuraApikey}`, 0).getAddress();

  }

  if (network === 'live') {
    let mnemonicLive = require('../mnemonic_live');
    _curatorAccount = new HDWalletProvider(mnemonicLive, `https://mainnet.infura.io/${infuraApikey}`, 0).getAddress();
  }

  console.log(`_curatorAccount = ${_curatorAccount}`);

  let instance = await DART.deployed();

  if (network === 'ganache' || network === 'ropsten' || network === 'rinkeby' || network === 'live') {
    await instance.fundDart(98722, {value: web3.toWei(0.1, 'ether')}); // FUND 10 BLOCKS
  }
};
