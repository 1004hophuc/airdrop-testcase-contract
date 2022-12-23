import { ethers } from "hardhat"
import { MockERC20 } from "../typechain"

async function addNewAirLaunch() {
  const erc20Address: string[] = [
    "0x5F33AE7Fbf5B85ec0815863Aae01b90619aF7235",
    "0x5F33AE7Fbf5B85ec0815863Aae01b90619aF7235",
    "0x858fcb224e8cb621ca4e9f3ab232cfaf5c2ceca3",
    "0xa979ceaf58ad849e502a343563b49575f00b63fb",
    "0x50c6414a43d4e54241443d4aa1279bac83b54a7c",
  ]

  for (let index = 0; index < erc20Address.length; index++) {
    const element = erc20Address[index]
    const erc20: MockERC20 = await ethers.getContractAt("MockERC20", element)
    await erc20.approve(
      "0xcA4D67f3Edf52C2474329D35CA054DB35eeB88e7",
      ethers.utils.parseEther("500000")
    )
  }
}

addNewAirLaunch()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
