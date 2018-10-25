const assertRevert = require('../helpers/assertRevert');
const etherToWei = require('../helpers/etherToWei');

const advanceBlock = require('../helpers/advanceToBlock');

const _ = require('lodash');

const BigNumber = web3.BigNumber;

const InterfaceToken = artifacts.require('InterfaceToken');
const SimpleArtistContract = artifacts.require('SimpleArtistContractV2');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('SimpleArtistContract - V2', function (accounts) {
  const _dartOwner = accounts[0];

  const _artist = accounts[1];

  const _buyer1 = accounts[2];

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

  const minBlockPurchaseInOneGo = 2;
  const maxBlockPurchaseInOneGo = 20;

  const maxInvocations = 100;
  const checksum = "";
  const preventDoublePurchases = false;
  const fixedContract = false;

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    this.token = await InterfaceToken.new({from: _dartOwner});
    this.simpleArtistContract = await SimpleArtistContract.new(
      this.token.address,
      etherToWei(0.01),
      minBlockPurchaseInOneGo,
      maxBlockPurchaseInOneGo,
      _artist,
      maxInvocations,
      checksum,
      preventDoublePurchases,
      fixedContract,
      {
        from: _artist
      }
    );
  });

  describe('purchase functions', function () {
    beforeEach(async function () {
      await this.token.mint(_blockhashOne, _tokenIdOne, _nicknameOne, {from: _dartOwner});
      await this.token.mint(_blockhashTwo, _tokenIdTwo, _nicknameTwo, {from: _dartOwner});
      await this.token.mint(_blockhashThree, _tokenIdThree, _nicknameThree, {from: _dartOwner});
    });

    describe('will return nextPurchasableBlocknumber()', async function () {
      it('return current block', async function () {
        const nextBlocknumber = await this.simpleArtistContract.nextPurchasableBlocknumber();
        nextBlocknumber.should.be.bignumber.equal(web3.eth.blockNumber + 1);  // plus one as each call bumps to the next block
      });

      it('return next block when advanced', async function () {
        let nextBlock = web3.eth.blockNumber + 1;
        await advanceBlock(nextBlock);
        const nextBlocknumber = await this.simpleArtistContract.nextPurchasableBlocknumber();
        nextBlocknumber.should.be.bignumber.equal(nextBlock + 1); // plus one as each call bumps to the next block
      });
    });

    describe('will purchase()', async function () {

      const fiveBlocksToPurchase = 5;
      const twoBlocksToPurchase = 2;

      let firstFundLogs = null;
      let secondFundLogs = null;

      beforeEach(async function () {
        const fiveBlocksInEther = etherToWei(0.01).times(fiveBlocksToPurchase);

        //fund the first token - 5 blocks
        ({logs: firstFundLogs} = await this.simpleArtistContract.purchase(_tokenIdOne, {
          value: fiveBlocksInEther,
          from: _dartOwner
        }));

        const twoBlocksInEther = etherToWei(0.01).times(twoBlocksToPurchase);

        // fund the second token - 2 blocks
        ({logs: secondFundLogs} = await this.simpleArtistContract.purchase(_tokenIdTwo, {
          value: twoBlocksInEther,
          from: _dartOwner
        }));
      });

      it('token invocations is updated', async function () {
        const tokenInvocations = await this.simpleArtistContract.getTokenInvocations();
        tokenInvocations
          .map(e => e.toString())
          .should.be.deep
          .equal([_tokenIdOne.toString(), _tokenIdTwo.toString()]);
      });

      it('total invocations count is updated', async function () {
        const totalInvocations = await this.simpleArtistContract.totalInvocations();
        totalInvocations.should.be.bignumber.equal(2);
      });

      describe("reverts when", async function () {
        it('tokenId not valid', async function () {
          await assertRevert(this.simpleArtistContract.purchase(unknownTokenId));
        });
      });

      describe("valid token but nothing purchased", async function () {
        it('should determine NO blocks purchased by token three', async function () {
          let blocknumbersPurchased = await this.simpleArtistContract.blocknumbersOf(_tokenIdThree);
          blocknumbersPurchased.length.should.be.equal(0);
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
            if (log.event === 'PurchaseBlock') {
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
          let validatePurchaseEvent = (log, token) => {
            let {_funder, _tokenId, _block} = log.args;
            log.event.should.be.eq('PurchaseBlock');
            _funder.should.be.equal(_dartOwner);
            _tokenId.should.be.bignumber.equal(_tokenIdOne);
            // TODO how to validate event _block args?
          };

          validatePurchaseEvent(firstFundLogs[0]);
          validatePurchaseEvent(firstFundLogs[1]);
          validatePurchaseEvent(firstFundLogs[2]);
          validatePurchaseEvent(firstFundLogs[3]);
          validatePurchaseEvent(firstFundLogs[4]);
        });

        it('should emit Purchased once completion', async function () {
          firstFundLogs[5].event.should.be.eq('Purchased');
          firstFundLogs[5].args._funder.should.be.equal(_dartOwner);
          firstFundLogs[5].args._tokenId.should.be.bignumber.equal(_tokenIdOne);
          firstFundLogs[5].args._blocksPurchased.should.be.bignumber.equal(fiveBlocksToPurchase);
        });

        it('should determine token one owns all funded blocks', async function () {
          for (let i = 0; i < fundedBlocks.length; i++) {
            let tokenIdOwner = await this.simpleArtistContract.tokenIdOf(fundedBlocks[i]);
            tokenIdOwner.should.be.bignumber.equal(_tokenIdOne);
          }
        });

        it('should blocks purchased by token marries up to the events emitted', async function () {
          let blocknumbersOfTokenId = await this.simpleArtistContract.blocknumbersOf(_tokenIdOne);
          blocknumbersOfTokenId.map(val => val.toString(10)).should.be.deep.equal(fundedBlocks.map(val => val.toString(10)));
        });

        it('should generate correct has for emitted events', async function () {
          for (let i = 0; i < fundedBlocks.length; i++) {
            let purchasedBlockhash = await this.simpleArtistContract.getPurchasedBlockhash(fundedBlocks[i]);
            purchasedBlockhash.should.be.equal(_blockhashOne);
          }
        });

        it('should determine following blocks are NOT purchased', async function () {
          // test the next 5 blocks on to check they are not purchased
          for (let i = fundedBlocks.length; i < fundedBlocks.length + 5; i++) {
            let isBlockPurchased = await this.simpleArtistContract.tokenIdOf(i);
            isBlockPurchased.should.be.bignumber.equal(0);
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
              if (log.event === 'PurchaseBlock') {
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

          it('should emit PurchaseBlock event for each block', async function () {
            let validatePurchaseEvent = (log, token) => {
              let {_funder, _tokenId, _block} = log.args;
              log.event.should.be.eq('PurchaseBlock');
              _funder.should.be.equal(_dartOwner);
              _tokenId.should.be.bignumber.equal(_tokenIdTwo);
              // TODO how to validate event _block args?
            };

            validatePurchaseEvent(secondFundLogs[0]);
            validatePurchaseEvent(secondFundLogs[1]);
          });

          it('should emit Purchased once completion', async function () {
            secondFundLogs[2].event.should.be.eq('Purchased');
            secondFundLogs[2].args._funder.should.be.equal(_dartOwner);
            secondFundLogs[2].args._tokenId.should.be.bignumber.equal(_tokenIdTwo);
            secondFundLogs[2].args._blocksPurchased.should.be.bignumber.equal(twoBlocksToPurchase);
          });

          it('should determine token one owns all funded blocks', async function () {
            for (let i = 0; i < secondFundedBlocks.length; i++) {
              let tokenId = await this.simpleArtistContract.tokenIdOf(secondFundedBlocks[i]);
              tokenId.should.be.bignumber.equal(_tokenIdTwo);
            }
          });

          it('should blocks purchased by token marries up to the events emitted', async function () {
            let blocksPurchasedByToken = await this.simpleArtistContract.blocknumbersOf(_tokenIdTwo);
            blocksPurchasedByToken.map(val => val.toString(10)).should.be.deep.equal(secondFundedBlocks.map(val => val.toString(10)));
          });

          it('should generate correct has for emitted events', async function () {
            for (let i = 0; i < secondFundedBlocks.length; i++) {
              let purchasedBlockhash = await this.simpleArtistContract.getPurchasedBlockhash(secondFundedBlocks[i]);
              purchasedBlockhash.should.be.equal(_blockhashTwo);
            }
          });

          it('should determine following blocks are NOT purchased', async function () {
            // test the next 5 blocks on to check they are not purchased
            for (let i = secondFundedBlocks.length; i < secondFundedBlocks.length + 5; i++) {
              let isBlockPurchased = await this.simpleArtistContract.tokenIdOf(i);
              isBlockPurchased.should.be.bignumber.equal(0);
            }
          });
        });

        describe('ensuring that multiple funds dont buy the same blocks', async function () {

          let allBlocks = null;
          let allBlockHashes = null;

          beforeEach(async function () {
            allBlocks = [];
            allBlockHashes = [];

            let populateCounters = (log) => {
              if (log.event === 'PurchaseBlock') {
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

  describe('when restricting number of invocations of the art node', async function () {

    beforeEach(async function () {
      await this.token.mint(_blockhashOne, _tokenIdOne, _nicknameOne, {from: _dartOwner});
    });

    it('fails when not artist', async function () {
      await assertRevert(this.simpleArtistContract.setMaxInvocations(1, {from: _dartOwner}));
    });

    it('fails when setting zero', async function () {
      await assertRevert(this.simpleArtistContract.setMaxInvocations(0, {from: _artist}));
    });

    describe('set by the artist', async function () {

      beforeEach(async function () {
        await this.simpleArtistContract.setMaxInvocations(1, {from: _artist});
      });

      it('value is updated', async function () {
        const maxInvocations = await this.simpleArtistContract.maxInvocations();
        maxInvocations.should.be.bignumber.equal(1);
      });

      describe('when a big is placed', async function () {

        const fiveBlocksToPurchase = 5;
        const fiveBlocksInEther = etherToWei(0.01).times(fiveBlocksToPurchase);

        beforeEach(async function () {
          await this.simpleArtistContract.purchase(_tokenIdOne, {
            value: fiveBlocksInEther,
            from: _buyer1
          });
        });

        it('should update invocations', async function () {
          const totalInvocations = await this.simpleArtistContract.totalInvocations();
          totalInvocations.should.be.bignumber.equal(1);
        });

        it('should now exceed max invocations', async function () {
          const exceedsMaxInvocations = await this.simpleArtistContract.exceedsMaxInvocations();
          exceedsMaxInvocations.should.be.equal(true);
        });

        it('should prevent another purchase', async function () {
          await assertRevert(this.simpleArtistContract.purchase(_tokenIdOne, {
            value: fiveBlocksInEther,
            from: _buyer1
          }));
        });
      });
    });
  });

  describe('can set application checksum', async function () {

    it('is blank by default', async function () {
      const applicationChecksum = await this.simpleArtistContract.applicationChecksum();
      applicationChecksum.should.be.equal("0x0000000000000000000000000000000000000000000000000000000000000000");
    });

    it('can be set by artist', async function () {
      await this.simpleArtistContract.setApplicationChecksum("file-checksum", {from: _artist});
      const applicationChecksum = await this.simpleArtistContract.applicationChecksum();
      web3.toAscii(applicationChecksum).replace(/\0/g, '').should.be.equal("file-checksum");
    });

    it('fails when not set by artist', async function () {
      await assertRevert(this.simpleArtistContract.setApplicationChecksum("file-checksum", {from: _buyer1}));
      const applicationChecksum = await this.simpleArtistContract.applicationChecksum();
      applicationChecksum.should.be.equal("0x0000000000000000000000000000000000000000000000000000000000000000");
    });
  });

  describe('when preventing double purchases', async function () {
    const fiveBlocksToPurchase = 5;
    const fiveBlocksInEther = etherToWei(0.01).times(fiveBlocksToPurchase);

    beforeEach(async function () {
      await this.token.mint(_blockhashOne, _tokenIdOne, _nicknameOne, {from: _dartOwner});
      await this.token.mint(_blockhashTwo, _tokenIdTwo, _nicknameTwo, {from: _dartOwner});
    });

    beforeEach(async function () {
      await this.simpleArtistContract.purchase(_tokenIdOne, {
        value: fiveBlocksInEther,
        from: _buyer1
      });
    });

    it('should default to disabled', async function () {
      const preventDoublePurchases = await this.simpleArtistContract.preventDoublePurchases();
      preventDoublePurchases.should.be.equal(false);
    });

    it('can toggle flag enabled/disabled', async function () {
      await this.simpleArtistContract.togglePreventDoublePurchases({from: _artist});

      let preventDoublePurchases = await this.simpleArtistContract.preventDoublePurchases();
      preventDoublePurchases.should.be.equal(true);

      await this.simpleArtistContract.togglePreventDoublePurchases({from: _artist});

      preventDoublePurchases = await this.simpleArtistContract.preventDoublePurchases();
      preventDoublePurchases.should.be.equal(false);
    });

    it('fails when not the artist', async function () {
      await assertRevert(this.simpleArtistContract.togglePreventDoublePurchases({from: _buyer1}));
    });

    describe('when disabled', async function () {
      beforeEach(async function () {
        await this.simpleArtistContract.togglePreventDoublePurchases({from: _artist});
        const preventDoublePurchases = await this.simpleArtistContract.preventDoublePurchases();
        preventDoublePurchases.should.be.equal(true);
      });

      it('when disabled, prevents double purchases of the same token', async function () {

        // Reverts for token 1
        await assertRevert(this.simpleArtistContract.purchase(_tokenIdOne, {
          value: fiveBlocksInEther,
          from: _buyer1
        }));

        // Token 2 still able to purchase
        await this.simpleArtistContract.purchase(_tokenIdTwo, {
          value: fiveBlocksInEther,
          from: _buyer1
        });

        const totalInvocations = await this.simpleArtistContract.totalInvocations();
        totalInvocations.should.be.bignumber.equal(2);
      });

    });

    describe('when the contract is built as a fixed contact', async function () {

      const maxInvocations = 1;
      const fixedContract = true;
      const checksum = "my-fixed-checksum";

      beforeEach(async function () {
        this.simpleArtistContract = await SimpleArtistContract.new(
          this.token.address,
          etherToWei(0.01),
          minBlockPurchaseInOneGo,
          maxBlockPurchaseInOneGo,
          _artist,
          maxInvocations,
          checksum,
          preventDoublePurchases,
          fixedContract,
          {
            from: _artist
          }
        );
      });

      it('values are set correctly', async function () {
        const fixedContractValue = await this.simpleArtistContract.fixedContract();
        fixedContractValue.should.be.equal(true);

        const maxInvocationsValue = await this.simpleArtistContract.maxInvocations();
        maxInvocationsValue.should.be.bignumber.equal(1);

        const applicationChecksum = await this.simpleArtistContract.applicationChecksum();
        web3.toAscii(applicationChecksum).replace(/\0/g, '').should.be.equal(checksum);
      });

      it('value is updated', async function () {
        const maxInvocations = await this.simpleArtistContract.maxInvocations();
        maxInvocations.should.be.bignumber.equal(1);
      });

      it('unable to set max invocations once contract is fixed', async function () {
        await assertRevert(this.simpleArtistContract.setMaxInvocations(10, {from: _artist}));
      });

      it('unable to change checksum once contract is fixed', async function () {
        await assertRevert(this.simpleArtistContract.setApplicationChecksum("new-checksum", {from: _artist}));
      });

    });

  });

});
