const assertRevert = require('../helpers/assertRevert');
const sendTransaction = require('../helpers/sendTransaction').sendTransaction;
const etherToWei = require('../helpers/etherToWei');

const advanceBlock = require('../helpers/advanceToBlock');
const increaseTimeTo = require('../helpers/increaseTime').increaseTimeTo;
const duration = require('../helpers/increaseTime').duration;
const latestTime = require('../helpers/latestTime');

const _ = require('lodash');

const BigNumber = web3.BigNumber;

const InterfaceToken = artifacts.require('InterfaceToken');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('InterfaceToken', function (accounts) {
  const _owner = accounts[0];

  const _buyerOne = accounts[1];
  const _buyerTwo = accounts[2];

  const _tokenIdOne = 1;
  const _tokenIdTwo = 2;
  const _tokenIdThree = 3;
  const _tokenIdFour = 4;

  const _blockhashOne = '0x88e96d4537bea4d9c05d12549907b32561d3bf31f45aae734cdc119f13406cb6';
  const _blockhashTwo = '0xb495a1d7e6663152ae92708da4843337b958146015a2802f4193a410044698c9';
  const _blockhashThree = '0x3d6122660cc824376f11ee842f83addc3525e2dd6756b9bcf0affa6aa88cf741';
  const _blockhashFour = '0xc790287e584193fb6cb1871c0da0fa5ba216145ce0c098d3979ac232309881bd';

  const _nicknameOne = 'jimmy';
  const _nicknameTwo = 'jammy';
  const _nicknameThree = 'jeremy';
  const _nicknameFour = 'janey';

  const unknownTokenId = 99;

  const defaultUri = 'Qma4QoWXq7YzFUkREXW9wKVYPZmKzS5pkckaSjwY8Gc489';

  const ZERO_ADDRESS = '0x000000000000000000000000000000000000000000000000000000000000000';

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    this.token = await InterfaceToken.new({from: _owner});
  });

  describe('custom functions', function () {
    beforeEach(async function () {
      await this.token.mint(_blockhashOne, _tokenIdOne, _nicknameOne, {from: _owner});
      await this.token.mint(_blockhashTwo, _tokenIdTwo, _nicknameTwo, {from: _owner});
    });

    describe('mint', async function () {
      beforeEach(async function () {
        await this.token.mintTransfer(_blockhashThree, _tokenIdThree, _nicknameThree, _buyerOne, {from: _owner});
      });

      it('should set the owner to be the recipient', async function () {
        const owner = await this.token.ownerOf(_tokenIdThree);
        owner.should.be.equal(_buyerOne);
      });

      it('should revert if not under the Purchase Token Pointer', async function () {
        const pointer = await this.token.purchaseTokenPointer();
        await assertRevert(this.token.mintTransfer(_blockhashFour, pointer, _nicknameThree, _buyerOne, {from: _owner}));
      });

      it('should revert if not whitelisted', async function () {
        await assertRevert(this.token.mintTransfer(_blockhashFour, _tokenIdFour, _nicknameFour, _buyerOne, {from: _buyerOne}));
      });

      it('should whitelist and have ability to mint', async function () {
        await this.token.addAddressToWhitelist(_buyerOne, {from: _owner});
        await this.token.mintTransfer(_blockhashFour, _tokenIdFour, _nicknameFour, _buyerOne, {from: _buyerOne});
      });
    });

    describe('checking token lookup methods', async function () {
      it('nicknameOf is set for initial token', async function () {
        const nickname = await this.token.nicknameOf(_tokenIdOne);
        web3.toAscii(nickname).replace(/\u0000/g, '').should.be.equal(_nicknameOne);
      });

      it('blockhashOf is set for initial token', async function () {
        const blockhash = await this.token.blockhashOf(_tokenIdOne);
        blockhash.should.be.equal(_blockhashOne);
      });

      it('tokenIdOf is set for initial token', async function () {
        const blockhash = await this.token.blockhashOf(_tokenIdOne);
        const tokenId = await this.token.tokenIdOf(blockhash);
        tokenId.toNumber().should.be.equal(_tokenIdOne);
      });
    });

    describe('ensure token URI is set to default', async function () {

      it('should be default URI', async function () {
        const tokenUri = await this.token.tokenURI(_tokenIdOne);
        tokenUri.should.be.equal(`https://ipfs.infura.io/ipfs/${defaultUri}`);
      });
    });

    describe('only whitelisted can set cost of token', async function () {

      it('should allow owner', async function () {
        await this.token.setCostOfToken(1, {from: _owner});
        const costOfToken = await this.token.costOfToken();
        costOfToken.toString(10).should.be.equal("1");
      });
    });

    describe('buying tokens', async function () {

      let costOfToken;

      beforeEach(async function () {
        // cost is 0.01 eth
        costOfToken = await this.token.costOfToken();
      });

      describe('buy a single token direct', async function () {
        it('should be give random hash and incremented token ID', async function () {
          const pointer = await this.token.purchaseTokenPointer();

          // 0.01 eth
          await this.token.buyToken('andy gray', {from: _buyerOne, value: costOfToken});
          const tokenId = await this.token.tokenOfOwnerByIndex(_buyerOne, 0);
          pointer.toString(10).should.be.equal(tokenId.toString(10));
        });
      });

      describe('buy a multiple tokens direct', async function () {
        it('should mint x tokens in relation to value sent', async function () {
          const pointer = await this.token.purchaseTokenPointer();

          // 0.04 eth
          await this.token.buyTokens('andy gray', {from: _buyerOne, value: costOfToken.times(4)});
          const tokenIds = await this.token.tokensOf(_buyerOne);

          // bought 4
          tokenIds.length.should.be.equal(4);

          const newPointer = await this.token.purchaseTokenPointer();
          pointer.plus(4).toString(10).should.be.equal(newPointer.toString(10));
        });

        it('should mint x tokens in relation to value sent direct to contract', async function () {
          const pointer = await this.token.purchaseTokenPointer();

          // 0.04 eth
          await this.token.sendTransaction({from: _buyerOne, value: costOfToken.times(4)});
          const tokenIds = await this.token.tokensOf(_buyerOne);

          // bought 4
          tokenIds.length.should.be.equal(4);

          const newPointer = await this.token.purchaseTokenPointer();
          pointer.plus(4).toString(10).should.be.equal(newPointer.toString(10));
        });
      });
    });

    describe('burn', function () {

      let originalNick = '';
      let originalBlockhash = '';
      let originalTokenId = '';

      beforeEach(async function () {
        originalNick = await this.token.nicknameOf(_tokenIdOne);
        originalBlockhash = await this.token.blockhashOf(_tokenIdOne);
        originalTokenId = await this.token.tokenIdOf(originalBlockhash);

        await this.token.burn(_tokenIdOne, {from: _owner});
      });

      it('removes InterfaceToken data', async function () {
        const nickname = await this.token.nicknameOf(_tokenIdOne);
        web3.toAscii(nickname).replace(/\u0000/g, '').should.be.equal('');

        const bh = await this.token.blockhashOf(_tokenIdOne);
        web3.toAscii(bh).replace(/\u0000/g, '').should.be.equal('');

        const id = await this.token.tokenIdOf(originalBlockhash);
        id.toString(10).should.be.equal('0');
      });

      it('reverts if not owner', async function () {
        await assertRevert(this.token.burn(_tokenIdTwo, {from: _buyerOne}));
      });
    });
  });

});
