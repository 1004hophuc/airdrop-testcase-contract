import { ethers } from "hardhat"
import { AirdropFactory } from "../typechain"

async function addNewAirLaunch() {
  const airFactory: AirdropFactory = await ethers.getContract("AirdropFactory")

  const erc20Address: string[] = [
    "0x5F33AE7Fbf5B85ec0815863Aae01b90619aF7235",
    "0x5F33AE7Fbf5B85ec0815863Aae01b90619aF7235",
    "0x858fcb224e8cb621ca4e9f3ab232cfaf5c2ceca3",
    "0xa979ceaf58ad849e502a343563b49575f00b63fb",
    "0x50c6414a43d4e54241443d4aa1279bac83b54a7c",
  ]

  for (let index = 0; index < erc20Address.length; index++) {
    const element = erc20Address[index]

    const randomAddress: AirdropFactory.WhiteListAirModifierStruct[] = Array.from(
      Array(100),
      (item, index) => {
        return {
          wallet: ethers.Wallet.createRandom().address,
          claimAmount: ethers.utils.parseEther(randNumToString(0, 1000)),
          isClaimed: false,
        }
      }
    )

    const airData: AirdropFactory.WhiteListAirModifierStruct[] = [
      {
        wallet: "0x3E63C1DED1612e7297697c60F6cfa97D4dB05fF9",
        claimAmount: ethers.utils.parseEther(randNumToString(0, 1000)),
        isClaimed: false,
      },
      {
        wallet: "0x1088725f456fFb14635db800cDc756e0425E638F",
        claimAmount: ethers.utils.parseEther(randNumToString(0, 1000)),
        isClaimed: false,
      },
      {
        wallet: "0x7AEBe9e45b7e69533CeBfD800c5B45b90C368761",
        claimAmount: ethers.utils.parseEther(randNumToString(0, 1000)),
        isClaimed: false,
      },
      {
        wallet: "0x7F792Dd19F238D14eDC02b6b515850CAa9959F79",
        claimAmount: ethers.utils.parseEther(randNumToString(0, 1000)),
        isClaimed: false,
      },
      {
        wallet: "0xB87390Eeb2f16aD2E684242Db83e2cC52B1eBE54",
        claimAmount: ethers.utils.parseEther(randNumToString(0, 1000)),
        isClaimed: false,
      },
      {
        wallet: "0xA5AE13Ab689539c970C7700e9926C4bfb93F2B13",
        claimAmount: ethers.utils.parseEther(randNumToString(0, 1000)),
        isClaimed: false,
      },
      {
        wallet: "0x39e60DbCd2C901D7158bc677d9a5439458f60Da1",
        claimAmount: ethers.utils.parseEther(randNumToString(0, 1000)),
        isClaimed: false,
      },
      {
        wallet: "0xE4Dc7DeA3B14E1Eb719F08AD213bEf1de6Dd86b8",
        claimAmount: ethers.utils.parseEther(randNumToString(0, 1000)),
        isClaimed: false,
      },
      {
        wallet: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        claimAmount: ethers.utils.parseEther(randNumToString(0, 1000)),
        isClaimed: false,
      },
      {
        wallet: "0x0B9Ba4A7AEfEd55D51E6BAC4EeDe647AD21DD7b2",
        claimAmount: ethers.utils.parseEther(randNumToString(0, 1000)),
        isClaimed: false,
      },
      {
        wallet: "0x608a0fa7775e1DDC5dDf9Cd35E264e906043d61A",
        claimAmount: ethers.utils.parseEther(randNumToString(0, 1000)),
        isClaimed: false,
      },
      ...randomAddress,
    ]

    await airFactory.createNewAirdropLaunch(
      element,
      "0xDA6839464c46857E8DA02b9a677B2383ab9697cb",
      ethers.utils.parseEther("500000"),
      Math.ceil(Date.now() / 1000) + 5000,
      0,
      airData
    )
  }
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
