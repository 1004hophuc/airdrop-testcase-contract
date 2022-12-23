import { ethers } from "hardhat"

const withdrawType = ['address', 'uint256', 'address', 'uint256', 'uint256']

export async function signWithdraw(
  withdrawToken: string,
  value: string,
  sender: string,
  timeout: number,
  nonce: number
) {

  const signer = (await ethers.getSigners())[0]
  const abiCoder = new ethers.utils.AbiCoder()
  const data = ethers.utils.keccak256(abiCoder.encode(withdrawType, [withdrawToken, value, sender, timeout, nonce]))
  const singedData = await signer.signMessage(ethers.utils.arrayify(data))
  
  const r = singedData.slice(0, 66)
  const s = "0x" + singedData.slice(66, 130)
  const v = Number("0x" + singedData.slice(130, 132))
  return {
    v,
    r,
    s,
  }
}
