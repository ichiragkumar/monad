import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy XToken
  const XToken = await ethers.getContractFactory("XToken");
  const xToken = await XToken.deploy(deployer.address);
  await xToken.waitForDeployment();
  const xTokenAddress = await xToken.getAddress();
  console.log("XToken deployed to:", xTokenAddress);

  // Deploy AirdropHelper
  const AirdropHelper = await ethers.getContractFactory("AirdropHelper");
  const airdropHelper = await AirdropHelper.deploy();
  await airdropHelper.waitForDeployment();
  const airdropHelperAddress = await airdropHelper.getAddress();
  console.log("AirdropHelper deployed to:", airdropHelperAddress);

  console.log("\n=== Deployment Summary ===");
  console.log("XToken:", xTokenAddress);
  console.log("AirdropHelper:", airdropHelperAddress);
  console.log("\nUpdate TOKEN_CONTRACT_ADDRESS in src/config/wagmi.ts with:", xTokenAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


