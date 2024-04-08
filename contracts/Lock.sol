// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract TestContract {

    address immutable public immutableDeployer;
    address public deployer;

    constructor() {
        deployer = msg.sender;
        immutableDeployer = msg.sender;
    }

    function foo() external pure returns (string memory) {
        return "bar";
    }
}
