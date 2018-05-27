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

  string internal tokenBaseURI = "https://ipfs.infura.io/ipfs/";

  mapping (uint256 => string) internal tokenIdToNickname;

  mapping(uint256 => bytes32) internal tokenIdToBlockhash;
  mapping(bytes32 => uint256) internal blockhashToTokenId;

  function DART() public ERC721Token("Digital Art", "DART") {

    super.addAddressToWhitelist(msg.sender);

    // FIXME - hardcoded?
    super.addAddressToWhitelist(0xf43aE50C468c3D3Fa0C3dC3454E797317EF53078);
    super.addAddressToWhitelist(0xe1023C112A39c58238929153F25364c11A33B729);
  }

  // don't accept payment directly to contract
  function() public payable {
    revert();
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

    // Use default
    super._setTokenURI(_tokenId, "WIP");

    // set data
    tokenIdToBlockhash[_tokenId] = _blockhash;
    blockhashToTokenId[_blockhash] = _tokenId;
    tokenIdToNickname[_tokenId] = _nickname;

    MintDART(msg.sender, _tokenId, _blockhash, _nickname);
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
   * @dev checks for owned tokens
   * @param _owner address to query
   */
  function hasTokens(address _owner) constant returns (bool) {
    return ownedTokens[_owner].length > 0;
  }

  /**
   * @dev checks for owned tokens
   * @param _owner address to query
   */
  function firstToken(address _owner) constant returns (uint256 _tokenId) {
    require(hasTokens(_owner));
    return ownedTokens[_owner][0];
  }

  /**
   * @dev Return handle of token
   * @param _tokenId token ID for handle lookup
   */
  function nicknameOf(uint256 _tokenId) public view returns (string _nickname) {
    return tokenIdToNickname[_tokenId];
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
  function setTokenBaseURI(string _newBaseURI) external onlyOwner {
    tokenBaseURI = _newBaseURI;
  }

  /**
   * @dev Return blockhash of the DART token
   * @param _tokenId the DART token ID
   */
  function blockhashOf(uint256 _tokenId) public view returns (bytes32 hash) {
    return tokenIdToBlockhash[_tokenId];
  }
}
