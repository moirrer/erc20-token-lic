var LC = artifacts.require("./LibertyCoin.sol");
var ELE = artifacts.require("./ExchangeLicEth.sol");

module.exports = async (deployer) => {
  await deployer.deploy(LC)
  const token = await LC.deployed()
  
  await deployer.deploy(ELE, token.address)

  const exchange = await ELE.deployed()
  await token.transfer(exchange.address, '100000000000000000000')
};
