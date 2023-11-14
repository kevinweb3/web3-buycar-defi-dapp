import "@nomicfoundation/hardhat-toolbox";
import { ethers } from "hardhat";

async function main() {
    const [owner, tipper, tipper2, tipper3] = await ethers.getSigners();


    const contract = require("../artifacts/contracts/Buycar.sol/Buycar.json");
    const contractInfo = require("../contractInfo/Buycar.json");

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

    const addresses = [
        owner.address,
        tipper.address,
        tipper2.address,
        tipper3.address,
    ];

    await(printBalances(addresses));
    const tip = {value: ethers.parseEther("1")};
    // await buycarContract.connect(tipper).buyCar("Audi", "You're the best!", tip);
    // await buycarContract.connect(tipper2).buyCar("BMW", "Amazing teacher", tip);
    // await buycarContract.connect(tipper3).buyCar("GLE", "I love my Proof of Knowledge", tip);

    await printBalances(addresses);
    await buycarContract.withdrawTips();

    await printBalances(addresses);
    const memos = await buycarContract.getMemos();
    printMemos(memos);
}

async function getBalance(address: any) {
    const balanceBigInt = ethers.getBigInt(address);
    return ethers.formatEther(balanceBigInt);
}

async function printBalances(addresses: any) {
    let idx = 0;
    for (const address of addresses) {
      console.log(`Address ${idx} balance: `, await getBalance(address));
      idx++;
    }
}

async function printMemos(memos: any) {
    for (const memo of memos) {
      const timestamp = memo.timestamp;
      const tipper = memo.name;
      const tipperAddress = memo.from;
      const message = memo.message;
      console.log(`At ${timestamp}, ${tipper} (${tipperAddress}) said: "${message}"`);
    }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });