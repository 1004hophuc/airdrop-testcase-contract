import { DeployFunction } from "hardhat-deploy/types"
import { getNamedAccounts, deployments, network, ethers } from "hardhat"
import { developmentChains } from "../helper-hardhat-config"
import { verify } from "../helper-functions"
import { AirdropFactory } from "../typechain"

const deployFunction: DeployFunction = async () => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  await deploy("AirdropFactory", {
    contract: "AirdropFactory",
    from: deployer,
    log: true,
    args: [],
  })

  const airFactory: AirdropFactory = await ethers.getContract("AirdropFactory")

  const whiteListUpdater = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("WHITELIST_UPDATER"))

  await airFactory.grantRole(whiteListUpdater, deployer)

  if (!developmentChains.includes(network.name) && process.env.BSCSCAN_API_KEY) {
    const air: AirdropFactory = await ethers.getContract("AirdropFactory")
    await verify(air.address, [])
  }
}

export default deployFunction
deployFunction.tags = [`all`, `airdrop`]
