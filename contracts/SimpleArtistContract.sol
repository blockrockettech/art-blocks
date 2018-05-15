pragma solidity ^0.4.21;

import "./DART.sol";

import "./Ownable.sol";

/**
* @title SimpleArtistContract
*/
contract SimpleArtistContract is Ownable {
  using SafeMath for uint256;

  event Purchase(address indexed _funder, uint256 indexed _tokenId, bytes32 _blockhash, uint256 _block);
  event Purchased(address indexed _funder, uint256 indexed _tokenId, uint256 _blocksPurchased);

  modifier onlyValidAmounts() {
    require(msg.value >= 0);

    // Min price
    require(msg.value >= pricePerBlock);

    // max price
    require(msg.value <= (pricePerBlock * maxBlockPurchaseInOneGo));
    _;
  }

  DART public token;

  uint256 public pricePerBlock = 0.01 ether;
  uint256 public maxBlockPurchaseInOneGo = 20;

  mapping(uint256 => uint256) internal blocknumberToTokenId;
  mapping(uint256 => uint256[]) internal tokenIdToPurchasedBlocknumbers;

  uint256 public lastPurchasedBlock = 0;

  function SimpleArtistContract(DART _token) public {
    token = _token;

    // set to current block mined in
    lastPurchasedBlock = block.number;
  }

  function purchaseBlock(uint256 _blocknumber, uint256 _tokenId) internal {
    // keep track of the token associated to the block
    blocknumberToTokenId[_blocknumber] = _tokenId;

    // Keep track of the blocks purchased by the token
    tokenIdToPurchasedBlocknumbers[_tokenId].push(_blocknumber);

    // Emit event for logging/tracking
    Purchase(msg.sender, _tokenId, getPurchasedBlockhash(_blocknumber), _blocknumber);
  }

  /**
  * @dev allows payment direct to contract - if no token will store value on contract
  */
  function() public payable {
    if (token.hasTokens(msg.sender)) {
      purchase(token.firstToken(msg.sender));
    }
  }

  /**
  * @dev allows artist to withdraw funds sent by non-token holders
  */
  function withdraw() public onlyOwner {
    require(this.balance > 0);

    owner.transfer(this.balance);
  }

  /**
   * @dev purchase blocks with your Token ID to be displayed for a specific amount of blocks
   * @param _tokenId the DART token ID
   */
  function purchase(uint256 _tokenId) public payable onlyValidAmounts {
    require(token.exists(_tokenId));

    // determine how many blocks purchased
    uint256 blocksToPurchased = msg.value / pricePerBlock;

    // Start purchase from next block the current block is being mined
    uint256 nextBlockToPurchase = block.number + 1;

    // If next block is behind the next block to purchase, set next block to the last block
    if (nextBlockToPurchase < lastPurchasedBlock) {
      // reducing wasted loops to find a viable block to purchase
      nextBlockToPurchase = lastPurchasedBlock;
    }

    uint8 purchased = 0;
    while (purchased < blocksToPurchased) {

      if (tokenIdOf(nextBlockToPurchase) == 0) {
        purchaseBlock(nextBlockToPurchase, _tokenId);
        purchased++;
      }

      // move next block on to find another free space
      nextBlockToPurchase = nextBlockToPurchase + 1;
    }

    // update last block once purchased
    lastPurchasedBlock = nextBlockToPurchase;

    // TODO splice monies to various parties

    Purchased(msg.sender, _tokenId, blocksToPurchased);
  }

  /**
   * @dev Attempts to work out the next block which will be funded
   */
  function nextPurchasableBlocknumber() public view returns (uint256 _nextFundedBlock) {
    if (block.number < lastPurchasedBlock) {
      return lastPurchasedBlock;
    }
    return block.number + 1;
  }

  /**
   * @dev Returns the blocks which the provided token has purchased
   */
  function blocknumbersOf(uint256 _tokenId) public view returns (uint256[] _blocks) {
    return tokenIdToPurchasedBlocknumbers[_tokenId];
  }

  /**
   * @dev Return token ID for the provided block or 0 when not found
   */
  function tokenIdOf(uint256 _blockNumber) public view returns (uint256 _tokenId) {
    return blocknumberToTokenId[_blockNumber];
  }

  /**
 * @dev Get the block hash the given block number
 * @param _blocknumber the block to generate hash for
 */
  function getPurchasedBlockhash(uint256 _blocknumber) public view returns (bytes32 _tokenHash) {
    // Do not allow this to be called for hashes which aren't purchased
    require(tokenIdOf(_blocknumber) != 0);

    uint256 tokenId = tokenIdOf(_blocknumber);
    return token.blockhashOf(tokenId);
  }

  /**
   * @dev Generates default block hash behaviour - helps with tests
   */
  function nativeBlockhash(uint256 _blocknumber) public view returns (bytes32 _tokenHash) {
    return block.blockhash(_blocknumber);
  }

  /**
   * @dev Generates a unique token hash for the token
   * @return the hash and its associated block
   */
  function nextHash() public view returns (bytes32 _tokenHash, uint256 _nextBlocknumber) {
    uint256 nextBlocknumber = block.number - 1;

    // if current block number has been allocated then use it
    if (tokenIdOf(nextBlocknumber) != 0) {
      return (getPurchasedBlockhash(nextBlocknumber), nextBlocknumber);
    }

    // if no one own the current blockhash return current
    return (nativeBlockhash(nextBlocknumber), nextBlocknumber);
  }

  /**
   * @dev Returns blocknumber - helps with tests
   */
  function blocknumber() public view returns (uint256 _blockNumber) {
    return block.number;
  }
}
