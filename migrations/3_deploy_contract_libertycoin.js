var contract = artifacts.require("./LibertyCoin.sol");

module.exports = function(deployer) {
  deployer.deploy(contract);
};
