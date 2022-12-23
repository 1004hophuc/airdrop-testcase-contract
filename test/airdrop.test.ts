import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { BigNumber, Signer } from "ethers"
import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import { AirdropFactory, MockERC20 } from "../typechain"

describe("Launchpad unit tests", async function () {
  let airFactory: AirdropFactory,
    usdt: MockERC20,
    busd: MockERC20,
    wbnb: MockERC20,
    signers: SignerWithAddress[],
    deployer: string,
    airDataLaunch1: AirdropFactory.WhiteListAirModifierStruct[],
    mapSignerWithAddress: Map<string, SignerWithAddress> = new Map()

  beforeEach(async () => {
    await deployments.fixture(["all"])
    airFactory = await ethers.getContract("AirdropFactory")
    busd = await ethers.getContract("BUSD")
    wbnb = await ethers.getContract("WETH")
    usdt = await ethers.getContract("USDT")
    signers = await ethers.getSigners()
    deployer = (await getNamedAccounts()).deployer

    for (let index = 0; index < signers.length; index++) {
      const element = signers[index]
      mapSignerWithAddress.set(element.address, element)
    }

    airDataLaunch1 = [
      {
        wallet: signers[1].address,
        claimAmount: ethers.utils.parseEther("150"),
        isClaimed: false,
      },
      {
        wallet: signers[2].address,
        claimAmount: ethers.utils.parseEther("100"),
        isClaimed: false,
      },
      {
        wallet: signers[3].address,
        claimAmount: ethers.utils.parseEther("200"),
        isClaimed: false,
      },
      {
        wallet: signers[4].address,
        claimAmount: ethers.utils.parseEther("130"),
        isClaimed: false,
      },
      {
        wallet: signers[5].address,
        claimAmount: ethers.utils.parseEther("180"),
        isClaimed: false,
      },
      {
        wallet: signers[6].address,
        claimAmount: ethers.utils.parseEther("50"),
        isClaimed: false,
      },
      {
        wallet: signers[7].address,
        claimAmount: ethers.utils.parseEther("150"),
        isClaimed: false,
      },
      {
        wallet: signers[8].address,
        claimAmount: ethers.utils.parseEther("500"),
        isClaimed: false,
      },
    ]

    await airFactory.createNewAirdropLaunch(
      busd.address,
      deployer,
      ethers.utils.parseEther("5000"),
      Math.ceil(Date.now() / 1000) + 3600,
      0,
      airDataLaunch1
    )

    await airFactory.createNewAirdropLaunch(
      usdt.address,
      deployer,
      ethers.utils.parseEther("150"),
      Math.ceil(Date.now() / 1000) + 3600,
      0,
      airDataLaunch1
    )

    await airFactory.createNewAirdropLaunch(
      usdt.address,
      deployer,
      ethers.utils.parseEther("100"),
      Math.ceil(Date.now() / 1000) + 3600,
      0,
      airDataLaunch1
    )

    await busd.approve(airFactory.address, ethers.utils.parseEther("5000"))
  })

  describe("Add air drop", async function () {
    it("Add new airdrop", async () => {
      await airFactory.createNewAirdropLaunch(
        usdt.address,
        deployer,
        ethers.utils.parseEther("1000"),
        Math.ceil(Date.now() / 1000) + 3600,
        0,
        [
          {
            wallet: signers[1].address,
            claimAmount: ethers.utils.parseEther("150"),
            isClaimed: false,
          },
          {
            wallet: signers[2].address,
            claimAmount: ethers.utils.parseEther("100"),
            isClaimed: false,
          },
        ]
      )

      const launchData = await airFactory.launches(3)

      assert.equal(launchData.rewardAirToken, usdt.address)
      assert.equal(launchData.treasuryAddress, deployer)
      assert.equal(launchData.totalAirCap.toString(), ethers.utils.parseEther("1000").toString())
      assert.equal(launchData.currentClaimedAmount.toNumber(), 0)
    })
  })

  describe("Claim air drop", async function () {
    it("Should revert", async () => {
      const _airSig1 = await airFactory.connect(signers[1])
      const _airSig2 = await airFactory.connect(signers[2])
      await expect(_airSig1.claimAirdrop(0)).to.be.revertedWith("Launch claim time not start yet")

      await expect(_airSig1.disableLaunch(0)).to.be.revertedWith("Ownable: caller is not the owner")

      await airFactory.addBlackList([signers[1].address])
      await expect(_airSig1.claimAirdrop(0)).to.be.revertedWith("User is in blacklist")

      await airFactory.delBlackList([signers[1].address])
      await expect(_airSig1.claimAirdrop(3)).to.be.revertedWith("Launchpad not found")

      await airFactory.disableLaunch(0)
      const launchData = await airFactory.launches(0)
      assert.equal(launchData.active, false)
      await expect(_airSig1.claimAirdrop(0)).to.be.revertedWith("Launch disable")

      await airFactory.reactiveLaunch(0)
      await network.provider.send("evm_increaseTime", [3650])
      await _airSig1.claimAirdrop(0)
      await expect(_airSig1.claimAirdrop(0)).to.be.revertedWith("User already claimed")

      await airFactory.updateCloseTime(0, Math.ceil(Date.now() / 1000) + 3600 * 2)
      await expect(_airSig2.claimAirdrop(0)).to.be.revertedWith("Launch closed")
      await network.provider.send("evm_increaseTime", [3650])
      await _airSig2.claimAirdrop(0)
    })

    it("Claim able", async () => {
      await network.provider.send("evm_increaseTime", [3650])

      for (let index = 0; index < airDataLaunch1.length; index++) {
        const element = airDataLaunch1[index]

        const balanceBefore = await busd.balanceOf(element.wallet)

        const launchDataBefore = await airFactory.launches(0)

        const onChainData = await airFactory.userData(element.wallet, 0)
        assert.equal(onChainData.claimAbleAmount.toString(), element.claimAmount.toString())

        const _airFactory = await airFactory.connect(mapSignerWithAddress.get(element.wallet)!)
        await _airFactory.claimAirdrop(0)
        const balanceAfter = await busd.balanceOf(element.wallet)

        assert.equal(
          onChainData.claimAbleAmount.toString(),
          balanceAfter.sub(balanceBefore).toString()
        )

        const launchDataAfter = await airFactory.launches(0)

        assert.equal(
          launchDataAfter.currentClaimedAmount
            .sub(launchDataBefore.currentClaimedAmount)
            .toString(),
          onChainData.claimAbleAmount.toString()
        )
      }
    })

    // it("Max cap reached", async () => {
    //   await airFactory.createNewAirdropLaunch(
    //     usdt.address,
    //     deployer,
    //     ethers.utils.parseEther("1000"),
    //     Math.ceil(Date.now() / 1000) + 3600,
    //     [
    //       {
    //         wallet: signers[1].address,
    //         claimAmount: ethers.utils.parseEther("150"),
    //         isClaimed: false,
    //       },
    //       {
    //         wallet: signers[2].address,
    //         claimAmount: ethers.utils.parseEther("100"),
    //         isClaimed: false,
    //       },
    //     ]
    //   )
    // })

    it("Not approve", async () => {
      await network.provider.send("evm_increaseTime", [3650])

      for (let index = 1; index < airDataLaunch1.length; index++) {
        const element = airDataLaunch1[index]

        const _airFactory = await airFactory.connect(mapSignerWithAddress.get(element.wallet)!)
        await expect(_airFactory.claimAirdrop(1)).to.be.revertedWith(
          "ERC20: insufficient allowance"
        )
      }
    })

    it("Max cap reached 1", async () => {
      await network.provider.send("evm_increaseTime", [3650])
      await usdt.approve(airFactory.address, ethers.utils.parseEther("150"))

      const balanceBefore = await usdt.balanceOf(signers[1].address)

      const _airFactory = await airFactory.connect(signers[1])
      const _airFactory2 = await airFactory.connect(signers[2])
      await _airFactory.claimAirdrop(1)

      const launchDataAfter = await airFactory.launches(1)

      const balanceAfter = await usdt.balanceOf(signers[1].address)

      assert.equal(
        launchDataAfter.currentClaimedAmount.toString(),
        launchDataAfter.totalAirCap.toString()
      )

      assert.equal(
        launchDataAfter.totalAirCap.toString(),
        balanceAfter.sub(balanceBefore).toString()
      )

      await expect(_airFactory2.claimAirdrop(1)).to.be.revertedWith("Max cap reached")
    })

    it("Max cap reached 2", async () => {
      await network.provider.send("evm_increaseTime", [3650])
      await usdt.approve(airFactory.address, ethers.utils.parseEther("150"))

      const balanceBefore = await usdt.balanceOf(signers[1].address)

      const _airFactory = await airFactory.connect(signers[1])
      const _airFactory2 = await airFactory.connect(signers[2])
      await _airFactory.claimAirdrop(2)

      const launchDataAfter = await airFactory.launches(2)

      const balanceAfter = await usdt.balanceOf(signers[1].address)

      assert.equal(
        launchDataAfter.currentClaimedAmount.toString(),
        launchDataAfter.totalAirCap.toString()
      )

      assert.equal(
        launchDataAfter.totalAirCap.toString(),
        balanceAfter.sub(balanceBefore).toString()
      )

      await expect(_airFactory2.claimAirdrop(2)).to.be.revertedWith("Max cap reached")
    })

    it("Update whitelist", async () => {
      const airDataLaunch100: AirdropFactory.WhiteListAirModifierStruct[] = Array.from(
        Array(100),
        (value, index) => {
          return {
            wallet: signers[index % signers.length].address,
            claimAmount: ethers.utils.parseEther(index.toString()),
            isClaimed: false,
          }
        }
      )

      let tx = await airFactory.updateAirLaunchUserData(0, airDataLaunch100)

      let receipt = await tx.wait()
      console.log("100 user white list gas used: " + receipt.cumulativeGasUsed)

      const airDataLaunch200: AirdropFactory.WhiteListAirModifierStruct[] = Array.from(
        Array(200),
        (value, index) => {
          return {
            wallet: signers[index % signers.length].address,
            claimAmount: ethers.utils.parseEther(index.toString()),
            isClaimed: false,
          }
        }
      )

      tx = await airFactory.updateAirLaunchUserData(0, airDataLaunch200)

      receipt = await tx.wait()
      console.log("200 user white list gas used: " + receipt.cumulativeGasUsed)

      const airDataLaunch300: AirdropFactory.WhiteListAirModifierStruct[] = Array.from(
        Array(300),
        (value, index) => {
          return {
            wallet: signers[index % signers.length].address,
            claimAmount: ethers.utils.parseEther(index.toString()),
            isClaimed: false,
          }
        }
      )

      tx = await airFactory.updateAirLaunchUserData(0, airDataLaunch300)

      receipt = await tx.wait()
      console.log("300 user white list gas used: " + receipt.cumulativeGasUsed)

      const airDataLaunch400: AirdropFactory.WhiteListAirModifierStruct[] = Array.from(
        Array(400),
        (value, index) => {
          return {
            wallet: signers[index % signers.length].address,
            claimAmount: ethers.utils.parseEther(index.toString()),
            isClaimed: false,
          }
        }
      )

      tx = await airFactory.updateAirLaunchUserData(0, airDataLaunch400)

      receipt = await tx.wait()
      console.log("400 user white list gas used: " + receipt.cumulativeGasUsed)

      // const airDataLaunch500: AirdropFactory.WhiteListAirModifierStruct[] = Array.from(
      //   Array(500),
      //   (value, index) => {
      //     return {
      //       wallet: signers[index % signers.length].address,
      //       claimAmount: ethers.utils.parseEther(index.toString()),
      //       isClaimed: false,
      //     }
      //   }
      // )

      // tx = await airFactory.updateAirLaunchUserData(0, airDataLaunch500)

      // receipt = await tx.wait()
      // console.log("500 user white list gas used: " + receipt.cumulativeGasUsed)
    })
  })
})
// yarn hardhat flatten ./contracts/LaunchpadNFT.sol > FlattenLaunchpad.sol
