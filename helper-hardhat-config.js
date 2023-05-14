const networkConfig = {
  31337: {
    name: 'localhost',
  },
  11155111: {
    name: 'sepolia',
    ethUsdPriceFeed: '0x694AA1769357215DE4FAC081bf1f309aDC325306',
  },
};

const developmentChain = ['hardhat', 'localhost'];
const DECIMALS = 8;
// Mock pricefeed
const INIT_ANSWER = 200000000000;

module.exports = {
  networkConfig,
  developmentChain,
  DECIMALS,
  INIT_ANSWER,
};
