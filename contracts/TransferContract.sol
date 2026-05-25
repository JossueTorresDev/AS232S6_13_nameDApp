// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TransferContract {
    event Funded(address indexed from, uint256 amount, uint256 timestamp);
    event Transferred(address indexed from, address indexed to, uint256 amount, uint256 timestamp);

    receive() external payable {
        emit Funded(msg.sender, msg.value, block.timestamp);
    }

    fallback() external payable {
        emit Funded(msg.sender, msg.value, block.timestamp);
    }

    function fundContract() external payable {
        require(msg.value > 0, "No value sent");
        emit Funded(msg.sender, msg.value, block.timestamp);
    }

    function sendFromContract(address payable recipient, uint256 amount) external {
        require(recipient != address(0), "Recipient zero");
        require(amount > 0, "Amount must be greater than zero");
        require(address(this).balance >= amount, "Insufficient contract balance");

        (bool ok, ) = recipient.call{ value: amount }("");
        require(ok, "Transfer failed");

        emit Transferred(address(this), recipient, amount, block.timestamp);
    }
}