pragma solidity ^0.4.21;


import "./ERC721Token.sol";

import "./Strings.sol";

import "./ERC165.sol";

import "./Whitelist.sol";

/**
* @title InterfaceToken
*/
contract InterfaceToken is ERC721Token, ERC165, Whitelist {
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

  event Minted(address indexed _owner, uint256 indexed _tokenId, bytes32 _blockhash, bytes32 _nickname);

  string internal tokenBaseURI = "https://ipfs.infura.io/ipfs/";
  string internal defaultTokenURI = "QmUrTjPy2g4awRYAV8KsRShGaHfLhcgk3nQpEGwY5893Bk";

  uint256 public purchaseTokenPointer =  1000000000;
  uint256 public costOfToken = 0.01 ether;


  mapping(uint256 => bytes32) internal tokenIdToNickname;

  mapping(uint256 => bytes32) internal tokenIdToBlockhash;
  mapping(bytes32 => uint256) internal blockhashToTokenId;

  function InterfaceToken() public ERC721Token("Interface Token", "TOKN") {
    super.addAddressToWhitelist(msg.sender);
  }

  // attempt to buy last block
  function() public payable {
    buyToken("");
  }

  /**
   * @dev Mint a new InterfaceToken token
   * @dev Reverts if not called by curator
   * @param _blockhash an Ethereum block hash
   * @param _tokenId unique token ID
   * @param _nickname char stamp of token owner
   */
  function mint(bytes32 _blockhash, uint256 _tokenId, bytes32 _nickname) external onlyWhitelisted {
    _mint(_blockhash, _tokenId, _nickname, msg.sender);
  }

  /**
   * @dev Mint a new InterfaceToken token (with recipient)
   * @dev Reverts if not called by curator
   * @param _blockhash an Ethereum block hash
   * @param _tokenId unique token ID
   * @param _nickname char stamp of token owner
   * @param _recipient owner of the newly minted token
   */
  function mintTransfer(bytes32 _blockhash, uint256 _tokenId, bytes32 _nickname, address _recipient) external onlyWhitelisted {
    _mint(_blockhash, _tokenId, _nickname, _recipient);
  }

  /**
   * @dev Purchases a new InterfaceToken token
   * @dev Reverts if not called by curator
   * @param _nickname char stamp of token owner
   */
  function buyToken(bytes32 _nickname) public payable {
    require(msg.value >= costOfToken);

    _mint(keccak256(purchaseTokenPointer), purchaseTokenPointer, _nickname, msg.sender);

    purchaseTokenPointer = purchaseTokenPointer.add(1);

    // reconcile payments
    msg.sender.transfer(msg.value - costOfToken);
    owner.transfer(costOfToken);
  }

  function _mint(bytes32 _blockhash, uint256 _tokenId, bytes32 _nickname, address _recipient) internal {
    require(blockhashToTokenId[_blockhash] == 0);
    require(tokenIdToBlockhash[_tokenId] == 0);

    // mint the token with sender as owner
    super._mint(_recipient, _tokenId);

    // set data
    tokenIdToBlockhash[_tokenId] = _blockhash;
    blockhashToTokenId[_blockhash] = _tokenId;
    tokenIdToNickname[_tokenId] = _nickname;

    Minted(_recipient, _tokenId, _blockhash, _nickname);
  }

  /**
   * @dev Utility function changing the cost of the token
   * @dev Reverts if not called by owner
   * @param _costOfToken cost in wei
   */
  function setCostOfToken(uint256 _costOfToken) external onlyOwner {
    costOfToken = _costOfToken;
  }

  /**
   * @dev Utility function for updating a nickname if you own the token
   * @dev Reverts if not called by owner
   * @param _tokenId the DART token ID
   * @param _nickname char stamp of token owner
   */
  function setNickname(uint256 _tokenId, bytes32 _nickname) external onlyOwnerOf(_tokenId) {
    tokenIdToNickname[_tokenId] = _nickname;
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
  function nicknameOf(uint256 _tokenId) public view returns (bytes32 _nickname) {
    return tokenIdToNickname[_tokenId];
  }

  /**
   * @dev Get token URI fro the given token, useful for testing purposes
   * @param _tokenId the DART token ID
   * @return the token ID or only the base URI if not found
   */
  function tokenURI(uint256 _tokenId) public view returns (string) {
    if (bytes(tokenURIs[_tokenId]).length == 0) {
      return Strings.strConcat(tokenBaseURI, defaultTokenURI);
    }

    return Strings.strConcat(tokenBaseURI, tokenURIs[_tokenId]);
  }

  /**
   * @dev Allows management to update the base tokenURI path
   * @dev Reverts if not called by owner
   * @param _newBaseURI the new base URI to set
   */
  function setTokenBaseURI(string _newBaseURI) external onlyOwner {
    tokenBaseURI = _newBaseURI;
  }

  /**
   * @dev Allows management to update the default token URI
   * @dev Reverts if not called by owner
   * @param _defaultTokenURI the new default URI to set
   */
  function setDefaultTokenURI(string _defaultTokenURI) external onlyOwner {
    defaultTokenURI = _defaultTokenURI;
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
   * @dev Return blockhash of the DART token
   * @param _tokenId the DART token ID
   */
  function blockhashOf(uint256 _tokenId) public view returns (bytes32 hash) {
    return tokenIdToBlockhash[_tokenId];
  }
}
