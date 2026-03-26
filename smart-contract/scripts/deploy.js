const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying EduCredential contract...");

  const EduCredential = await hre.ethers.getContractFactory("EduCredential");
  const credential = await EduCredential.deploy();
  await credential.waitForDeployment();

  const address = await credential.getAddress();
  console.log(`✅ EduCredential deployed to: ${address}`);
  console.log(`📡 Network: ${hre.network.name}`);
  console.log(`\nUpdate CONTRACT_ADDRESS in .env to: ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deploy failed:", error);
    process.exit(1);
  });
