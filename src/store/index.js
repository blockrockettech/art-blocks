import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions';
import * as mutations from './mutation-types';
import _ from 'lodash';
import Web3 from 'web3';
import axios from 'axios';
import createLogger from 'vuex/dist/logger';
import { getEtherscanAddress, getNetIdString } from '../utils';
import contract from 'truffle-contract';
import dARTJson from '../../build/contracts/DART.json';

const dART = contract(dARTJson);

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
      return _.find(state.assets, (asset) => asset.id.toString() === tokenId.toString());
    },
    isDART: (state) => {
      if (state.curatorAddress) {
        return state.curatorAddress.toLowerCase() === state.account.toLowerCase();
      }
      return false;
    },
    getTransactionForAsset: (state, getters) => (assetId) => {
      return getters.assetPurchaseState(assetId).transaction;
    },
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
    [mutations.SET_CONTRACT_DETAILS](state, {name, symbol, totalSupply}) {
      state.totalSupply = totalSupply;
      state.contractSymbol = symbol;
      state.contractName = name;
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
      dART.deployed()
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
      dART.setProvider(web3.currentProvider);

      //dirty hack for web3@1.0.0 support for localhost testrpc, see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
      if (typeof dART.currentProvider.sendAsync !== "function") {
        dART.currentProvider.sendAsync = function () {
          return dART.currentProvider.send.apply(
            dART.currentProvider, arguments
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

      const lookupIPFSData = (tokenUri) => {

        // Load root IPFS data
        return axios.get(`${tokenUri}`)
          .then((tokenMeta) => {

            let rootMeta = tokenMeta.data;

            // Load additional meta about asset from IPFS
            return axios.get(`${rootMeta.meta}`)
              .then((otherMeta) => {
                return {
                  tokenUri: tokenUri,
                  name: rootMeta.name,
                  description: rootMeta.description,
                  otherMeta: otherMeta.data,
                  lowResImg: rootMeta.image
                };
              });
          });
      };

      const mapAssetType = (rawType) => {
        switch (rawType) {
          case 'DIG':
            return 'digital';
          case 'PHY':
            return 'physical';
          default:
            return rawType;
        }
      };

      const lookupAssetInfo = (contract, index) => {
        return Promise.all([
          contract.assetInfo(index),
          contract.editionInfo(index)
        ])
          .then((results) => {
            let assetInfo = results[0];
            let editionInfo = results[1];

            const rawEdition = editionInfo[1];
            const owner = assetInfo[1];

            // Handle burnt tokens by checking edition and owner are both blank
            if (rawEdition === "0x00000000000000000000000000000000" && owner === "0x0000000000000000000000000000000000000000") {
              return null; // return nulls for for so we can strip them out at the nxt stage
            }

            // should always be 16 chars long
            const edition = Web3.utils.toAscii(rawEdition);

            const tokenUri = editionInfo[3];

            // Populate all data - minus tokenURI data
            return {
              id: assetInfo[0].toNumber(),
              owner: owner.toString(),
              purchased: assetInfo[2].toNumber(),
              priceInWei: assetInfo[3].toString(),
              priceInEther: Web3.utils.fromWei(assetInfo[3].toString(), 'ether').valueOf(),
              auctionStartDate: assetInfo[4].toString(10),

              edition: edition,
              // Last 3 chars of edition are type
              type: mapAssetType(edition.substring(13, 16)),
              // First 3 chars of edition are artist code
              artistCode: edition.substring(0, 3),
              editionNumber: editionInfo[2].toNumber(),
              tokenUri: tokenUri
            };
          });
      };

      dART.deployed()
        .then((contract) => {
          let supply = _.range(0, state.totalSupply);

          /**
           * Functions takes a list of assets and loads all the metadata associated with them, preventing duplicate tokenUris
           */
          const populateTokenUriData = (assets) => {

            // find unique tokenUri's as editions will share the same metadata
            let uniqueTokenUri = _.map(_.uniqBy(assets, 'tokenUri'), 'tokenUri');

            // Look up each unique tokenUri
            let tokenUriLookups = _.map(uniqueTokenUri, (tokenUri) => lookupIPFSData(tokenUri));


            return Promise.all(tokenUriLookups).then((results) => {

              // flatten out the array of loading IPFS data into a map keyed by {tokenUri:data}
              let dataByTokenUri = _.keyBy(results, 'tokenUri');

              // find and set metadata onto each asset
              return _.map(assets, (asset) => {

                // grab data by tokenUri
                let ipfsMeta = dataByTokenUri[asset.tokenUri];

                // set IPFS lookup back on object
                _.set(asset, 'artworkName', ipfsMeta.name);
                _.set(asset, 'description', ipfsMeta.description);
                _.set(asset, 'lowResImg', ipfsMeta.lowResImg);
                _.set(asset, 'otherMeta', ipfsMeta.otherMeta);

                return asset;
              });
            });
          };

          /**
           * Functions takes a set of assets, maps to various models and set on the store
           */
          const bindAssetsToStore = (assets) => {

            let assetsByEditions = _.groupBy(assets, 'edition');
            let assetsByArtistCode = _.groupBy(assets, 'artistCode');

            // flatten out the editions so we can easily work with them on the gallery page
            let editionSummary = _.map(assetsByEditions, function (assets, editionKey) {

              let editionSummary = {
                edition: editionKey,
                totalSupply: assets.length,
                totalPurchased: assets.filter((asset) => asset.purchased === 1 || asset.purchased === 2).length
              };

              // Add the first asset to the flat list
              _.extend(editionSummary, assets[0]);

              // chop the ID to ensure its not an asset
              delete editionSummary.id;
              delete editionSummary.purchased;

              return editionSummary;
            });

            commit(mutations.SET_ASSETS, {
              assets: assets,
              assetsByEditions: assetsByEditions,
              assetsByArtistCode: assetsByArtistCode,
              editionSummary: editionSummary,
            });
          };

          return Promise.all(_.map(supply, (index) => lookupAssetInfo(contract, index)))
            .then((assets) => {
              // Strip out burnt tokens which will appear as nulls in the list
              return _.without(assets, null);
            })
            .then(populateTokenUriData)
            .then(bindAssetsToStore);
        });
    },
    [actions.REFRESH_CONTRACT_DETAILS]({commit, dispatch, state}) {
      dART.deployed()
        .then((contract) => {

          // Promise.all([contract.curatorAccount(), contract.address])
          //   .then((results) => {
          //     commit(mutations.SET_COMMISSION_ADDRESSES, {
          //       curatorAddress: results[0],
          //       contractDeveloperAddress: results[1],
          //       contractAddress: results[2]
          //     });
          //   });

          Promise.all([contract.name(), contract.symbol(), contract.totalSupply()])
            .then((results) => {
              commit(mutations.SET_CONTRACT_DETAILS, {
                name: results[0],
                symbol: results[1],
                totalSupply: results[2].toString()
              });

              // We require totalSupply to lookup all ASSETS
              // dispatch(actions.GET_ALL_ASSETS);
            });

          Promise.all([contract.totalContributionsInWei()])
            .then((results) => {
              commit(mutations.SET_TOTAL_PURCHASED, {
                totalContributionsInEther: Web3.utils.fromWei(results[0].toString(10), 'ether'),
                totalContributionsInWei: results[0].toString(10)
              });
            });
        }).catch((error) => console.log("Something went bang!", error));
    }
  }
});

export default store;
