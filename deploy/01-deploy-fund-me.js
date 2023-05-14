const { network, ethers } = require('hardhat');
const { networkConfig, developmentChain } = require('../helper-hardhat-config');
const { verify } = require('../utils/verify');

// When we run deploy script hre runs this func and pass these params in to it
module.exports = async hre => {
  const {
    getNamedAccounts,
    deployments: { log, deploy },
  } = hre;
  // Check namedaccounts at 10:20:11
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // Dynamic pricefeed
  let ethUsdPriceFeedAddress;
  if (developmentChain.includes(network.name)) {
    const ethUsdAggregator = await deployments.get('MockV3Aggregator');
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]['ethUsdPriceFeed'];
  }

  const args = [ethUsdPriceFeedAddress];

  // we will use mock data when we are using localhost or hardhat
  const fundMe = await deploy('FundMe', {
    from: deployer,
    args: args, // put price feed address
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log('------------------------------------------------');

  if (
    !developmentChain.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, args);
  }
};

module.exports.tags = ['all', 'fundme'];
