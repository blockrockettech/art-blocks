#!/usr/bin/env bash

node ./node_modules/.bin/truffle-flattener ./contracts/Migrations.sol > ./contracts-flat/FLAT-Migrations.sol;

node ./node_modules/.bin/truffle-flattener ./contracts/InterfaceToken.sol > ./contracts-flat/FLAT-InterfaceToken.sol;
node ./node_modules/.bin/truffle-flattener ./contracts/SimpleArtistContract.sol > ./contracts-flat/FLAT-SimpleArtistContract.sol;
