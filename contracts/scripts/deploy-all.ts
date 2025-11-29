import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

const { ethers } = hre;

async function main() {
  const signers = await ethers.getSigners();
  
  if (signers.length === 0) {
    console.error("\n❌ ERROR: No deployment account found!");
    console.error("\nPlease set up your deployment account:");
    console.error("1. Create a .env file in the contracts/ directory");
    console.error("2. Add your private key: PRIVATE_KEY=your_private_key_here");
    console.error("3. Add RPC URL: MONAD_TESTNET_RPC=https://testnet-rpc.monad.xyz");
    console.error("\n⚠️  Never commit your .env file to git!");
    process.exit(1);
  }

  const [deployer] = signers;

  console.log("=".repeat(60));
  console.log("Deploying Monad Micropayments Platform Contracts");
  console.log("=".repeat(60));
  console.log("\nDeploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  const contracts: { [key: string]: string } = {};

  try {
    // 1. Deploy XToken
    console.log("1. Deploying XToken...");
    const XToken = await ethers.getContractFactory("XToken");
    const xToken = await XToken.deploy(deployer.address);
    await xToken.waitForDeployment();
    const xTokenAddress = await xToken.getAddress();
    contracts.XToken = xTokenAddress;
    console.log("   ✓ XToken deployed to:", xTokenAddress);

    // 2. Deploy AirdropHelper
    console.log("\n2. Deploying AirdropHelper...");
    const AirdropHelper = await ethers.getContractFactory("AirdropHelper");
    const airdropHelper = await AirdropHelper.deploy();
    await airdropHelper.waitForDeployment();
    const airdropHelperAddress = await airdropHelper.getAddress();
    contracts.AirdropHelper = airdropHelperAddress;
    console.log("   ✓ AirdropHelper deployed to:", airdropHelperAddress);

    // 3. Deploy ENSSubdomainRegistrar (if ENS registry address is provided)
    const ensRegistryAddress = process.env.ENS_REGISTRY_ADDRESS;
    const ensResolverAddress = process.env.ENS_RESOLVER_ADDRESS;
    const parentNode = process.env.ENS_PARENT_NODE; // bytes32 hex string

    if (ensRegistryAddress && ensResolverAddress && parentNode) {
      console.log("\n3. Deploying ENSSubdomainRegistrar...");
      try {
        // Ensure addresses are valid hex (not ENS names) to avoid resolution errors
        const registryAddr = ethers.getAddress(ensRegistryAddress);
        const resolverAddr = ethers.getAddress(ensResolverAddress);
        
        const ENSRegistrar = await ethers.getContractFactory("ENSSubdomainRegistrar");
        const ensRegistrar = await ENSRegistrar.deploy(
          registryAddr,
          resolverAddr,
          parentNode,
          deployer.address
        );
        await ensRegistrar.waitForDeployment();
        const ensRegistrarAddress = await ensRegistrar.getAddress();
        contracts.ENSSubdomainRegistrar = ensRegistrarAddress;
        console.log("   ✓ ENSSubdomainRegistrar deployed to:", ensRegistrarAddress);
      } catch (error: any) {
        console.log("   ⚠️  ENSSubdomainRegistrar deployment failed:", error.message);
        console.log("   This is expected if ENS is not available on this network");
        console.log("   You can deploy it later when ENS infrastructure is available");
      }
    } else {
      console.log("\n3. Skipping ENSSubdomainRegistrar (missing env variables)");
      console.log("   Set ENS_REGISTRY_ADDRESS, ENS_RESOLVER_ADDRESS, and ENS_PARENT_NODE to deploy");
      console.log("   Note: ENS may not be available on Monad testnet yet");
    }

    // Get network info
    const network = await ethers.provider.getNetwork();

    // Save deployment addresses
    const deploymentInfo = {
      network: network.name || 'unknown',
      chainId: network.chainId.toString(),
      deployer: deployer.address,
      contracts,
      timestamp: new Date().toISOString(),
    };

    const networkName = network.name || 'unknown';
    // Use process.cwd() to get the contracts directory
    const outputDir = path.join(process.cwd(), 'deployments');
    const outputPath = path.join(outputDir, `${networkName}.json`);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));

    console.log("\n" + "=".repeat(60));
    console.log("Deployment Summary");
    console.log("=".repeat(60));
    console.log(JSON.stringify(deploymentInfo, null, 2));
    console.log("\n✓ Deployment info saved to:", outputPath);
    console.log("\n⚠️  IMPORTANT: Update contract addresses in src/config/wagmi.ts");
    console.log("=".repeat(60));

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
