import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions';
import * as mutations from './mutation-types';
import _ from 'lodash';
import Web3 from 'web3';
import createLogger from 'vuex/dist/logger';
import { getEtherscanAddress, getNetIdString } from '../utils';
import contract from 'truffle-contract';
import dARTJson from '../../build/contracts/DART.json';

const dart = contract(dARTJson);

Vue.use(Vuex);

const store = new Vuex.Store({
  plugins: [createLogger()],
  state: {
    // connectivity
    web3: null,
    account: null,
    accountBalance: null,
    currentNetwork: null,
    etherscanBase: null,
    assetsPurchasedByAccount: [],

    // contract metadata
    contractName: '',
    contractSymbol: '',
    contractAddress: '',

    // contract totals
    totalSupply: null,
    totalContributionsInWei: null,
    totalContributionsEther: null,

    // contract addresses
    curatorAddress: null,

    // non-contract data
    assets: [],
  },
  getters: {
    assetById: (state) => (tokenId) => {
      return _.find(state.assets, (asset) => asset.tokenId.toString() === tokenId.toString());
    },
    isDart: (state) => {
      if (state.curatorAddress) {
        return state.curatorAddress.toLowerCase() === state.account.toLowerCase();
      }
      return false;
    }
  },
  mutations: {
    [mutations.SET_ASSETS](state, {assets}) {
      Vue.set(state, 'assets', assets);
    },
    [mutations.SET_ASSETS_PURCHASED_FROM_ACCOUNT](state, tokens) {
      Vue.set(state, 'assetsPurchasedByAccount', tokens);
    },
    [mutations.SET_TOTAL_PURCHASED](state, {totalContributionsInWei, totalContributionsInEther}) {
      state.totalContributionsInWei = totalContributionsInWei;
      state.totalContributionsInEther = totalContributionsInEther;
    },
    [mutations.SET_CONTRACT_DETAILS](state, {name, symbol, totalSupply, curatorAddress, contractAddress}) {
      state.totalSupply = totalSupply;
      state.contractSymbol = symbol;
      state.contractName = name;
      state.curatorAddress = curatorAddress;
      state.contractAddress = contractAddress;
    },
    [mutations.SET_ACCOUNT](state, {account, accountBalance}) {
      state.account = account;
      state.accountBalance = accountBalance;

      store.dispatch(actions.GET_ASSETS_PURCHASED_FOR_ACCOUNT);
    },
    [mutations.SET_CURRENT_NETWORK](state, currentNetwork) {
      state.currentNetwork = currentNetwork;
    },
    [mutations.SET_ETHERSCAN_NETWORK](state, etherscanBase) {
      state.etherscanBase = etherscanBase;
    },
    [mutations.SET_WEB3](state, web3) {
      state.web3 = web3;
    },
  },
  actions: {
    [actions.GET_ASSETS_PURCHASED_FOR_ACCOUNT]({commit, dispatch, state}) {
      dart.deployed()
        .then((contract) => {
          return contract.tokensOf(state.account)
            .then((tokens) => {
              commit(mutations.SET_ASSETS_PURCHASED_FROM_ACCOUNT, tokens);
            });
        })
        .catch((e) => {
          console.error(e);
          // TODO handle errors
        });
    },
    [actions.GET_CURRENT_NETWORK]({commit, dispatch, state}) {
      getNetIdString()
        .then((currentNetwork) => {
          commit(mutations.SET_CURRENT_NETWORK, currentNetwork);
        });
      getEtherscanAddress()
        .then((etherscanBase) => {
          commit(mutations.SET_ETHERSCAN_NETWORK, etherscanBase);
        });
    },
    [actions.INIT_APP]({commit, dispatch, state}, web3) {

      // NON-ASYNC action - set web3 provider on init
      dart.setProvider(web3.currentProvider);

      //dirty hack for web3@1.0.0 support for localhost testrpc, see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
      if (typeof dart.currentProvider.sendAsync !== 'function') {
        dart.currentProvider.sendAsync = function () {
          return dart.currentProvider.send.apply(
            dart.currentProvider, arguments
          );
        };
      }

      // Set the web3 instance
      commit(mutations.SET_WEB3, web3);

      // Find current network
      dispatch(actions.GET_CURRENT_NETWORK);

      web3.eth.getAccounts()
        .then((accounts) => {

          let account = accounts[0];

          const setAccountAndBalance = (account) => {
            return web3.eth.getBalance(account)
              .then((balance) => {
                let accountBalance = Web3.utils.fromWei(balance);
                // store the account details
                commit(mutations.SET_ACCOUNT, {account, accountBalance});
              });
          };

          const refreshHandler = () => {
            web3.eth.getAccounts()
              .then((updatedAccounts) => {
                if (updatedAccounts[0] !== account) {
                  account = updatedAccounts[0];
                  return setAccountAndBalance(account);
                }
              });
          };

          // Every second check if the main account has changed
          setInterval(refreshHandler, 1000);

          // init the KODA contract
          dispatch(actions.REFRESH_CONTRACT_DETAILS);

          if (account) {
            return setAccountAndBalance(account);
          }
        })
        .catch(function (error) {
          console.log('ERROR - account locked', error);
          // TODO handle locked metamask account
        });
    },
    [actions.GET_ALL_ASSETS]({commit, dispatch, state}) {
      dart.deployed()
        .then((contract) => {
          let supply = _.range(0, state.totalSupply);

          const lookupInfo = (contract, index) => {
            return Promise.all([
              contract.nicknameOf(index),
              contract.tokenURI(index),
              contract.tokenHash(index),
              contract.ownerOf(index)
            ])
              .then((results) => {

                let nickname = results[0];
                let uri = results[1];
                let hash = results[2];
                let owner = results[3];

                // burnt
                if (owner === "0x0000000000000000000000000000000000000000") {
                  return null; // return nulls for for so we can strip them out at the nxt stage
                }

                return {
                  tokenId: index,
                  handle: nickname,
                  uri: uri,
                  hash: hash,
                  owner: owner
                };
              });
          };

          const bindAssetsToStore = (assets) => {
            commit(mutations.SET_ASSETS, {
              assets: assets
            });
          };

          return Promise.all(_.map(supply, (index) => lookupInfo(contract, index)))
            .then((assets) => {
              // Strip out burnt tokens which will appear as nulls in the list
              return _.without(assets, null);
            })
            .then(bindAssetsToStore);
        });
    },
    [actions.REFRESH_CONTRACT_DETAILS]({commit, dispatch, state}) {
      dart.deployed()
        .then((contract) => {

          Promise.all([contract.name(), contract.symbol(), contract.totalSupply(), contract.owner(), contract.address])
            .then((results) => {
              commit(mutations.SET_CONTRACT_DETAILS, {
                name: results[0],
                symbol: results[1],
                totalSupply: results[2].toString(),
                curatorAddress: results[3],
                contractAddress: results[4]
              });

              // We require totalSupply to lookup all ASSETS
              dispatch(actions.GET_ALL_ASSETS);
            });

          Promise.all([contract.totalContributionsInWei()])
            .then((results) => {
              commit(mutations.SET_TOTAL_PURCHASED, {
                totalContributionsInEther: Web3.utils.fromWei(results[0].toString(10), 'ether'),
                totalContributionsInWei: results[0].toString(10)
              });
            });
        }).catch((error) => console.log('Something went bang!', error));
    }
  }
});

export default store;
