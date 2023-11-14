import "@nomicfoundation/hardhat-toolbox";
import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  const [deployer] = await ethers.getSigners();
  const address = deployer.address;
  console.log("获取部署合约账户地址：", address);

  const contractFactory = await ethers.getContractFactory("Buycar");
  const deployContract = await contractFactory.deploy();
  await deployContract.waitForDeployment();

  const contractAddress = await deployContract.getAddress();
  console.log("合约部署地址：", contractAddress);

  // 获取部署合约信息保存到本地文件，供前端合约交互使用
  const contractInfos = {
    // contractName: await deployContract.name(),
    // contractSymbol: await deployContract.symbol(),
    // contractTotalSupply: String(await deployContract.totalSupply()),
    // contractBalance: String(await deployContract.balanceOf(address)),
    contractAddress,
  };

  // 将合约地址和部署账户信息生成json文件传给前端
  saveFrontendFiles("Buycar", contractInfos);
}

function saveFrontendFiles(
  name: string,
  _contractInfos: { contractAddress: string}
) {
  const contractsAddressDir = __dirname + "/../contractInfo";

  if (!fs.existsSync(contractsAddressDir)) {
    fs.mkdirSync(contractsAddressDir);
  }

  const path = contractsAddressDir + '/' + name + ".json";

  fs.writeFileSync(path, JSON.stringify(_contractInfos, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
