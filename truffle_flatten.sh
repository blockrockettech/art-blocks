#!/usr/bin/env bash

node ./node_modules/.bin/truffle-flattener ./contracts/Migrations.sol > ./contracts-flat/Migrations.sol;

node ./node_modules/.bin/truffle-flattener ./contracts/v1/InterfaceToken.sol > ./contracts-flat/InterfaceToken.sol;
node ./node_modules/.bin/truffle-flattener ./contracts/v1/SimpleArtistContract.sol > ./contracts-flat/SimpleArtistContract.sol;

node ./node_modules/.bin/truffle-flattener ./contracts/v2/SimpleArtistContractV2.sol > ./contracts-flat/SimpleArtistContractV2.sol;
