const { getNamedAccounts } = require("hardhat");

describe("FundMe", async () => {
  let fundMe;
  let deployer;
  const sendValue = ethers.utils.parseEther("1");
  beforeEach(async () => {
    deployer = await getNamedAccounts().deployer;
    fundMe = await ethers.getContract("FundMe", deployer);  
  });
   
});
