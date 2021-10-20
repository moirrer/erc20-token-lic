# Libertycoin

## About
Simple ERC20 token creation, test and web interface with REACT and Metamask.

* Token Libertycoin (LIC) contract (LibertyCoin.sol);
* LibertyCoin.sol tests for deployment, access balance and transfers (success and fails);
* Contract with simple blockchain storage example, variables (SimpleStorage.sol);
* Web interface to increase and decrease value from blockchain stored variable;
* Web interface to transfer LIC tokens from one account to a second account.

## Usage
* download [Ganache](https://www.trufflesuite.com/ganache) and start your local blockchain;
* download [Metamask](https://metamask.io/) addon into your browser;
* in project root directory run (will compile contracts and deploy into ganache blockchain):
```bash
   truffle migrate
```
* go to client folder and run:
```bash
   npm install
   npm run start
```
If you have Ganache and Metamask working, you can now open http://localhost:3000/ in your browser and interact with the contracts.

## Run tests
* in project root directory run:
```bash
   truffle test
```


Have fun 0/
 
## Next steps
* (1) exchangeLicEth contract with rate set in contract and possibility to change
* (2) exchangeLicEth tests (set rate, buy and sell)
* (3) exchangeLicEth buy and sell token web interface

## License
[MIT](https://choosealicense.com/licenses/mit/)