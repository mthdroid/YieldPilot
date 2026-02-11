import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying StrategyRegistry with:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "BNB");

  const StrategyRegistry = await ethers.getContractFactory("StrategyRegistry");
  const registry = await StrategyRegistry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  const network = await ethers.provider.getNetwork();

  console.log("\nStrategyRegistry deployed!");
  console.log("  Address:", address);
  console.log("  Network:", network.name, `(chainId: ${network.chainId})`);

  const deployData = {
    address,
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  const deployPath = path.join(__dirname, "..", "deployment.json");
  fs.writeFileSync(deployPath, JSON.stringify(deployData, null, 2));
  console.log("\nDeployment info saved to deployment.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
