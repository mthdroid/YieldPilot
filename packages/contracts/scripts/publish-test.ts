import { ethers } from "hardhat";

async function main() {
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);

  const registries: Record<number, string> = {
    56: "0xF5726c5D8C47A9B278e610917E9c7191bc3e135E",
    204: "0xFED653FBE3371E11243A4772589A2cA3Aea859F0",
  };

  const registryAddress = registries[chainId];
  if (!registryAddress) {
    console.log(`No registry for chain ${chainId}`);
    return;
  }

  const [deployer] = await ethers.getSigners();
  console.log(`Publishing test strategy on chain ${chainId} with ${deployer.address}`);

  const contract = await ethers.getContractAt("StrategyRegistry", registryAddress);

  // Create a demo strategy hash
  const strategyHash = ethers.keccak256(ethers.toUtf8Bytes(`YieldPilot-demo-strategy-${chainId}-${Date.now()}`));

  const tx = await contract.publishStrategy(
    deployer.address,   // walletAnalyzed (self)
    42,                  // riskScore (moderate)
    1250,               // expectedAPY (12.50%)
    4,                   // protocolCount
    strategyHash,        // strategyHash
    "",                  // strategyURI (empty for now)
    chainId              // chainId
  );

  const receipt = await tx.wait();
  console.log(`\nStrategy published!`);
  console.log(`  TX: ${receipt!.hash}`);
  console.log(`  Chain: ${chainId}`);
  console.log(`  Strategy Hash: ${strategyHash}`);

  const count = await contract.getStrategyCount();
  console.log(`  Token ID: ${count}`);
  console.log(`  Total strategies: ${count}`);
}

main().catch(console.error);
