const { deployments, ethers, getNamedAccounts, network } = require('hardhat');
const { assert, expect } = require('chai');
const { developmentChain } = require('../../helper-hardhat-config');

!developmentChain.includes(network.name)
  ? describe.skip
  : describe('FundMe', () => {
      let fundMe;
      let deployer;
      let mockV3Aggregator;
      // Our smart contract expects value in wei so we use utils parse
      const sendValue = ethers.utils.parseEther('1'); // 1eth
      beforeEach(async () => {
        // Deploy our fundme contract using hardhat deploy
        deployer = (await getNamedAccounts()).deployer;
        // We are targeting deploy folder with tag = "all" which we set
        await deployments.fixture(['all']);
        // Most recent fund me contact
        fundMe = await ethers.getContract('FundMe', deployer);
        mockV3Aggregator = await ethers.getContract(
          'MockV3Aggregator',
          deployer
        );
      });

      // Constructor testing
      describe('constructor', async () => {
        it('sets the aggregator addresses correctly', async () => {
          const response = await fundMe.getPriceFeed();
          assert.equal(response, mockV3Aggregator.address);
        });
      });

      // Fund function testing
      describe('fund', async () => {
        it("Fails if you don't spend enoung ETH", async () => {
          await expect(fundMe.fund()).to.be.revertedWith(
            'No enough ether sent'
          );
        });
        it('Updates the amount funded', async () => {
          // Funding contract for real
          await fundMe.fund({ value: sendValue });
          // Getting the amount from addrrestoamount mapping
          const response = await fundMe.getAddressToAmountFunded(deployer);
          // Compare what is in contact and what was sent
          assert.equal(response.toString(), sendValue.toString());
        });
        it('Add getFunder to array of getFunder', async () => {
          // Funding contract for real
          await fundMe.fund({ value: sendValue });
          // Getting the first funder from getFunder array
          const resp = await fundMe.getFunder(0);
          // Comparing the founder we get with deployer
          assert.equal(resp, deployer);
        });
      });

      // Withdraw func testing
      describe('withdraw', async () => {
        // Funding contact so we can test withdraw func
        beforeEach(async () => {
          // Send some eth
          await fundMe.fund({ value: sendValue });
        });
        it('Withdraw ETH from a single founder', async () => {
          // Arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          // Act
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          // Getting gas
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          // Assert
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });
        it('allows us to withdraw with multiple getFunder', async () => {
          // ARRANGE
          const accounts = await ethers.getSigners();
          // There are 20 accounts on our local node
          for (let i = 1; i < 6; i++) {
            // Connect with all of the acc
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          // ACT
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          // Getting gas
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          // ASSERT
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
          // Make sure that the getFunder are reset properly, so array at 0 position
          // should throw error
          await expect(fundMe.getFunder(0)).to.be.reverted;

          // We need to check if mapping is empthy
          for (i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });
        it('only owner can withdraw funds', async () => {
          const accounts = await ethers.getSigners();
          const attacker = accounts[3];
          const attackerConnContract = await fundMe.connect(attacker);
          await expect(attackerConnContract.withdraw()).to.be.reverted;
        });
        // Test cheaper version
        it('cheaperWithdraw testing...', async () => {
          // ARRANGE
          const accounts = await ethers.getSigners();
          // There are 20 accounts on our local node
          for (let i = 1; i < 6; i++) {
            // Connect with all of the acc
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          // ACT
          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          // Getting gas
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          // ASSERT
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
          // Make sure that the getFunder are reset properly, so array at 0 position
          // should throw error
          await expect(fundMe.getFunder(0)).to.be.reverted;

          // We need to check if mapping is empthy
          for (i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });
      });
    });
