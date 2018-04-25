

<h1 align="center">ARTBLOCKS</h1>
<div align="center">
  Art.
</div>

<br />

<div align="center">
  <a href="https://www.ethereum.org/" target="_blank"><img src="https://img.shields.io/badge/platform-Ethereum-brightgreen.svg?style=flat-square" alt="Ethereum" /></a>
  <a href="http://erc721.org/" target="_blank"><img src="https://img.shields.io/badge/token-ERC721-ff69b4.svg?style=flat-square" alt="Token ERC721" /> </a>
  <img src="https://img.shields.io/badge/contributions-welcome-orange.svg?style=flat-square" alt="Contributions Welcome" />
  <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="MIT License" />
</div>

<div align="center">
  <sub>Built by <a href="http://blockrocket.tech" target="_blank">BlockRocket</a></sub>
</div>

# About


# Authors

Originally created by [BlockRocket](http://blockrocket.tech)


# Features

* **Full ERC-721 Compatibility** - Smart Contract is fully ERC-721 compliant
* **Full ERC-721 Metadata Compatibility** - Each ERC-721 token uses latest standards for ERC-721 metadata
* **Full ERC-165 Compatibility** - Smart Contract is fully ERC-165 compliant
* **IPFS Support** - Internally IPFS is used for storing asset files and metadata


## Installation
1. Install [Node](https://nodejs.org/en/) v8.x or above

2. Install [Ganache](http://truffleframework.com/ganache/).

3. Install [Truffle](http://truffleframework.com).
	```
	npm install -g truffle
	```
4. Install [Metamask](https://metamask.io/) in chrome so you can test purchasing assets

5. Install node modules for project
  ```
  npm install
  ```
6. When running locally you will need to link your *Metamask* account and your locally running Ganache.
  * In Metamask - ensure you are logged out.
  * In Metamask - `Restore from seed phrase` and place the 12 word seed from the Ganache in to Metamask
     * This will link the accounts inside Ganache with Metamask & give you 100 ETH to test with
  * In Metamask - add a custom network of `http://127.0.0.1:7545` - this is Ganache
     * This will point Metamask at your locally running Ganache blockchain

7. Compile and migrate the contracts to your local blockchain (default is *ganache*).
	```
	./clean_deploy_local.sh
	```
	* This will compile the contracts and place the ABI files into `/build/` as well as deploying to Ganache

8. Run the webpack server for front-end hot reloading. Smart contract changes do not support hot reloading for now.
	```
	npm run start
	```
  **It should now work!**

## Build for production
To build the application for production, use the build command. A production build will be compiled in the `dist` folder.
```javascript
npm run build
```

#### History

* Original project based on https://github.com/wespr/truffle-vue
* Base contracts based on https://github.com/OpenZeppelin/zeppelin-solidity

# License

[MIT](https://opensource.org/licenses/MIT)
