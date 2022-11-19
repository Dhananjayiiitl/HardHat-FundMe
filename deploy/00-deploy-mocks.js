const { network } = require("hardhat");

const DECIMALS = "8";
const INITIAL_ANSWER = "200000000000";
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts(); //mentioned in config
  const chainId = network.config.chainId;
  //when going to use localhost or hardhat network we want to  use a mock

  if (chainId == 31337) {
    log("Local network detected!! deploying mock");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER], ///here we pass constructor arguments
    });
    log("Mocks Deployed");
    log("----------------------------------------------------------------");
  }
};
module.exports.tags = ["all", "mocks"]; //only run mocks script
