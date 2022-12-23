import { ethers } from "hardhat"
import { AirdropFactory } from "../typechain"

async function addNewAirLaunch() {
  const airFactory: AirdropFactory = await ethers.getContract("AirdropFactory")

  const airData: AirdropFactory.WhiteListAirModifierStruct[] = [
    {
      wallet: "0xA9E463380C0d0588c1E42236282Ef9b4C6233dB4",
      claimAmount: ethers.utils.parseEther(randNumToString(0, 100)),
      isClaimed: false,
    },
  ]

  await airFactory.updateAirLaunchUserData(1, airData)
}

function randNumToString(from: number, to: number): string {
  const randN = (Math.ceil(Math.random() * 1000) % (to - from)) + from
  return randN.toString()
}

addNewAirLaunch()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
