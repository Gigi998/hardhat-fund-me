const { ethers, getNamedAccounts } = require('hardhat');

async function main() {
  const sendValue = ethers.utils.parseEther('0.1');
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract('FundMe', deployer);
  console.log('Funding contract....');
  const txResponse = await fundMe.fund({ value: sendValue });
  await txResponse.wait(1);
  console.log('Funded');
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
