// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import './LibertyCoin.sol';

contract ExchangeLicEth {
    
    string public name = "ExchangeLicEth";
    LibertyCoin public token;
    uint public rate = 100;

    event TokenPurchased (
        address account,
        address token,
        uint amount,
        uint rate
    );

    event TokenSold (
        address account,
        address token,
        uint amount,
        uint rate
    );

    constructor (LibertyCoin _token) public {
        token = _token;
    }

    function buyTokens () public payable {
        uint tokenAmount = msg.value * rate;

        require(token.balanceOf(address(this)) >= tokenAmount);

        token.transfer(msg.sender, tokenAmount);
        
        emit TokenPurchased(msg.sender, address(token), tokenAmount, rate);

    }

    function sellTokens (uint _amount) public {
        require(token.balanceOf(msg.sender) >= _amount);
        
        uint etherAmount = _amount / rate;

        require(address(this).balance >= etherAmount);

        token.transferFrom(msg.sender, address(this), _amount);
        msg.sender.transfer(etherAmount);

        emit TokenSold(msg.sender, address(token), _amount, rate);
    }
}