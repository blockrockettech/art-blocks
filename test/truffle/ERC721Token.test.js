const assertRevert = require('../helpers/assertRevert');
const sendTransaction = require('../helpers/sendTransaction').sendTransaction;

const advanceBlock = require('../helpers/advanceToBlock');

const _ = require('lodash');

const BigNumber = web3.BigNumber;
const InterfaceToken = artifacts.require('InterfaceToken');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('ERC721Token', function (accounts) {
  const _owner = accounts[0];

  const name = 'Interface Token';
  const symbol = 'TOKN';

  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  const RECEIVER_MAGIC_VALUE = '0x150b7a02';

  const _tokenIdOne = 1;
  const _tokenIdTwo = 2;
  const _tokenIdThree = 3;
  const _tokenIdFour = 4;

  const _blockhashOne = '0x88e96d4537bea4d9c05d12549907b32561d3bf31f45aae734cdc119f13406cb6';
  const _blockhashTwo = '0xb495a1d7e6663152ae92708da4843337b958146015a2802f4193a410044698c9';
  const _blockhashThree = '0x3d6122660cc824376f11ee842f83addc3525e2dd6756b9bcf0affa6aa88cf741';
  const _blockhashFour = '0x73e5dac1f53ba85e6ce8e1c411560cdbbc4efb9a8e26606e8d0225f14281b64c';

  const _nicknameOne = 'jimmy';
  const _nicknameTwo = 'jammy';
  const _nicknameThree = 'jeremy';
  const _nicknameFour = 'jane';

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    this.token = await InterfaceToken.new({from: _owner});
  });

  describe('like a full ERC721', function () {
    beforeEach(async function () {
      await this.token.mint(_blockhashOne, _tokenIdOne, _nicknameOne, {from: _owner});
      await this.token.mint(_blockhashTwo, _tokenIdTwo, _nicknameTwo, {from: _owner});
    });

    describe('mint', function () {
      const to = accounts[1];
      const tokenId = _tokenIdThree;

      beforeEach(async function () {
        await this.token.mintTransfer(_blockhashThree, _tokenIdThree, _nicknameThree, to, {from: _owner});
      });

      it('adjusts owner tokens by index', async function () {
        const token = await this.token.tokenOfOwnerByIndex(to, 0);
        token.toNumber().should.be.equal(tokenId);
      });

      it('adjusts all tokens list', async function () {
        const newToken = await this.token.tokenByIndex(2);
        newToken.toNumber().should.be.equal(tokenId);
      });
    });

    describe('burn', function () {
      const tokenId = _tokenIdOne;
      const sender = _owner;

      beforeEach(async function () {
        await this.token.burn(tokenId, {from: sender});
      });

      it('removes that token from the token list of the owner', async function () {
        const token = await this.token.tokenOfOwnerByIndex(sender, 0);
        token.toNumber().should.be.equal(_tokenIdTwo);
      });

      it('adjusts all tokens list', async function () {
        const token = await this.token.tokenByIndex(0);
        token.toNumber().should.be.equal(_tokenIdTwo);
      });

      it('burns all tokens', async function () {
        await this.token.burn(_tokenIdTwo, {from: sender});
        const total = await this.token.totalSupply();
        total.toNumber().should.be.equal(0);
        await assertRevert(this.token.tokenByIndex(0));
      });
    });

    describe('metadata', function () {
      const sampleUri = 'mock://mytoken';

      it('has a name', async function () {
        const tokenName = await this.token.name();
        tokenName.should.be.equal(name);
      });

      it('has a symbol', async function () {
        const tokenSymbol = await this.token.symbol();
        tokenSymbol.should.be.equal(symbol);
      });

      it('returns metadata for a token id', async function () {
        const uri = await this.token.tokenURI(_tokenIdOne);
        uri.should.be.equal('https://ipfs.infura.io/ipfs/' + 'Qma4QoWXq7YzFUkREXW9wKVYPZmKzS5pkckaSjwY8Gc489');
      });

      it('can burn token with metadata', async function () {
        await this.token.burn(_tokenIdOne);
        const exists = await this.token.exists(_tokenIdOne);
        exists.should.be.false;
      });

      it('when querying metadata for non existant token id return default IPFS URI', async function () {
        const uri = await this.token.tokenURI(500);
        uri.should.be.equal('https://ipfs.infura.io/ipfs/' + 'Qma4QoWXq7YzFUkREXW9wKVYPZmKzS5pkckaSjwY8Gc489');
      });
    });

    describe('totalSupply', function () {
      it('returns total token supply', async function () {
        const totalSupply = await this.token.totalSupply();
        totalSupply.should.be.bignumber.equal(2);
      });
    });

    describe('tokenOfOwnerByIndex', function () {
      const owner = _owner;
      const another = accounts[1];

      describe('when the given index is lower than the amount of tokens owned by the given address', function () {
        it('returns the token ID placed at the given index', async function () {
          const tokenId = await this.token.tokenOfOwnerByIndex(owner, 0);
          tokenId.should.be.bignumber.equal(_tokenIdOne);
        });
      });

      describe('when the index is greater than or equal to the total tokens owned by the given address', function () {
        it('reverts', async function () {
          await assertRevert(this.token.tokenOfOwnerByIndex(owner, 2));
        });
      });

      describe('when the given address does not own any token', function () {
        it('reverts', async function () {
          await assertRevert(this.token.tokenOfOwnerByIndex(another, 0));
        });
      });

      describe('after transferring all tokens to another user', function () {
        beforeEach(async function () {
          await this.token.transferFrom(owner, another, _tokenIdOne, {from: owner});
          await this.token.transferFrom(owner, another, _tokenIdTwo, {from: owner});
        });

        it('returns correct token IDs for target', async function () {
          const count = await this.token.balanceOf(another);
          count.toNumber().should.be.equal(2);
          const tokensListed = await Promise.all(_.range(2).map(i => this.token.tokenOfOwnerByIndex(another, i)));
          tokensListed.map(t => t.toNumber()).should.have.members([_tokenIdOne, _tokenIdTwo]);
        });

        it('returns empty collection for original owner', async function () {
          const count = await this.token.balanceOf(owner);
          count.toNumber().should.be.equal(0);
          await assertRevert(this.token.tokenOfOwnerByIndex(owner, 0));
        });
      });
    });

    describe('tokenByIndex', function () {
      it('should return all tokens', async function () {
        const tokensListed = await Promise.all(_.range(2).map(i => this.token.tokenByIndex(i)));
        tokensListed.map(t => t.toNumber()).should.have.members([_tokenIdOne, _tokenIdTwo]);
      });

      it('should revert if index is greater than supply', async function () {
        await assertRevert(this.token.tokenByIndex(2));
      });

      [_tokenIdOne, _tokenIdTwo].forEach(function (tokenId) {
        it(`should return all tokens after burning token ${tokenId} and minting new tokens`, async function () {
          const owner = accounts[0];

          await this.token.burn(tokenId, {from: owner});
          await this.token.mint(_blockhashThree, _tokenIdThree, _nicknameThree, {from: _owner});
          await this.token.mint(_blockhashFour, _tokenIdFour, _nicknameFour, {from: _owner});

          const count = await this.token.totalSupply();
          count.toNumber().should.be.equal(3);

          const tokensListed = await Promise.all(_.range(3).map(i => this.token.tokenByIndex(i)));
          const expectedTokens = _.filter(
            [_tokenIdOne, _tokenIdTwo, _tokenIdThree, _tokenIdFour],
            x => (x !== tokenId)
          );
          tokensListed.map(t => t.toNumber()).should.have.members(expectedTokens);
        });
      });
    });
  });

  describe('like an ERC721BasicToken', function () {
    beforeEach(async function () {
      await this.token.mint(_blockhashOne, _tokenIdOne, _nicknameOne, {from: _owner});
      await this.token.mint(_blockhashTwo, _tokenIdTwo, _nicknameTwo, {from: _owner});
    });

    describe('balanceOf', function () {
      context('when the given address owns some tokens', function () {
        it('returns the amount of tokens owned by the given address', async function () {
          const balance = await this.token.balanceOf(_owner);
          balance.should.be.bignumber.equal(2);
        });
      });

      context('when the given address does not own any tokens', function () {
        it('returns 0', async function () {
          const balance = await this.token.balanceOf(accounts[1]);
          balance.should.be.bignumber.equal(0);
        });
      });

      context('when querying the zero address', function () {
        it('throws', async function () {
          await assertRevert(this.token.balanceOf(0));
        });
      });
    });

    describe('exists', function () {
      context('when the token exists', function () {
        const tokenId = _tokenIdOne;

        it('should return true', async function () {
          const result = await this.token.exists(tokenId);
          result.should.be.true;
        });
      });

      context('when the token does not exist', function () {
        const tokenId = '999';

        it('should return false', async function () {
          const result = await this.token.exists(tokenId);
          result.should.be.false;
        });
      });
    });

    describe('ownerOf', function () {
      context('when the given token ID was tracked by this token', function () {
        const tokenId = _tokenIdOne;

        it('returns the owner of the given token ID', async function () {
          const owner = await this.token.ownerOf(tokenId);
          owner.should.be.equal(_owner);
        });
      });

      context('when the given token ID was not tracked by this token', function () {
        const tokenId = '999';

        it('reverts', async function () {
          await assertRevert(this.token.ownerOf(tokenId));
        });
      });
    });

    describe('transfers', function () {
      const owner = accounts[0];
      const approved = accounts[2];
      const operator = accounts[3];
      const unauthorized = accounts[4];
      const tokenId = _tokenIdOne;
      const data = '0x42';

      let logs = null;

      beforeEach(async function () {
        this.to = accounts[1];
        await this.token.approve(approved, tokenId, {from: owner});
        await this.token.setApprovalForAll(operator, true, {from: owner});
      });

      const transferWasSuccessful = function ({owner, tokenId, approved}) {
        it('transfers the ownership of the given token ID to the given address', async function () {
          const newOwner = await this.token.ownerOf(tokenId);
          newOwner.should.be.equal(this.to);
        });

        it('clears the approval for the token ID', async function () {
          const approvedAccount = await this.token.getApproved(tokenId);
          approvedAccount.should.be.equal(ZERO_ADDRESS);
        });

        if (approved) {
          it('emit only a transfer event', async function () {
            logs.length.should.be.equal(1);
            logs[0].event.should.be.eq('Transfer');
            logs[0].args._from.should.be.equal(owner);
            logs[0].args._to.should.be.equal(this.to);
            logs[0].args._tokenId.should.be.bignumber.equal(tokenId);
          });
        } else {
          it('emits only a transfer event', async function () {
            logs.length.should.be.equal(1);
            logs[0].event.should.be.eq('Transfer');
            logs[0].args._from.should.be.equal(owner);
            logs[0].args._to.should.be.equal(this.to);
            logs[0].args._tokenId.should.be.bignumber.equal(tokenId);
          });
        }

        it('adjusts owners balances', async function () {
          const newOwnerBalance = await this.token.balanceOf(this.to);
          newOwnerBalance.should.be.bignumber.equal(1);

          const previousOwnerBalance = await this.token.balanceOf(owner);
          previousOwnerBalance.should.be.bignumber.equal(1);
        });

        it('adjusts owners tokens by index', async function () {
          if (!this.token.tokenOfOwnerByIndex) return;

          const newOwnerToken = await this.token.tokenOfOwnerByIndex(this.to, 0);
          newOwnerToken.toNumber().should.be.equal(tokenId);

          const previousOwnerToken = await this.token.tokenOfOwnerByIndex(owner, 0);
          previousOwnerToken.toNumber().should.not.be.equal(tokenId);
        });
      };

      const shouldTransferTokensByUsers = function (transferFunction) {
        context('when called by the owner', function () {
          beforeEach(async function () {
            ({logs} = await transferFunction.call(this, owner, this.to, tokenId, {from: owner}));
          });
          transferWasSuccessful({owner, tokenId, approved});
        });

        context('when called by the approved individual', function () {
          beforeEach(async function () {
            ({logs} = await transferFunction.call(this, owner, this.to, tokenId, {from: approved}));
          });
          transferWasSuccessful({owner, tokenId, approved});
        });

        context('when called by the operator', function () {
          beforeEach(async function () {
            ({logs} = await transferFunction.call(this, owner, this.to, tokenId, {from: operator}));
          });
          transferWasSuccessful({owner, tokenId, approved});
        });

        context('when called by the owner without an approved user', function () {
          beforeEach(async function () {
            await this.token.approve(ZERO_ADDRESS, tokenId, {from: owner});
            ({logs} = await transferFunction.call(this, owner, this.to, tokenId, {from: operator}));
          });
          transferWasSuccessful({owner, tokenId, approved: null});
        });

        context('when sent to the owner', function () {
          beforeEach(async function () {
            ({logs} = await transferFunction.call(this, owner, owner, tokenId, {from: owner}));
          });

          it('keeps ownership of the token', async function () {
            const newOwner = await this.token.ownerOf(tokenId);
            newOwner.should.be.equal(owner);
          });

          it('clears the approval for the token ID', async function () {
            const approvedAccount = await this.token.getApproved(tokenId);
            approvedAccount.should.be.equal(ZERO_ADDRESS);
          });

          it('emits only a transfer event', async function () {
            logs.length.should.be.equal(1);
            logs[0].event.should.be.eq('Transfer');
            logs[0].args._from.should.be.equal(owner);
            logs[0].args._to.should.be.equal(owner);
            logs[0].args._tokenId.should.be.bignumber.equal(tokenId);
          });

          it('keeps the owner balance', async function () {
            const ownerBalance = await this.token.balanceOf(owner);
            ownerBalance.should.be.bignumber.equal(2);
          });

          it('keeps same tokens by index', async function () {
            if (!this.token.tokenOfOwnerByIndex) return;
            const tokensListed = await Promise.all(_.range(2).map(i => this.token.tokenOfOwnerByIndex(owner, i)));
            tokensListed.map(t => t.toNumber()).should.have.members([_tokenIdOne, _tokenIdTwo]);
          });
        });

        context('when the address of the previous owner is incorrect', function () {
          it('reverts', async function () {
            await assertRevert(transferFunction.call(this, unauthorized, this.to, tokenId, {from: owner}));
          });
        });

        context('when the sender is not authorized for the token id', function () {
          it('reverts', async function () {
            await assertRevert(transferFunction.call(this, owner, this.to, tokenId, {from: unauthorized}));
          });
        });

        context('when the given token ID does not exist', function () {
          it('reverts', async function () {
            await assertRevert(transferFunction.call(this, owner, this.to, '999', {from: owner}));
          });
        });

        context('when the address to transfer the token to is the zero address', function () {
          it('reverts', async function () {
            await assertRevert(transferFunction.call(this, owner, ZERO_ADDRESS, tokenId, {from: owner}));
          });
        });
      };

      describe('via transferFrom', function () {
        shouldTransferTokensByUsers(function (from, to, tokenId, opts) {
          return this.token.transferFrom(from, to, tokenId, opts);
        });
      });

      describe('via safeTransferFrom', function () {
        const safeTransferFromWithData = function (from, to, tokenId, opts) {
          return sendTransaction(
            this.token,
            'safeTransferFrom',
            'address,address,uint256,bytes',
            [from, to, tokenId, data],
            opts
          );
        };

        const safeTransferFromWithoutData = function (from, to, tokenId, opts) {
          return this.token.safeTransferFrom(from, to, tokenId, opts);
        };

        const shouldTransferSafely = function (transferFun, data) {
          describe('to a user account', function () {
            shouldTransferTokensByUsers(transferFun);
          });
        };

        describe('with data', function () {
          shouldTransferSafely(safeTransferFromWithData, data);
        });

        describe('without data', function () {
          shouldTransferSafely(safeTransferFromWithoutData, '0x');
        });

        // describe('to a receiver contract returning unexpected value', function () {
        //   it('reverts', async function () {
        //     const invalidReceiver = await ERC721Receiver.new('0x42', false);
        //     await assertRevert(this.token.safeTransferFrom(owner, invalidReceiver.address, tokenId, {from: owner}));
        //   });
        // });
        //
        // describe('to a receiver contract that throws', function () {
        //   it('reverts', async function () {
        //     const invalidReceiver = await ERC721Receiver.new(RECEIVER_MAGIC_VALUE, true);
        //     await assertRevert(this.token.safeTransferFrom(owner, invalidReceiver.address, tokenId, {from: owner}));
        //   });
        // });

        describe('to a contract that does not implement the required function', function () {
          it('reverts', async function () {
            const invalidReceiver = this.token;
            await assertRevert(this.token.safeTransferFrom(owner, invalidReceiver.address, tokenId, {from: owner}));
          });
        });
      });
    });

    describe('approve', function () {
      const tokenId = _tokenIdOne;
      const sender = _owner;
      const to = accounts[1];

      let logs = null;

      const itClearsApproval = function () {
        it('clears approval for the token', async function () {
          const approvedAccount = await this.token.getApproved(tokenId);
          approvedAccount.should.be.equal(ZERO_ADDRESS);
        });
      };

      const itApproves = function (address) {
        it('sets the approval for the target address', async function () {
          const approvedAccount = await this.token.getApproved(tokenId);
          approvedAccount.should.be.equal(address);
        });
      };

      const itEmitsApprovalEvent = function (address) {
        it('emits an approval event', async function () {
          logs.length.should.be.equal(1);
          logs[0].event.should.be.eq('Approval');
          logs[0].args._owner.should.be.equal(sender);
          logs[0].args._approved.should.be.equal(address);
          logs[0].args._tokenId.should.be.bignumber.equal(tokenId);
        });
      };

      context('when clearing approval', function () {
        context('when there was no prior approval', function () {
          beforeEach(async function () {
            ({logs} = await this.token.approve(ZERO_ADDRESS, tokenId, {from: sender}));
          });

          itClearsApproval();
          itEmitsApprovalEvent(ZERO_ADDRESS);
        });

        context('when there was a prior approval', function () {
          beforeEach(async function () {
            await this.token.approve(to, tokenId, {from: sender});
            ({logs} = await this.token.approve(ZERO_ADDRESS, tokenId, {from: sender}));
          });

          itClearsApproval();
          itEmitsApprovalEvent(ZERO_ADDRESS);
        });
      });

      context('when approving a non-zero address', function () {
        context('when there was no prior approval', function () {
          beforeEach(async function () {
            ({logs} = await this.token.approve(to, tokenId, {from: sender}));
          });

          itApproves(to);
          itEmitsApprovalEvent(to);
        });

        context('when there was a prior approval to the same address', function () {
          beforeEach(async function () {
            await this.token.approve(to, tokenId, {from: sender});
            ({logs} = await this.token.approve(to, tokenId, {from: sender}));
          });

          itApproves(to);
          itEmitsApprovalEvent(to);
        });

        context('when there was a prior approval to a different address', function () {
          beforeEach(async function () {
            await this.token.approve(accounts[2], tokenId, {from: sender});
            ({logs} = await this.token.approve(to, tokenId, {from: sender}));
          });

          itApproves(to);
          itEmitsApprovalEvent(to);
        });
      });

      context('when the address that receives the approval is the owner', function () {
        it('reverts', async function () {
          await assertRevert(this.token.approve(sender, tokenId, {from: sender}));
        });
      });

      context('when the sender does not own the given token ID', function () {
        it('reverts', async function () {
          await assertRevert(this.token.approve(to, tokenId, {from: accounts[2]}));
        });
      });

      context('when the sender is approved for the given token ID', function () {
        it('reverts', async function () {
          await this.token.approve(accounts[2], tokenId, {from: sender});
          await assertRevert(this.token.approve(to, tokenId, {from: accounts[2]}));
        });
      });

      context('when the sender is an operator', function () {
        const operator = accounts[2];
        beforeEach(async function () {
          await this.token.setApprovalForAll(operator, true, {from: sender});
          ({logs} = await this.token.approve(to, tokenId, {from: operator}));
        });

        itApproves(to);
        itEmitsApprovalEvent(to);
      });

      context('when the given token ID does not exist', function () {
        it('reverts', async function () {
          await assertRevert(this.token.approve(to, '999', {from: sender}));
        });
      });
    });

    describe('setApprovalForAll', function () {
      const sender = _owner;

      context('when the operator willing to approve is not the owner', function () {
        const operator = accounts[1];

        context('when there is no operator approval set by the sender', function () {
          it('approves the operator', async function () {
            await this.token.setApprovalForAll(operator, true, {from: sender});

            const isApproved = await this.token.isApprovedForAll(sender, operator);
            isApproved.should.be.true;
          });

          it('emits an approval event', async function () {
            const {logs} = await this.token.setApprovalForAll(operator, true, {from: sender});

            logs.length.should.be.equal(1);
            logs[0].event.should.be.eq('ApprovalForAll');
            logs[0].args._owner.should.be.equal(sender);
            logs[0].args._operator.should.be.equal(operator);
            logs[0].args._approved.should.be.true;
          });
        });

        context('when the operator was set as not approved', function () {
          beforeEach(async function () {
            await this.token.setApprovalForAll(operator, false, {from: sender});
          });

          it('approves the operator', async function () {
            await this.token.setApprovalForAll(operator, true, {from: sender});

            const isApproved = await this.token.isApprovedForAll(sender, operator);
            isApproved.should.be.true;
          });

          it('emits an approval event', async function () {
            const {logs} = await this.token.setApprovalForAll(operator, true, {from: sender});

            logs.length.should.be.equal(1);
            logs[0].event.should.be.eq('ApprovalForAll');
            logs[0].args._owner.should.be.equal(sender);
            logs[0].args._operator.should.be.equal(operator);
            logs[0].args._approved.should.be.true;
          });

          it('can unset the operator approval', async function () {
            await this.token.setApprovalForAll(operator, false, {from: sender});

            const isApproved = await this.token.isApprovedForAll(sender, operator);
            isApproved.should.be.false;
          });
        });

        context('when the operator was already approved', function () {
          beforeEach(async function () {
            await this.token.setApprovalForAll(operator, true, {from: sender});
          });

          it('keeps the approval to the given address', async function () {
            await this.token.setApprovalForAll(operator, true, {from: sender});

            const isApproved = await this.token.isApprovedForAll(sender, operator);
            isApproved.should.be.true;
          });

          it('emits an approval event', async function () {
            const {logs} = await this.token.setApprovalForAll(operator, true, {from: sender});

            logs.length.should.be.equal(1);
            logs[0].event.should.be.eq('ApprovalForAll');
            logs[0].args._owner.should.be.equal(sender);
            logs[0].args._operator.should.be.equal(operator);
            logs[0].args._approved.should.be.true;
          });
        });
      });

      context('when the operator is the owner', function () {
        const operator = _owner;

        it('reverts', async function () {
          await assertRevert(this.token.setApprovalForAll(operator, true, {from: sender}));
        });
      });
    });
  });

  describe('like a mintable and burnable ERC721Token', function () {
    beforeEach(async function () {
      await this.token.mint(_blockhashOne, _tokenIdOne, _nicknameOne, {from: _owner});
      await this.token.mint(_blockhashTwo, _tokenIdTwo, _nicknameTwo, {from: _owner});
    });

    describe('mint', function () {
      const to = accounts[1];
      const tokenId = _tokenIdThree; // two already minted (therefore 3)
      let logs = null;

      describe('when successful', function () {
        beforeEach(async function () {
          const result = await this.token.mintTransfer(_blockhashThree, _tokenIdThree, _nicknameThree, to, {from: _owner});
          logs = result.logs;
        });

        it('assigns the token to the new owner', async function () {
          const owner = await this.token.ownerOf(tokenId);
          owner.should.be.equal(to);
        });

        it('increases the balance of its owner', async function () {
          const balance = await this.token.balanceOf(to);
          balance.should.be.bignumber.equal(1);
        });

        it('emits a transfer event', async function () {
          logs.length.should.be.equal(2);
          logs[0].event.should.be.eq('Transfer');
          logs[0].args._from.should.be.equal(ZERO_ADDRESS);
          logs[0].args._to.should.be.equal(to);
          logs[0].args._tokenId.should.be.bignumber.equal(tokenId);
        });
      });

      describe('when the given owner address is the zero address', function () {
        it('reverts', async function () {
          await assertRevert(this.token.mintTransfer(_blockhashFour, _tokenIdFour, _nicknameFour, ZERO_ADDRESS, {from: _owner}));
        });
      });

      describe('when the given token ID was already tracked by this contract', function () {
        it('reverts', async function () {
          await assertRevert(this.token.mintTransfer(_blockhashOne, _tokenIdOne, _nicknameOne, to, {from: _owner}));
        });
      });
    });

    describe('burn', function () {
      const tokenId = _tokenIdOne;
      const sender = _owner;
      let logs = null;

      describe('when successful', function () {
        beforeEach(async function () {
          const result = await this.token.burn(tokenId, {from: sender});
          logs = result.logs;
        });

        it('burns the given token ID and adjusts the balance of the owner', async function () {
          await assertRevert(this.token.ownerOf(tokenId));
          const balance = await this.token.balanceOf(sender);
          balance.should.be.bignumber.equal(1);
        });

        it('emits a burn event', async function () {
          logs.length.should.be.equal(1);
          logs[0].event.should.be.eq('Transfer');
          logs[0].args._from.should.be.equal(sender);
          logs[0].args._to.should.be.equal(ZERO_ADDRESS);
          logs[0].args._tokenId.should.be.bignumber.equal(tokenId);
        });
      });

      describe('when there is a previous approval', function () {
        beforeEach(async function () {
          await this.token.approve(accounts[1], tokenId, {from: sender});
          const result = await this.token.burn(tokenId, {from: sender});
          logs = result.logs;
        });

        it('clears the approval', async function () {
          const approvedAccount = await this.token.getApproved(tokenId);
          approvedAccount.should.be.equal(ZERO_ADDRESS);
        });
      });

      describe('when the given token ID was not tracked by this contract', function () {
        it('reverts', async function () {
          await assertRevert(this.token.burn('999', {from: _owner}));
        });
      });
    });
  });
});
