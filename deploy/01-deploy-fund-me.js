//import
//main function
//calling of main function

// module.exports = async (hre) => {
//   const { getNamedAccounts, deployments } = hre;

// };
const { network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  log(deployer, network.name); //mentioned in config
  const chainId = network.config.chainId;
  //when going to use localhost or hardhat network we want to  use a mock\
  let ethUsdPriceFeedAddress;
  if (chainId == 31337) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address; //gives address of recent deployment
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeedAddress], //put price feed address
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (chainId != 31337 && process.env.ETHERSCAN_API_KEY) {
    //verify 
    await verify(fundMe.address, [ethUsdPriceFeedAddress]);
  }
};
module.exports.tags = ["all", "fundme"]; //only run this script
