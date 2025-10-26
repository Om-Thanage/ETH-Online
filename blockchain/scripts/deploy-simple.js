import fs from "fs"
import hre from "hardhat";
const connection = await hre.network.connect();
async function main() {
  const [deployer] = await connection.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await connection.ethers.provider.getBalance(deployer.address)).toString());

  const backendWallet = process.env.BACKEND_WALLET || "0x67064960A63eCAc39B07d4A8D33EE99B7e757cf4";
  console.log("Backend wallet:", backendWallet);

  // 1. Deploy SkillNFT
  console.log("\nDeploying SkillNFT...");
  const SkillNFT = await connection.ethers.getContractFactory("SkillNFT");
  const skillNFT = await SkillNFT.deploy();
  await skillNFT.waitForDeployment();
  const skillNFTAddress = await skillNFT.getAddress();
  console.log("✅ SkillNFT deployed to:", skillNFTAddress);

//   // 2. Deploy IssuanceAPI
//   console.log("\nDeploying IssuanceAPI...");
//   const IssuanceAPI = await connection.ethers.getContractFactory("IssuanceAPI");
//   const issuanceAPI = await IssuanceAPI.deploy(skillNFTAddress, backendWallet);
//   await issuanceAPI.waitForDeployment();
//   const issuanceAPIAddress = await issuanceAPI.getAddress();
//   console.log("✅ IssuanceAPI deployed to:", issuanceAPIAddress);

//   // 3. Deploy CredentialVerifier
//   console.log("\nDeploying CredentialVerifier...");
//   const CredentialVerifier = await connection.ethers.getContractFactory("CredentialVerifier");
//   const verifier = await CredentialVerifier.deploy(skillNFTAddress);
//   await verifier.waitForDeployment();
//   const verifierAddress = await verifier.getAddress();
//   console.log("✅ CredentialVerifier deployed to:", verifierAddress);

  console.log("\n===========================================");
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("===========================================");
  console.log("SKILL_NFT=", skillNFTAddress);
  console.log("ISSUANCE_API=", issuanceAPIAddress);
  console.log("CREDENTIAL_VERIFIER=", verifierAddress);
  console.log("BACKEND_WALLET=", backendWallet);
  console.log("===========================================\n");

  // Save addresses to a file
  const deploymentInfo = {
    network: connection.network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      SkillNFT: skillNFTAddress,
      IssuanceAPI: issuanceAPIAddress,
      CredentialVerifier: verifierAddress,
    },
    backendWallet: backendWallet,
  };

  fs.writeFileSync(
    `deployment-${connection.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`✅ Deployment info saved to deployment-${connection.network.name}.json\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
