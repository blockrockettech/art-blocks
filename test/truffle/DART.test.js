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

  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  const RECEIVER_MAGIC_VALUE = '0xf0b9e5ba';

  const _halfOfOneEther = etherToWei(0.5);

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
    });

    describe('fundDart()', async function () {

      beforeEach(async function () {
        // Mint a second token
        await this.token.mint(_blockhashTwo, _tokenIdTwo, _nicknameTwo, {from: _dartOwner});
      });

    });

  });

});
