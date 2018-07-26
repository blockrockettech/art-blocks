pragma solidity ^0.4.24;

import "./Strings.sol";

import 'openzeppelin-solidity/contracts/access/Whitelist.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';

/**
  * @title InterfaceToken
  * https://www.interfacetoken.com/
  */
contract InterfaceToken is ERC721Token, Whitelist {
  using SafeMath for uint256;

  event Minted(address indexed _owner, uint256 indexed _tokenId, bytes32 _blockhash, bytes32 _nickname);

  string internal tokenBaseURI = "https://ipfs.infura.io/ipfs/";
  string internal defaultTokenURI = "Qma4QoWXq7YzFUkREXW9wKVYPZmKzS5pkckaSjwY8Gc489";

  uint256 public purchaseTokenPointer = 1000000000;
  uint256 public costOfToken = 0.01 ether;

  mapping(uint256 => bytes32) internal tokenIdToNickname;

  mapping(uint256 => bytes32) internal tokenIdToBlockhash;
  mapping(bytes32 => uint256) internal blockhashToTokenId;

  constructor() public ERC721Token("Interface Token", "TOKN") {
    super.addAddressToWhitelist(msg.sender);
  }

  function() public payable {
    buyTokens("");
  }

  /**
   * @dev Mint a new InterfaceToken token
   * @dev Reverts if not called by curator
   * @param _blockhash an Ethereum block hash
   * @param _tokenId unique token ID
   * @param _nickname char stamp of token owner
   */
  function mint(bytes32 _blockhash, uint256 _tokenId, bytes32 _nickname) external onlyIfWhitelisted(msg.sender) {
    require(_tokenId < purchaseTokenPointer); // ensure under number where buying tokens takes place
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
  function mintTransfer(bytes32 _blockhash, uint256 _tokenId, bytes32 _nickname, address _recipient) external onlyIfWhitelisted(msg.sender) {
    require(_tokenId < purchaseTokenPointer); // ensure under number where buying tokens takes place
    _mint(_blockhash, _tokenId, _nickname, _recipient);
  }

  /**
   * @dev Purchases a new InterfaceToken token
   * @dev Reverts if not called by curator
   * @param _nickname char stamp of token owner
   */
  function buyToken(bytes32 _nickname) public payable {
    require(msg.value >= costOfToken);

    _mint(keccak256(abi.encodePacked(purchaseTokenPointer, _nickname)), purchaseTokenPointer, _nickname, msg.sender);
    purchaseTokenPointer = purchaseTokenPointer.add(1);

    // reconcile payments
    owner.transfer(costOfToken);
    msg.sender.transfer(msg.value - costOfToken);
  }

  /**
   * @dev Purchases multiple new InterfaceToken tokens
   * @dev Reverts if not called by curator
   * @param _nickname char stamp of token owner
   */
  function buyTokens(bytes32 _nickname) public payable {
    require(msg.value >= costOfToken);

    uint i = 0;
    for (i; i < (msg.value / costOfToken); i++) {
      _mint(keccak256(abi.encodePacked(purchaseTokenPointer, _nickname)), purchaseTokenPointer, _nickname, msg.sender);
      purchaseTokenPointer = purchaseTokenPointer.add(1);
    }

    // reconcile payments
    owner.transfer(costOfToken * i);
    msg.sender.transfer(msg.value - (costOfToken * i));
  }

  function _mint(bytes32 _blockhash, uint256 _tokenId, bytes32 _nickname, address _recipient) internal {
    require(_recipient !=  address(0));
    require(blockhashToTokenId[_blockhash] == 0);
    require(tokenIdToBlockhash[_tokenId] == 0);

    // mint the token with sender as owner
    super._mint(_recipient, _tokenId);

    // set data
    tokenIdToBlockhash[_tokenId] = _blockhash;
    blockhashToTokenId[_blockhash] = _tokenId;
    tokenIdToNickname[_tokenId] = _nickname;

    emit Minted(_recipient, _tokenId, _blockhash, _nickname);
  }

  /**
   * @dev Utility function changing the cost of the token
   * @dev Reverts if not called by owner
   * @param _costOfToken cost in wei
   */
  function setCostOfToken(uint256 _costOfToken) external onlyIfWhitelisted(msg.sender) {
    costOfToken = _costOfToken;
  }

  /**
   * @dev Utility function for updating a nickname if you own the token
   * @dev Reverts if not called by owner
   * @param _tokenId the  token ID
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
  function hasTokens(address _owner) public view returns (bool) {
    return ownedTokens[_owner].length > 0;
  }

  /**
   * @dev checks for owned tokens
   * @param _owner address to query
   */
  function firstToken(address _owner) public view returns (uint256 _tokenId) {
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
   * @param _tokenId the token ID
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
   * @dev Utility function for updating an assets token URI
   * @dev Reverts if not called by management
   * @param _tokenId the token ID
   * @param _uri the token URI, will be concatenated with baseUri
   */
  function setTokenURI(uint256 _tokenId, string _uri) external onlyIfWhitelisted(msg.sender) {
    require(exists(_tokenId));
    _setTokenURI(_tokenId, _uri);
  }

  /**
   * @dev Return blockhash of the  token
   * @param _tokenId the token ID
   */
  function blockhashOf(uint256 _tokenId) public view returns (bytes32 hash) {
    return tokenIdToBlockhash[_tokenId];
  }

  /**
 * @dev Return token ID of a Blockhash
 * @param _blockhash blockhash reference
 */
  function tokenIdOf(bytes32 _blockhash) public view returns (uint256 hash) {
    return blockhashToTokenId[_blockhash];
  }

  /**
   * @dev Return blockhash of the  token
   * @param _tokenId the token ID
   */
  function burn(uint256 _tokenId) public {
    super._burn(msg.sender, _tokenId);

    bytes32 tokenBlockhash = tokenIdToBlockhash[_tokenId];

    if (tokenIdToBlockhash[_tokenId].length != 0) {
      delete tokenIdToBlockhash[_tokenId];
    }

    if (tokenIdToNickname[_tokenId].length != 0) {
      delete tokenIdToNickname[_tokenId];
    }

    if (blockhashToTokenId[tokenBlockhash] != 0) {
      delete blockhashToTokenId[tokenBlockhash];
    }
  }
}
