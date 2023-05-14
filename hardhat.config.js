require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();
// To veify and update code on etherscan
require('@nomiclabs/hardhat-etherscan');
// To see how much gas we are spending on contract, and interecation with it
require('hardhat-gas-reporter');
// To see how much code is coverage, how much code doesn't have test
require('solidity-coverage');
// hardhat deploy
require('hardhat-deploy');

const SEPOLIA_RPC_URL =
  process.env.SEPOLIA_RPC_URL ||
  'https://eth-sepolia.g.alchemy.com/v2/your-api-key';
const PRIVATE_KEY =
  process.env.PRIVATE_KEY ||
  '0x11ee3108a03081fe260ecdc106554d09d9d1209bcafd46942b10e02943effc4a';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || '';

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 6,
    },
  },
  // solidity: '0.8.18',
  solidity: {
    compilers: [{ version: '0.8.18' }, { version: '0.6.6' }],
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    outputFile: 'gas-reporter.txt',
    noColors: true,
    currency: 'USD',
    // coinmarketcap: COINMARKETCAP_API_KEY,
    token: 'MATIC',
  },
  namedAccounts: {
    deployer: {
      // First account of the accounts array in networks
      default: 0,
      1: 0,
    },
  },
};
