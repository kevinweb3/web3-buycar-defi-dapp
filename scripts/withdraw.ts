import { ethers } from "hardhat";
const contract = require("../artifacts/contracts/Buycar.sol/Buycar.json");
const contractInfo = require("../contractInfo/Buycar.json");
require('dotenv').config();

async function main() {
    // Get Alchemy App URL
    const API_KEY = process.env.REACT_APP_ALCHEMY_Sepolia_API_KEY;

    // Define an Alchemy Provider
    const provider = new ethers.AlchemyProvider('sepolia', API_KEY);
    // Create a signer
    const privateKey: any = process.env.REACT_APP_PRIVATE_KEY;
    const signer = new ethers.Wallet(privateKey, provider)

    // Get contract ABI and address
    const abi = contract.abi;
    const contractAddress = contractInfo.contractAddress;

    // Create a contract instance
    const buycarContract = new ethers.Contract(contractAddress, abi, signer)

    console.log("current balance of owner: ", await getBalance(provider, signer.address), "ETH");
    const contractBalance = await getBalance(provider, contract.address);
    console.log("current balance of contract: ", await getBalance(provider, contract.address), "ETH");

    if (contractBalance !== "0.0") {
      console.log("withdrawing funds..")
      const withdrawTxn = await buycarContract.withdrawTips();
      await withdrawTxn.wait();
    } else {
      console.log("no funds to withdraw!");
    }
}

async function getBalance(provider: Object, address: any) {
  const balanceBigInt = ethers.getBigInt(address);
  return ethers.formatEther(balanceBigInt);
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });