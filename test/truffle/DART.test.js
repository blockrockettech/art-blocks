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
const ERC721Receiver = artifacts.require('ERC721ReceiverMock');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('DART', function (accounts) {
  const _dartOwner = accounts[0];

  const _buyerOne = accounts[1];
  const _buyerTwo = accounts[2];

  const _tokenIdOne = 0;
  const _tokenIdTwo = 1;
  const _tokenIdThree = 2;

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

  describe.only('custom functions', function () {
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

    describe.only('fundDart()', async function () {

      const blocksToPurchase = 5;

      let logs = null;
      let preFundBlockNumber = null;
      let postFundLastPurchasedBlock = null;

      beforeEach(async function () {
        const fiveBlocksInEther = etherToWei(0.01).times(blocksToPurchase);
        preFundBlockNumber = await this.token.blockNumber();

        //fund the first token
        ({logs} = await this.token.fundDart(_tokenIdOne, {value: fiveBlocksInEther, from: _dartOwner}));

        // Get a handle on the last purchased block so we can validate moving the counter on
        postFundLastPurchasedBlock = await this.token.lastPurchasedBlock();
      });

      describe("reverts when", async function () {
        it('tokenId not valid', async function () {
          await assertRevert(this.token.fundDart(unknownTokenId));
        });
      });

      it('last purchased counter is moved on x blocks', async function () {
        const fundedBlocks = preFundBlockNumber.add(blocksToPurchase);
        postFundLastPurchasedBlock.should.be.bignumber.equal(fundedBlocks);
      });

      it('should emit FundDART event for each block', async function () {
        logs.length.should.be.equal(6);

        let validateFundDARTEvent = (log) => {
          // Bump starting block on one to validate the range is from block + n
          preFundBlockNumber = preFundBlockNumber.add(1);

          let {_funder, _tokenId, _nextBlock} = log.args;
          log.event.should.be.eq('FundDART');
          _funder.should.be.equal(_dartOwner);
          _tokenId.should.be.bignumber.equal(_tokenIdOne);
          _nextBlock.should.be.bignumber.equal(preFundBlockNumber);
        };

        validateFundDARTEvent(logs[0]);
        validateFundDARTEvent(logs[1]);
        validateFundDARTEvent(logs[2]);
        validateFundDARTEvent(logs[3]);
        validateFundDARTEvent(logs[4]);
      });

      it('should emit BlocksPurchasedDART once completion', async function () {
        logs.length.should.be.equal(6);

        // validate BlocksPurchasedDART
        logs[5].event.should.be.eq('BlocksPurchasedDART');
        logs[5].args._funder.should.be.equal(_dartOwner);
        logs[5].args._tokenId.should.be.bignumber.equal(_tokenIdOne);
        logs[5].args._blocksPurchased.should.be.bignumber.equal(blocksToPurchase);
      });

      it('should get nextHash()', async function () {
        console.log(_blockhashOne);
        console.log(_blockhashTwo);
        console.log(_blockhashThree);

        let blocknumber = await this.token.blockNumber();
        console.log(blocknumber);
        console.log(Object.keys(blocknumber));

        let lastblock = await this.token.lastPurchasedBlock();
        console.log(lastblock);

        while (blocknumber.lessThanOrEqualTo(lastblock)) {
          let nextHash = await this.token.nextHash();

          let nextBlock = web3.eth.blockNumber + 1;
          console.log(`
          token id = [${_tokenIdOne.toString(10)}] 
          nextHash = [${nextHash.toString(10)}] 
          nextBlock = [${nextBlock.toString(10)}]`
          );

          await advanceBlock(nextBlock);
          blocknumber = blocknumber.add(1);

        }


      });

      describe('stack multiple funded blocks in the future', async function () {
        const twoBlocksToPurchase = 2;

        let logs = null;
        let secondPostPurchasedBlock = null;

        beforeEach(async function () {
          const twoBlocksInEther = etherToWei(0.01).times(twoBlocksToPurchase);

          // fund the second token - two blocks
          ({logs} = await this.token.fundDart(_tokenIdTwo, {value: twoBlocksInEther, from: _dartOwner}));

          secondPostPurchasedBlock = await this.token.lastPurchasedBlock();
        });

        it('last purchased counter is moved on x blocks', async function () {
          // start at the last funded block and check it moves on two
          const fundedBlocks = postFundLastPurchasedBlock.add(twoBlocksToPurchase);
          secondPostPurchasedBlock.should.be.bignumber.equal(fundedBlocks);
        });

        it('should emit FundDART event for each block', async function () {
          logs.length.should.be.equal(3);

          let validateFundDARTEvent = (log) => {

            // Bump starting block on one to validate the range is from block + n
            postFundLastPurchasedBlock = postFundLastPurchasedBlock.add(1);

            let {_funder, _tokenId, _nextBlock} = log.args;
            log.event.should.be.eq('FundDART');
            _funder.should.be.equal(_dartOwner);
            _tokenId.should.be.bignumber.equal(_tokenIdTwo);
            // Each call bumps the next block on
            _nextBlock.should.be.bignumber.equal(postFundLastPurchasedBlock);
          };

          validateFundDARTEvent(logs[0]);
          validateFundDARTEvent(logs[1]);
        });

        it('should emit BlocksPurchasedDART once completion', async function () {
          logs[2].event.should.be.eq('BlocksPurchasedDART');
          logs[2].args._funder.should.be.equal(_dartOwner);
          logs[2].args._tokenId.should.be.bignumber.equal(_tokenIdTwo);
          logs[2].args._blocksPurchased.should.be.bignumber.equal(twoBlocksToPurchase);
        });
      });

    });

  });

});
