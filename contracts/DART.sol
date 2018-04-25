pragma solidity ^0.4.21;


import "./ERC721Token.sol";

import "./Strings.sol";

import "./ERC165.sol";


/**
* @title DART
*/
contract DART is ERC721Token, ERC165 {
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

  string internal tokenBaseURI = "https://ipfs.infura.io/ipfs/";

  // creator and owner
  address public curatorAccount;

  // total wei sent to the  contract
  uint256 public totalContributionsInWei;

  // A pointer to the next token to be minted, zero indexed
  uint256 public tokenIdPointer = 0;

  //Block number to Token ID
  mapping (uint256 => uint256) internal blockNumberToTokenId;

  //Token ID to Handle
  mapping (uint256 => string) internal tokenIdToHandle;

  modifier onlyCurator() {
    require(msg.sender == curatorAccount);
    _;
  }

  modifier onlyDARTOwnedToken(uint256 _tokenId) {
    require(tokenOwner[_tokenId] == curatorAccount);
    _;
  }

  modifier onlyDART() {
    require(msg.sender == curatorAccount);
    _;
  }

  function DART() public ERC721Token("Digital Art", "DART") {
    curatorAccount = msg.sender;
  }

  // don't accept payment directly to contract
  function() public payable {
    // TODO if payable found, check called has a token and call dArtFundDisplayTime() - probs arise if person already owns one?
    revert();
  }

  /**
   * @dev Funds your token to be displayed for a specific amount of time
   * @param _tokenId the DART token ID
   */
  function dArtFundDisplayTime(uint256 _tokenId) public payable {
    require(exists(_tokenId));
    require(msg.value >= 0);

    // TODO valid min/max payment

    // TODO
    // determine number of blocks to display based on msg.value
    // add to next working block list the amount of blocks the sender ha requested to be used
    // update list of next blocks and what to display
    // update hashing function to check this list, if match found use it, otherwise all back to default
    // splice monies to various parties
  }

  /**
   * @dev Mint a new DART token
   * @dev Reverts if not called by curator
   * @param _tokenURI the IPFS or equivalent hash
   * @param _handle char stamp of token owner
   */
  function mint(string _tokenURI, string _handle) external onlyDART {
    uint256 _tokenId = tokenIdPointer;

    uint256 currentBlockNumber = block.number;

    // ensure block is empty
    require(blockNumberToTokenId[currentBlockNumber] == 0);

    super._mint(msg.sender, _tokenId);
    super._setTokenURI(_tokenId, _tokenURI);

    // Set block number to token mapping (you own this block by default) TODO is this valid?
    blockNumberToTokenId[currentBlockNumber] = _tokenId;

    tokenIdToHandle[_tokenId] = _handle;

    tokenIdPointer = tokenIdPointer.add(1);
  }

  /**
   * @dev Burns a DART token
   * @dev Reverts if token is not unsold or not owned by management
   * @param _tokenId the DART token ID
   */
  function burn(uint256 _tokenId) external onlyDART onlyDARTOwnedToken(_tokenId) {
    require(exists(_tokenId));
    super._burn(ownerOf(_tokenId), _tokenId);
  }

  /**
   * @dev Utility function for updating a DART assets token URI
   * @dev Reverts if not called by management
   * @param _tokenId the DART token ID
   * @param _uri the token URI, will be concatenated with baseUri
   */
  function setTokenURI(uint256 _tokenId, string _uri) external onlyDART {
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
  function handleOf(uint256 _tokenId) public view returns (string _handle) {
    return tokenIdToHandle[_tokenId];
  }

  /**
  * @dev Return token which backs the block
  * @param _blockNumber to look up
  */
  function tokenBlockOwnerOf(uint256 _blockNumber) public view returns (uint256 _tokenId) {
    return blockNumberToTokenId[_blockNumber];
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
  function setTokenBaseURI(string _newBaseURI) external onlyDART {
    tokenBaseURI = _newBaseURI;
  }

  /**
   * @dev Generates a unique token hash for the token and handle
   * @param _tokenId the DART token ID
   */
  function tokenHash(uint256 _tokenId) public view returns (bytes32) {
    // TODO decide on hashing function
    return keccak256(Strings.strConcat(bytes32ToString(bytes32(_tokenId)), ":", tokenIdToHandle[_tokenId]));
  }

  /**
   * @dev Generates a unique token hash for the token and handle
   */
  function getCurrentHash() public view returns (bytes32 _tokenHash) {

    // TODO handle funding the next hash ... ?

    uint256 _tokenId = tokenBlockOwnerOf(block.number);
    if (exists(_tokenId)) {
      return tokenHash(_tokenId);
    }

    // if no one own the current blockhash return current
    return block.blockhash(block.number);
  }

  function bytes32ToString(bytes32 data) internal pure returns (string) {
    bytes memory bytesString = new bytes(32);
    for (uint j = 0; j < 32; j++) {
      byte char = byte(bytes32(uint(data) * 2 ** (8 * j)));
      if (char != 0) {
        bytesString[j] = char;
      }
    }
    return string(bytesString);
  }
}
