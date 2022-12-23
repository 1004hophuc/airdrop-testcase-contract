import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { BigNumber, Signer } from "ethers"
import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import { AirdropFactory, VoteBattleReward, MockERC20 } from "../typechain"
import { signWithdraw } from "../utils/sign_data"

describe("Withdraw unit tests", async function () {
  let withdraw: VoteBattleReward,
    usdt: MockERC20,
    busd: MockERC20,
    wbnb: MockERC20,
    signers: SignerWithAddress[],
    deployer: string

  beforeEach(async () => {
    await deployments.fixture(["all"])
    withdraw = await ethers.getContract("VoteBattleReward")
    busd = await ethers.getContract("BUSD")
    wbnb = await ethers.getContract("WETH")
    usdt = await ethers.getContract("USDT")
    signers = await ethers.getSigners()
    deployer = (await getNamedAccounts()).deployer
  })

  describe("Withdraw Permit", async () => {
    it("Should revert", async () => {
      let _withdraw = await withdraw.connect(signers[1])

      await expect(_withdraw.setPause(true)).to.be.revertedWith(
        "Only the owner of contract can call this function"
      )

      await expect(_withdraw.setSigner(signers[1].address)).to.be.revertedWith(
        "Only the owner of contract can call this function"
      )
      await expect(_withdraw.setTreasuryAddress(signers[1].address)).to.be.revertedWith(
        "Only the owner of contract can call this function"
      )

      await expect(_withdraw.reOwner(signers[1].address)).to.be.revertedWith(
        "Only the owner of contract can call this function"
      )

      await withdraw.setPause(true)

      const withdrawValue = ethers.utils.parseEther("20")
      const nonce = await withdraw.nonce(deployer)

      const timeOut = Math.floor(Date.now() / 1000) + 3000

      const signedData = await signWithdraw(
        busd.address,
        withdrawValue.toString(),
        deployer,
        timeOut,
        nonce.toNumber()
      )

      await expect(
        withdraw.withdrawPermit(
          usdt.address,
          withdrawValue.toString(),
          deployer,
          timeOut,
          signedData.v,
          signedData.r,
          signedData.s
        )
      ).to.be.revertedWith("Deal token not available")

      await expect(
        withdraw.withdrawPermit(
          busd.address,
          withdrawValue.toString(),
          deployer,
          timeOut,
          signedData.v,
          signedData.r,
          signedData.s
        )
      ).to.be.revertedWith("Paused!")
    })

    it("Should withdraw permit work", async () => {
      const withdrawValue = ethers.utils.parseEther("20")
      const nonce = await withdraw.nonce(deployer)

      const timeOut = Math.floor(Date.now() / 1000) + 3000

      const signedData = await signWithdraw(
        busd.address,
        withdrawValue.toString(),
        deployer,
        timeOut,
        nonce.toNumber()
      )

      await withdraw.withdrawPermit(
        busd.address,
        withdrawValue.toString(),
        deployer,
        timeOut,
        signedData.v,
        signedData.r,
        signedData.s
      )
    })
  })
})
// yarn hardhat flatten ./contracts/LaunchpadNFT.sol > FlattenLaunchpad.sol
