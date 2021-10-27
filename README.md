<p align="center">
   <img src="https://github.com/moirrer/erc20-token-lic/blob/master/client/public/LIC192.png"/>
</p>
<h1 align="center">Libertycoin</h1>

## About
Simple ERC20 token creation, test and web interface with REACT and Metamask.

This repository is aimed at helping newcomers to blockchain development. 

**You are expected to be familiar with NPM and basic use of blockchain technology (understanding what is a private and public key and a wallet).**

With this you will have access to use, play and edit 3 different contracts that complement each other.

* Contract to only store a variable in blockchain (most useful to see a contract as a program and check solidity language basics);
* A contract for a standard ERC20 token, it's your own crypto within the etherium network (local network, don't get excited, no monetary value "XD);
* Contract where you can sell/buy your currency over etherium, an exchange contract.

## Ready to use

* Contract with simple blockchain storage example, variables (SimpleStorage.sol);
* Token LibertyCoin contract (LibertyCoin.sol);
* LibertyCoin.sol tests for deployment, access balance and transfers (libertyCoin.test.js);
* ExchangeLicEth contract with possibility to buy, sell LIC for ETH, and also change exchange rate (ExchangeLicEth.sol);
* ExchangeLicEth.sol tests for deployment, buy tokens, sell tokens and set rate (exchangeLicEth.test.js);
* Web interface to increase and decrease value in blockchain stored variable;
* Web interface to transfer LIC tokens (LibertyCoin) from one account to a second account.
* Web interface to exchange LIC tokens and ETH tokens (ExchangeLicEth.sol).

## Before you begin
* download [Truffle](https://www.trufflesuite.com/truffle) to deploy contracts and run tests;
* download [Ganache](https://www.trufflesuite.com/ganache) and start your local blockchain;
* download [Metamask](https://metamask.io/) addon into your browser.

## Usage
* now let's compile contracts and deploy into ganache (do not forget to start ganache first) blockchain, in project root directory run:
```bash
   npm install
   truffle migrate
```
* and for the webpage, go to client folder and run:
```bash
   npm install
   npm run start
```

*"Wait a minute!! Are you saying that I have to run **npm install** twice??"*

Yep. Keep in mind that this is a blockchain application, and within we have a web application. So when running **npm install** in root folder we are installing dependencies for truffle and contracts tests.
All webpage related stuff is inside the **client** folder, so, there we have a second node_modules for our web application. The application will only access the blockchain through Metamask (security reasons, we are talking about a 'money' technology after al).

With Ganache running and Metamask installed, you can now open http://localhost:3000/ in your browser and interact with the contracts.

![StorageContract](https://github.com/moirrer/erc20-token-lic/blob/master/client/src/assets/tutorial/simple_storage.png?raw=true)
![TransferContract](https://github.com/moirrer/erc20-token-lic/blob/master/client/src/assets/tutorial/transfer_token.png?raw=true)
![ExchangeToken](https://github.com/moirrer/erc20-token-lic/blob/master/client/src/assets/tutorial/exchange_token.png?raw=true)
## Run tests
* in project root directory run:
```bash
   truffle test
```

## Next steps
* Cross-chains
* Lottery Systems

## License
[MIT](https://choosealicense.com/licenses/mit/)