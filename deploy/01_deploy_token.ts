import { DeployFunction } from "hardhat-deploy/types"
import { getNamedAccounts, deployments, network, ethers } from "hardhat"
import { developmentChains } from "../helper-hardhat-config"
import { verify } from "../helper-functions"

const deployFunction: DeployFunction = async () => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()


  if (developmentChains.includes(network.name)) {
    await deploy("BUSD", {
      contract: "MockERC20",
      from: deployer,
      log: true,
      args: ["BUSD", "BUSD", ethers.utils.parseEther("100000000000000000")],
    })

    await deploy("USDT", {
      contract: "MockERC20",
      from: deployer,
      log: true,
      args: ["BUSD", "BUSD", ethers.utils.parseEther("100000000000000000")],
    })

    await deploy("WETH", {
      contract: "WETH9",
      from: deployer,
      log: true,
      args: [],
    })
  }
}

export default deployFunction
deployFunction.tags = [`all`, `testnet`]
