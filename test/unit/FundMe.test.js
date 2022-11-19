const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
describe("FundMe", async function () {
  let fundMe;
  let deployer; 
  let mockV3Aggregator;
  const sendValue = ethers.utils.parseEther("1");
  const lessValue = ethers.utils.parseEther("0.000005"); //converts eth to wei

  beforeEach(async function () {
    //using Hardhat --deploy
    //deploy our fundMe contract
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["all"]);
    // run all deploy scripts using above line of code
    fundMe = await ethers.getContract("FundMe", deployer); //gives recent deployment//since deployer is passed everytime as an arguement everytransaction is executed by deployer
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });
  //outer one for contract and inner ones for individual
  describe("constructor", async function () {
    it("sets the aggregator address correctly", async function () {
      const response = await fundMe.priceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });
  });

  describe("fund", async function () {
    it("fails if not enough eth", async function () {
      await expect(fundMe.fund()).to.be.reverted;
      // With("Need to spend more eth");
    });
    it("updates the amount funded data structure", async function () {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.addressToAmountFunded(deployer);
      assert.equal(response.toString(), sendValue.toString());
    });
    it("Adds funder to array of funders", async function () {
      await fundMe.fund({ value: sendValue });
      const funder = await fundMe.funders(0);
      assert.equal(funder, deployer);
    });
  });
  describe("withdraw", async function () {
    beforeEach(async function () {
      await fundMe.fund({ value: sendValue });
    });
    it("withdraw ETH from a single founder", async function () {
      //arrange
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );
      //act
      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);
      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      //assert
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );
    });
    it("allows us to withdraw with multiple funds", async function () {
      const accounts = await ethers.getSigners();
      for (let index = 0; index < 6; index++) {
        const fundMeConnectedContract = await fundMe.connect(accounts[index]); //connect the fake account holders to the contract
        await fundMeConnectedContract.fund({ value: sendValue });
      }
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      //act
      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      //assert
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );
      await expect(fundMe.funders(0)).to.be.reverted;
      for (let index = 1; index < 6; index++) {
        assert.equal(
          await fundMe.addressToAmountFunded(accounts[index].address),
          0
        );
      }
    });

    it("only allows the owner to withdraw", async function () {
      const accounts = await ethers.getSigners();
      const attacker = accounts[1];
      const attackerConnectedContract = await fundMe.connect(attacker);
      await expect(attackerConnectedContract.withdraw()).to.be.reverted;
      // With(
      //   // if code breaks this statement handles the error
      //   "FundMe__NotOwner"
      // );
    });
  });
  
});
