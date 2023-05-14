const { network } = require('hardhat');
const {
  developmentChain,
  DECIMALS,
  INIT_ANSWER,
} = require('../helper-hardhat-config');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { log, deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  if (developmentChain.includes(network.name)) {
    log('Local network detected! Deploying mocks...');
    await deploy('MockV3Aggregator', {
      from: deployer,
      log: true,
      // Mock is taking two params in args DECIMALS AND INITAL PRICEFEED
      args: [DECIMALS, INIT_ANSWER],
    });
    log('Mocks deployed!');
    log('-----------------------------------------');
  }
};

module.exports.tags = ['all', 'mocks'];
