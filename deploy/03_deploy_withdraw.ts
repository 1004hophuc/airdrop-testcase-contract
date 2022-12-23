import { DeployFunction } from "hardhat-deploy/types"
import { getNamedAccounts, deployments, network, ethers } from "hardhat"
import { developmentChains } from "../helper-hardhat-config"
import { verify } from "../helper-functions"
import { AirdropFactory, MockERC20, VoteBattleReward } from "../typechain"

const deployFunction: DeployFunction = async () => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  // const busd: MockERC20 = await ethers.getContract("BUSD")

  await deploy("VoteBattleReward", {
    contract: "VoteBattleReward",
    from: deployer,
    log: true,
    args: [
      "0x3d5C3a7B63eAd1c6ae6E432b8d2dEeE61870A267",
      "0x3d5C3a7B63eAd1c6ae6E432b8d2dEeE61870A267",
      "0x51151b5C321c584d26C0DEeD57ee9de8e40A03A9",
      "0x3d5C3a7B63eAd1c6ae6E432b8d2dEeE61870A267",
    ],
  })

  const daoReward: VoteBattleReward = await ethers.getContract("VoteBattleReward")

  await verify(daoReward.address, [
    "0x3d5C3a7B63eAd1c6ae6E432b8d2dEeE61870A267",
    "0x3d5C3a7B63eAd1c6ae6E432b8d2dEeE61870A267",
    "0x51151b5C321c584d26C0DEeD57ee9de8e40A03A9",
    "0x3d5C3a7B63eAd1c6ae6E432b8d2dEeE61870A267",
  ])

  // await busd.approve(daoReward.address, ethers.utils.parseEther("20000000"))
  //   await daoRewarrd.withdrawPermit()
}

export default deployFunction
deployFunction.tags = [`all`, `withdraw`]