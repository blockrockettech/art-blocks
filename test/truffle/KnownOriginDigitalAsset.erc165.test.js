const advanceBlock = require('../helpers/advanceToBlock');
const increaseTimeTo = require('../helpers/increaseTime').increaseTimeTo;
const duration = require('../helpers/increaseTime').duration;
const latestTime = require('../helpers/latestTime');

const BigNumber = web3.BigNumber;

const KnownOriginDigitalAsset = artifacts.require('KnownOriginDigitalAsset');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('KnownOriginDigitalAsset', function (accounts) {
  const _developmentAccount = accounts[0];
  const _curatorAccount = accounts[1];

  let _purchaseFromTime;

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    // developers will mine the contract and pass the curator account into it...
    this.token = await KnownOriginDigitalAsset.new(_curatorAccount, {from: _developmentAccount});
    _purchaseFromTime = latestTime(); // opens immediately

    await increaseTimeTo(_purchaseFromTime + duration.seconds(1)); // force time to move 1 seconds so normal tests pass

    // set base commission rates
    await this.token.updateCommission('DIG', 12, 12, {from: _developmentAccount});
    await this.token.updateCommission('PHY', 24, 15, {from: _developmentAccount});
  });

  describe('ERC165 supportsInterface()', async function () {

    describe('supports ERC165', async function () {
      it('matches correct bytes', async function () {
        let supportsERC165 = await this.token.supportsInterface('0x01ffc9a7');
        supportsERC165.should.be.equal.true;
      });
    });

    describe('supports ERC721Enumerable', async function () {
      it('matches correct bytes', async function () {
        let supportsERC721Enumerable = await this.token.supportsInterface('0x780e9d63');
        supportsERC721Enumerable.should.be.equal.true;
      });
      it('supports totalSupply()', async function () {
        let support = await this.token.supportsInterface('0x18160ddd');
        support.should.be.equal.true;
      });
      it('supports tokenOfOwnerByIndex()', async function () {
        let support = await this.token.supportsInterface('0x2f745c59');
        support.should.be.equal.true;
      });
      it('supports tokenByIndex()', async function () {
        let support = await this.token.supportsInterface('0x4f6ccce7');
        support.should.be.equal.true;
      });
    });

    describe('supports ERC721Metadata', async function () {
      it('matches correct bytes', async function () {
        let supportsERC721Metadata = await this.token.supportsInterface('0x5b5e139f');
        supportsERC721Metadata.should.be.equal.true;
      });
      it('supports symbol()', async function () {
        let support = await this.token.supportsInterface('0x06fdde03');
        support.should.be.equal.true;
      });
      it('supports totalSupply()', async function () {
        let support = await this.token.supportsInterface('0x95d89b41');
        support.should.be.equal.true;
      });
      it('supports tokenURI()', async function () {
        let support = await this.token.supportsInterface('0xc87b56dd');
        support.should.be.equal.true;
      });
    });

    describe('supports ERC721', async function () {
      it('matches correct bytes', async function () {
        let supportsERC721 = await this.token.supportsInterface('0xcff9d6b4');
        supportsERC721.should.be.equal.true;
      });
      it('supports balanceOf()', async function () {
        let support = await this.token.supportsInterface('0x70a08231');
        support.should.be.equal.true;
      });
      it('supports ownerOf()', async function () {
        let support = await this.token.supportsInterface('0x6352211e');
        support.should.be.equal.true;
      });
      it('supports approve()', async function () {
        let support = await this.token.supportsInterface('0x095ea7b3');
        support.should.be.equal.true;
      });
      it('supports getApproved()', async function () {
        let support = await this.token.supportsInterface('0x081812fc');
        support.should.be.equal.true;
      });
      it('supports setApprovalForAll()', async function () {
        let support = await this.token.supportsInterface('0xa22cb465');
        support.should.be.equal.true;
      });
      it('supports isApprovedForAll()', async function () {
        let support = await this.token.supportsInterface('0xe985e9c5');
        support.should.be.equal.true;
      });
      it('supports transferFrom()', async function () {
        let support = await this.token.supportsInterface('0x23b872dd');
        support.should.be.equal.true;
      });
      it('supports safeTransferFrom()', async function () {
        let support = await this.token.supportsInterface('0x42842e0e');
        support.should.be.equal.true;
      });
      it('supports safeTransferFrom() overloaded with bytes', async function () {
        let support = await this.token.supportsInterface('0xb88d4fde');
        support.should.be.equal.true;
      });
    });

    describe('supports ERC721 optional', async function () {
      it('supports exists()', async function () {
        let support = await this.token.supportsInterface('0x4f558e79');
        support.should.be.equal.true;
      });
    });

    describe('doesnt support missing feature', async function () {
      it('fails to match something which doesnt exist', async function () {
        let supportsERC165 = await this.token.supportsInterface('someOtherValue');
        supportsERC165.should.be.equal.false;
      });
    });
  });

});
