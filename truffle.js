const HDWalletProvider = require('truffle-hdwallet-provider');
const infuraApikey = 'nbCbdzC6IG9CF6hmvAVQ';
let mnemonic = require('./mnemonic');

// Check gas prices before live deploy - https://ethgasstation.info/

module.exports = {
  mocha: {
    useColors: true
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200,
    }
  },
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*' // Match any network id
    },
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    testrpc: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*'
    },
    live: {
      provider: function () {
        let mnemonic_live = require('./mnemonic_live');
        return new HDWalletProvider(mnemonic_live, `https://mainnet.infura.io/${infuraApikey}`);
      },
      network_id: 1,
      gas: 4075039, // default = 4712388
      gasPrice: 2000000000 // default = 100 gwei = 100000000000
    },
    coverage: {
      host: "localhost",
      network_id: "*",
      port: 8555,         // <-- If you change this, also set the port option in .solcover.js.
      gas: 0xfffffffffff, // <-- Use this high gas value
      gasPrice: 0x01      // <-- Use this low gas price
    },
    ropsten: {
      provider: function () {
        return new HDWalletProvider(mnemonic, `https://ropsten.infura.io/${infuraApikey}`);
      },
      network_id: 3,
      gas: 4075039, // default = 4712388
      gasPrice: 25000000000 // default = 100 gwei = 100000000000
    },
    rinkeby: {
      provider: function () {
        return new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/${infuraApikey}`);
      },
      network_id: 4,
      gas: 7000000, // default = 4712388
      gasPrice: 21000000000 // default = 100 gwei = 100000000000
    }
  }
};
