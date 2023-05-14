const { ethers, getNamedAccounts } = require('hardhat');

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract('FundMe', deployer);
  console.log('Withdrawing....');
  const txResp = await fundMe.withdraw();
  await txResp.wait(1);
  console.log('Withdraw finished');
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
