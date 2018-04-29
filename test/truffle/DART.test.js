const assertRevert = require('../helpers/assertRevert');
const sendTransaction = require('../helpers/sendTransaction').sendTransaction;
const etherToWei = require('../helpers/etherToWei');

const advanceBlock = require('../helpers/advanceToBlock');
const increaseTimeTo = require('../helpers/increaseTime').increaseTimeTo;
const duration = require('../helpers/increaseTime').duration;
const latestTime = require('../helpers/latestTime');

const _ = require('lodash');

const BigNumber = web3.BigNumber;

const DART = artifacts.require('DART');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('DART', function (accounts) {
  const _dartOwner = accounts[0];

  const _buyerOne = accounts[1];
  const _buyerTwo = accounts[2];

  // TODO handle GENESIS block - token ZERO

  const _tokenIdOne = 1;
  const _tokenIdTwo = 2;
  const _tokenIdThree = 3;

  const _blockhashOne = "0x88e96d4537bea4d9c05d12549907b32561d3bf31f45aae734cdc119f13406cb6";
  const _blockhashTwo = "0xb495a1d7e6663152ae92708da4843337b958146015a2802f4193a410044698c9";
  const _blockhashThree = "0x3d6122660cc824376f11ee842f83addc3525e2dd6756b9bcf0affa6aa88cf741";

  const _nicknameOne = "jimmy";
  const _nicknameTwo = "jammy";
  const _nicknameThree = "jeremy";

  const unknownTokenId = 99;

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    this.token = await DART.new({from: _dartOwner});
  });

  describe('custom functions', function () {
    beforeEach(async function () {
      await this.token.mint(_blockhashOne, _tokenIdOne, _nicknameOne, {from: _dartOwner});
      await this.token.mint(_blockhashTwo, _tokenIdTwo, _nicknameTwo, {from: _dartOwner});
      await this.token.mint(_blockhashThree, _tokenIdThree, _nicknameThree, {from: _dartOwner});
    });

    it('totalContributionsInWei is blank at the start', async function () {
      const totalContributionsInWei = await this.token.totalContributionsInWei();
      totalContributionsInWei.should.be.bignumber.equal(0);
    });

    describe('checking token lookup methods', async function () {
      it('nicknameOf is set for initial token', async function () {
        const nickname = await this.token.nicknameOf(_tokenIdOne);
        nickname.should.be.equal(_nicknameOne);
      });

      it('blockhashOf is set for initial token', async function () {
        const blockhash = await this.token.blockhashOf(_tokenIdOne);
        blockhash.should.be.equal(_blockhashOne);
      });
    });

    describe('getNextBlockToFund()', async function () {
      it('return current block', async function () {
        const nextBlockToFund = await this.token.getNextBlockToFund();
        nextBlockToFund.should.be.bignumber.equal(web3.eth.blockNumber + 1);  // plus one as each call bumps to the next block
      });

      it('return next block when advanced', async function () {
        let nextBlock = web3.eth.blockNumber + 1;
        await advanceBlock(nextBlock);
        const nextBlockToFund = await this.token.getNextBlockToFund();
        nextBlockToFund.should.be.bignumber.equal(nextBlock + 1); // plus one as each call bumps to the next block
      });
    });

    describe('fundDart()', async function () {

      const fiveBlocksToPurchase = 5;
      const twoBlocksToPurchase = 2;

      let firstFundLogs = null;
      let secondFundLogs = null;

      beforeEach(async function () {
        const fiveBlocksInEther = etherToWei(0.01).times(fiveBlocksToPurchase);
        //fund the first token - 5 blocks
        ({logs: firstFundLogs} = await this.token.fundDart(_tokenIdOne, {value: fiveBlocksInEther, from: _dartOwner}));

        const twoBlocksInEther = etherToWei(0.01).times(twoBlocksToPurchase);

        // fund the second token - 2 blocks
        ({logs: secondFundLogs} = await this.token.fundDart(_tokenIdTwo, {value: twoBlocksInEther, from: _dartOwner}));
      });

      describe("reverts when", async function () {
        it('tokenId not valid', async function () {
          await assertRevert(this.token.fundDart(unknownTokenId));
        });
      });

      describe("valid token but nothing purchased", async function () {
        it('should determine NO blocks purchased by token three', async function () {
          let blocksPurchased = await this.token.blocksPurchasedByToken(_tokenIdThree);
          blocksPurchased.length.should.be.equal(0);
        });
      });

      describe('validating events and hashes', async function () {

        let fundedBlocks = null;
        let fundedBlockHashes = null;

        beforeEach(async function () {
          fundedBlocks = [];
          fundedBlockHashes = [];

          // Keep track of the blocks funded and hashes for test purposes
          firstFundLogs.forEach((log) => {
            if (log.event === 'FundDART') {
              let {_block, _blockhash} = log.args;
              fundedBlocks.push(_block);
              fundedBlockHashes.push(_blockhash);
            }
          });
        });

        // TODO how to test blocks added in correct sequence?

        it('should determine 6 events emitted', async function () {
          firstFundLogs.length.should.be.equal(6);
        });

        it('should determine 5 unique blocks purchased', async function () {
          _.uniq(fundedBlocks).length.should.be.equal(fiveBlocksToPurchase);
        });

        it('should determine 1 unique block hash with in the set', async function () {
          _.uniq(fundedBlockHashes).length.should.be.equal(1);
          fundedBlockHashes[0].should.be.equal(_blockhashOne);
        });

        it('should emit FundDART event for each block', async function () {
          let validateFundDARTEvent = (log, token) => {
            let {_funder, _tokenId, _block} = log.args;
            log.event.should.be.eq('FundDART');
            _funder.should.be.equal(_dartOwner);
            _tokenId.should.be.bignumber.equal(_tokenIdOne);
            // TODO how to validate event _block args?
          };

          validateFundDARTEvent(firstFundLogs[0]);
          validateFundDARTEvent(firstFundLogs[1]);
          validateFundDARTEvent(firstFundLogs[2]);
          validateFundDARTEvent(firstFundLogs[3]);
          validateFundDARTEvent(firstFundLogs[4]);
        });

        it('should emit BlocksPurchasedDART once completion', async function () {
          firstFundLogs[5].event.should.be.eq('BlocksPurchasedDART');
          firstFundLogs[5].args._funder.should.be.equal(_dartOwner);
          firstFundLogs[5].args._tokenId.should.be.bignumber.equal(_tokenIdOne);
          firstFundLogs[5].args._blocksPurchased.should.be.bignumber.equal(fiveBlocksToPurchase);
        });

        it('should determine token one owns all funded blocks', async function () {
          for (let i = 0; i < fundedBlocks.length; i++) {
            let tokenId = await this.token.blockOwnerOf(fundedBlocks[i]);
            tokenId.should.be.bignumber.equal(_tokenIdOne);
          }
        });

        it('should determine blocks found in the events are marked as purchased in the contract', async function () {
          for (let i = 0; i < fundedBlocks.length; i++) {
            let isBlockPurchased = await this.token.isBlockPurchased(fundedBlocks[i]);
            isBlockPurchased.should.be.equal(true);
          }
        });

        it('should blocks purchased by token marries up to the events emitted', async function () {
          let blocksPurchasedByToken = await this.token.blocksPurchasedByToken(_tokenIdOne);
          blocksPurchasedByToken.map(val => val.toString(10)).should.be.deep.equal(fundedBlocks.map(val => val.toString(10)));
        });

        it('should generate correct has for emitted events', async function () {
          for (let i = 0; i < fundedBlocks.length; i++) {
            let generateHash = await this.token.generateHash(fundedBlocks[i]);
            generateHash.should.be.equal(_blockhashOne);
          }
        });

        it('should determine following blocks are NOT purchased', async function () {
          // test the next 5 blocks on to check they are not purchased
          for (let i = fundedBlocks.length; i < fundedBlocks.length + 5; i++) {
            let isBlockPurchased = await this.token.isBlockPurchased(i);
            isBlockPurchased.should.be.equal(false);
          }
        });

        describe('stack multiple funded blocks in the future', async function () {

          let secondFundedBlocks = null;
          let secondFundedBlockHashes = null;

          beforeEach(async function () {
            secondFundedBlocks = [];
            secondFundedBlockHashes = [];

            // Keep track of the blocks funded and hashes for test purposes
            secondFundLogs.forEach((log) => {
              if (log.event === 'FundDART') {
                let {_block, _blockhash} = log.args;
                secondFundedBlocks.push(_block);
                secondFundedBlockHashes.push(_blockhash);
              }
            });
          });

          it('should determine 3 events emitted', async function () {
            secondFundLogs.length.should.be.equal(3);
          });

          it('should determine 2 unique blocks purchased', async function () {
            _.uniq(secondFundedBlocks).length.should.be.equal(twoBlocksToPurchase);
          });

          it('should determine 1 unique block hash with in the set', async function () {
            _.uniq(secondFundedBlockHashes).length.should.be.equal(1);
            secondFundedBlockHashes[0].should.be.equal(_blockhashTwo);
          });

          it('should emit FundDART event for each block', async function () {
            let validateFundDARTEvent = (log, token) => {
              let {_funder, _tokenId, _block} = log.args;
              log.event.should.be.eq('FundDART');
              _funder.should.be.equal(_dartOwner);
              _tokenId.should.be.bignumber.equal(_tokenIdTwo);
              // TODO how to validate event _block args?
            };

            validateFundDARTEvent(secondFundLogs[0]);
            validateFundDARTEvent(secondFundLogs[1]);
          });

          it('should emit BlocksPurchasedDART once completion', async function () {
            secondFundLogs[2].event.should.be.eq('BlocksPurchasedDART');
            secondFundLogs[2].args._funder.should.be.equal(_dartOwner);
            secondFundLogs[2].args._tokenId.should.be.bignumber.equal(_tokenIdTwo);
            secondFundLogs[2].args._blocksPurchased.should.be.bignumber.equal(twoBlocksToPurchase);
          });

          it('should determine token one owns all funded blocks', async function () {
            for (let i = 0; i < secondFundedBlocks.length; i++) {
              let tokenId = await this.token.blockOwnerOf(secondFundedBlocks[i]);
              tokenId.should.be.bignumber.equal(_tokenIdTwo);
            }
          });

          it('should determine blocks found in the events are marked as purchased in the contract', async function () {
            for (let i = 0; i < secondFundedBlocks.length; i++) {
              let isBlockPurchased = await this.token.isBlockPurchased(secondFundedBlocks[i]);
              isBlockPurchased.should.be.equal(true);
            }
          });

          it('should blocks purchased by token marries up to the events emitted', async function () {
            let blocksPurchasedByToken = await this.token.blocksPurchasedByToken(_tokenIdTwo);
            blocksPurchasedByToken.map(val => val.toString(10)).should.be.deep.equal(secondFundedBlocks.map(val => val.toString(10)));
          });

          it('should generate correct has for emitted events', async function () {
            for (let i = 0; i < secondFundedBlocks.length; i++) {
              let generateHash = await this.token.generateHash(secondFundedBlocks[i]);
              generateHash.should.be.equal(_blockhashTwo);
            }
          });

          it('should determine following blocks are NOT purchased', async function () {
            // test the next 5 blocks on to check they are not purchased
            for (let i = secondFundedBlocks.length; i < secondFundedBlocks.length + 5; i++) {
              let isBlockPurchased = await this.token.isBlockPurchased(i);
              isBlockPurchased.should.be.equal(false);
            }
          });
        });

        describe('ensuring that multiple funds dont by the same blocks', async function () {

          let allBlocks = null;
          let allBlockHashes = null;

          beforeEach(async function () {
            allBlocks = [];
            allBlockHashes = [];

            let populateCounters = (log) => {
              if (log.event === 'FundDART') {
                let {_block, _blockhash} = log.args;
                allBlocks.push(parseInt(_block));
                allBlockHashes.push(_blockhash);
              }
            };

            firstFundLogs.forEach(populateCounters);
            secondFundLogs.forEach(populateCounters);
          });

          it('should be 7 unique blocks', async function () {
            _.uniq(allBlocks).length.should.be.equal(fiveBlocksToPurchase + twoBlocksToPurchase);
          });

          it('should be 2 unique hashes', async function () {
            _.uniq(allBlockHashes).length.should.be.equal(2);
            _.uniq(allBlockHashes).should.be.deep.equal([_blockhashOne, _blockhashTwo]);
          });

          it('all blocks should be created in order', async function () {
            let inSequenceOrder = allBlocks.every((item, index) => {
              // handle checking last element
              if (!allBlocks[index + 1]) {
                return true;
              }
              // Check the next element in list are in sequence order
              return parseInt(item) + 1 === allBlocks[index + 1];
            });
            inSequenceOrder.should.be.equal(true);
          });
        });
      });

      // TODO how to test nextHash()

    });

  });

});
