pragma solidity ^0.4.21;


import "./ERC721Token.sol";

import "./Strings.sol";

import "./ERC165.sol";

import "./Whitelist.sol";


/**
* @title DART
*/
contract DART is ERC721Token, ERC165, Whitelist {
  using SafeMath for uint256;

  bytes4 constant InterfaceSignature_ERC165 = 0x01ffc9a7;
  /*
  bytes4(keccak256('supportsInterface(bytes4)'));
  */

  bytes4 constant InterfaceSignature_ERC721Enumerable = 0x780e9d63;
  /*
  bytes4(keccak256('totalSupply()')) ^
  bytes4(keccak256('tokenOfOwnerByIndex(address,uint256)')) ^
  bytes4(keccak256('tokenByIndex(uint256)'));
  */

  bytes4 constant InterfaceSignature_ERC721Metadata = 0x5b5e139f;
  /*
  bytes4(keccak256('name()')) ^
  bytes4(keccak256('symbol()')) ^
  bytes4(keccak256('tokenURI(uint256)'));
  */

  bytes4 constant InterfaceSignature_ERC721 = 0x80ac58cd;
  /*
  bytes4(keccak256('balanceOf(address)')) ^
  bytes4(keccak256('ownerOf(uint256)')) ^
  bytes4(keccak256('approve(address,uint256)')) ^
  bytes4(keccak256('getApproved(uint256)')) ^
  bytes4(keccak256('setApprovalForAll(address,bool)')) ^
  bytes4(keccak256('isApprovedForAll(address,address)')) ^
  bytes4(keccak256('transferFrom(address,address,uint256)')) ^
  bytes4(keccak256('safeTransferFrom(address,address,uint256)')) ^
  bytes4(keccak256('safeTransferFrom(address,address,uint256,bytes)'));
  */

  bytes4 public constant InterfaceSignature_ERC721Optional = - 0x4f558e79;
  /*
  bytes4(keccak256('exists(uint256)'));
  */

  /**
   * @notice Introspection interface as per ERC-165 (https://github.com/ethereum/EIPs/issues/165).
   * @dev Returns true for any standardized interfaces implemented by this contract.
   * @param _interfaceID bytes4 the interface to check for
   * @return true for any standardized interfaces implemented by this contract.
   */
  function supportsInterface(bytes4 _interfaceID) external pure returns (bool) {
    return ((_interfaceID == InterfaceSignature_ERC165)
    || (_interfaceID == InterfaceSignature_ERC721)
    || (_interfaceID == InterfaceSignature_ERC721Optional)
    || (_interfaceID == InterfaceSignature_ERC721Enumerable)
    || (_interfaceID == InterfaceSignature_ERC721Metadata));
  }

  event MintDART(address indexed _owner, uint256 indexed _tokenId, bytes32 _blockhash, string _nickname);

  event FundDART(address indexed _funder, uint256 indexed _tokenId, bytes32 _blockhash, uint256 _block);

  event BlocksPurchasedDART(address indexed _funder, uint256 indexed _tokenId, uint256 _blocksPurchased);

  event Test(string name, uint256 now);

  string internal tokenBaseURI = "https://ipfs.infura.io/ipfs/";

  // total wei sent to the  contract
  uint256 public totalContributionsInWei;

  // TODO handle setting these per contract/installation
  // the price to display per block
  uint256 public pricePerBlock = 0.01 ether;

  // TODO handle setting these per contract/installation
  // percentage of all funds received which is directed to a donation address
  uint8 public donationPercentage = 1;

  // TODO handle setting these per contract/installation
  // max number of blocks allowed to purchased in one go (mainly for gas costs, this should be kept fairly low for now)
  uint256 public maxBlockPurchaseInOneGo = 20;

  mapping (uint256 => bytes32) internal tokenIdToBlockhash;

  mapping (bytes32 => uint256) internal blockhashToTokenId;

  mapping (uint256 => string) internal tokenIdToNickname;

  uint256 public lastPurchasedBlock = 0;

  mapping (uint256 => uint256) internal blockToTokenOwner;

  mapping (uint256 => bool) internal blockPurchasedMapping;

  // Mapping tokenID to the blocks that have purchased
  mapping (uint256 => uint256[]) internal tokenToBlocksPurchased;

  modifier onlyDARTOwnedToken(uint256 _tokenId) {
    require(tokenOwner[_tokenId] == owner);
    _;
  }

  modifier onlyValidAmounts() {
    // Some value
    require(msg.value >= 0);

//    // Min price
//    require(msg.value >= pricePerBlock);
//
//    // max price
//    require(msg.value <= (pricePerBlock * maxBlockPurchaseInOneGo));
    _;
  }

  function DART() public ERC721Token("Digital Art", "DART") {
    // set to current block mined in
    lastPurchasedBlock = block.number;

    // TODO handle setting these/configuring
    super.addAddressToWhitelist(msg.sender);
    super.addAddressToWhitelist(0xf43aE50C468c3D3Fa0C3dC3454E797317EF53078);
    super.addAddressToWhitelist(0xe1023C112A39c58238929153F25364c11A33B729);
  }

  // don't accept payment directly to contract
  function() public payable {
    // FIXME HARD CODE ALERT
    fundDart(161);
  }

  function purchaseBlock(uint256 _blocknumber, uint256 _tokenId) internal {

    // Set a boolean flag to identify this block is purchased
    blockPurchasedMapping[_blocknumber] = true;

    // keep track of the token associated to the block
    blockToTokenOwner[_blocknumber] = _tokenId;

    // Keep track of the blocks purchased by the token
    tokenToBlocksPurchased[_tokenId].push(_blocknumber);

    // Emit event for logging/tracking
    FundDART(msg.sender, _tokenId, generateHash(_blocknumber), _blocknumber);
  }

  /**
   * @dev Funds your token to be displayed for a specific amount of time
   * @param _tokenId the DART token ID
   */
//  function fundDart(uint256 _tokenId) public payable onlyValidAmounts {
//    require(exists(_tokenId));
//
//    // determine how many blocks purchased
//    uint256 blocksToPurchased = msg.value / pricePerBlock;
//
//    // Start purchase from next block the current block is being mined
//    uint256 nextBlockToPurchase = block.number + 1;
//
//    // Move next purchase-able on block if the blockchain is in the past when compared to future purchased blocks
//    // This deal with people purchasing blocks in the future & reduces looping costs
//    if (nextBlockToPurchase < lastPurchasedBlock) {
//      nextBlockToPurchase = lastPurchasedBlock;
//    }
//
//    uint256 nextBlock = nextBlockToPurchase;
//
//    uint8 purchased = 0;
//    while (purchased < blocksToPurchased) {
//
//      // if the next block is not purchased
//      if (!blockPurchasedMapping[nextBlock]) {
//
//        // Set a boolean flag to identify this block is purchased
//        blockPurchasedMapping[nextBlock] = true;
//
//        // keep track of the token associated to the block
//        blockToTokenOwner[nextBlock] = _tokenId;
//
//        // Keep track of the blocks purchased by the token
//        tokenToBlocksPurchased[_tokenId].push(nextBlock);
//
//        // Emit event for logging/tracking
//        FundDART(msg.sender, _tokenId, generateHash(nextBlock), nextBlock);
//
//        // Mark one block as found
//        purchased++;
//      }
//
//      // move next block on to find another free space
//      nextBlock++;
//    }
//
//    // update last block once purchased
//    lastPurchasedBlock = nextBlock;
//
//    BlocksPurchasedDART(msg.sender, _tokenId, blocksToPurchased);
//
//    // TODO splice monies to various parties
//  }
  function fundDart(uint256 _tokenId) public payable onlyValidAmounts {
    require(exists(_tokenId));

    purchaseBlock(block.number + 1, _tokenId);
    purchaseBlock(block.number + 2, _tokenId);
    purchaseBlock(block.number + 3, _tokenId);
    purchaseBlock(block.number + 4, _tokenId);
    purchaseBlock(block.number + 5, _tokenId);
    purchaseBlock(block.number + 6, _tokenId);
    purchaseBlock(block.number + 7, _tokenId);
    purchaseBlock(block.number + 8, _tokenId);
    purchaseBlock(block.number + 9, _tokenId);
    purchaseBlock(block.number + 10, _tokenId);
  }

  /**
   * @dev Mint a new DART token
   * @dev Reverts if not called by curator
   * @param _blockhash an Ethereum block hash
   * @param _tokenId unique token ID
   * @param _nickname char stamp of token owner
   */
  function mint(bytes32 _blockhash, uint256 _tokenId, string _nickname) external onlyWhitelisted {
    require(blockhashToTokenId[_blockhash] == 0);
    require(tokenIdToBlockhash[_tokenId] == 0);

    // actually mint the token
    super._mint(msg.sender, _tokenId);

    // FIXME - handle this
    super._setTokenURI(_tokenId, "WIP");

    // set data
    tokenIdToBlockhash[_tokenId] = _blockhash;
    blockhashToTokenId[_blockhash] = _tokenId;
    tokenIdToNickname[_tokenId] = _nickname;

    MintDART(msg.sender, _tokenId, _blockhash, _nickname);
  }

  /**
   * @dev Attempts to work out the next block which will be funded
   */
  function getNextBlockToFund() public view returns (uint256 _nextFundedBlock) {
    if (block.number < lastPurchasedBlock) {
      return lastPurchasedBlock;
    }
    return block.number + 1;
  }

  /**
   * @dev Burns a DART token
   * @dev Reverts if token is not unsold or not owned by management
   * @param _tokenId the DART token ID
   */
  function burn(uint256 _tokenId) external onlyWhitelisted onlyDARTOwnedToken(_tokenId) {
    require(exists(_tokenId));
    super._burn(ownerOf(_tokenId), _tokenId);
    // TODO clear metadata
  }

  /**
   * @dev Utility function for updating a DART assets token URI
   * @dev Reverts if not called by management
   * @param _tokenId the DART token ID
   * @param _uri the token URI, will be concatenated with baseUri
   */
  function setTokenURI(uint256 _tokenId, string _uri) external onlyWhitelisted {
    require(exists(_tokenId));
    _setTokenURI(_tokenId, _uri);
  }

  /**
   * @dev Return owned tokens
   * @param _owner address to query
   */
  function tokensOf(address _owner) public view returns (uint256[] _tokenIds) {
    return ownedTokens[_owner];
  }

  /**
   * @dev Return handle of token
   * @param _tokenId token ID for handle lookup
   */
  function nicknameOf(uint256 _tokenId) public view returns (string _nickname) {
    return tokenIdToNickname[_tokenId];
  }

  /**
   * @dev Return blockhash of the DART token
   * @param _tokenId the DART token ID
   */
  function blockhashOf(uint256 _tokenId) public view returns (bytes32 hash) {
    return tokenIdToBlockhash[_tokenId];
  }

  /**
   * @dev Return token ID for the provided block or 0 when not found
   */
  function blockOwnerOf(uint256 _blockNumber) public view returns (uint256 _tokenId) {
    return blockToTokenOwner[_blockNumber];
  }

  /**
   * @dev Returns whether the specified block has been purchased
   */
  function isBlockPurchased(uint256 _blockNumber) public view returns (bool) {
    return blockPurchasedMapping[_blockNumber];
  }

  /**
   * @dev Returns the blocks which the [provided token has purchased
   */
  function blocksPurchasedByToken(uint256 _tokenId) public view returns (uint256[] _blocks) {
    return tokenToBlocksPurchased[_tokenId];
  }

  /**
   * @dev Get token URI fro the given token, useful for testing purposes
   * @param _tokenId the DART token ID
   * @return the token ID or only the base URI if not found
   */
  function tokenURI(uint256 _tokenId) public view returns (string) {
    return Strings.strConcat(tokenBaseURI, tokenURIs[_tokenId]);
  }

  /**
   * @dev Allows management to update the base tokenURI path
   * @dev Reverts if not called by management
   * @param _newBaseURI the new base URI to set
   */
  function setTokenBaseURI(string _newBaseURI) external onlyWhitelisted {
    tokenBaseURI = _newBaseURI;
  }

  /**
   * @dev Get the hash the given block
   * @param _blockNumber the block to generate hash for
   * TODO rename this to get()
   */
  function generateHash(uint256 _blockNumber) public view returns (bytes32 _tokenHash) {
    // Dont allow this to be called for hashes which aren't purchased
    require(isBlockPurchased(_blockNumber));

    uint256 token = blockOwnerOf(_blockNumber);
    return blockhashOf(token);
  }

  /**
   * @dev Generates a unique token hash for the token and handle
   */
  function nextHash() public view returns (bytes32 _tokenHash) {
    uint256 nextBlock = block.number - 1;

    // if current block number has been allocated then use it
    if (blockOwnerOf(nextBlock) != 0) {
      return generateHash(nextBlock);
    }

    // if no one own the current blockhash return current
    return defaultBlockhash(nextBlock);
  }

  /**
   * @dev Generates default block hash behaviour - good for testings
   */
  function defaultBlockhash(uint256 _blockNumber) public view returns (bytes32 _tokenHash) {
    return block.blockhash(_blockNumber);
  }

  /**
   * @dev Returns blocknumber - good for testings
   */
  function blockNumber() public view returns (uint256 _blockNumber) {
    return block.number;
  }
}
