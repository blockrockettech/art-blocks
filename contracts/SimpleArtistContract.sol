pragma solidity ^0.4.21;

import "./DART.sol";

import "./Ownable.sol";

/**
* @title SimpleArtistContract
*/
contract SimpleArtistContract is Ownable {
  using SafeMath for uint256;

  DART public token;

  function SimpleArtistContract(DART _token) public {
    token = _token;
  }
}
