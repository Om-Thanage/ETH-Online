const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const backendWallet = process.env.BACKEND_WALLET || "0xYourBackendWallet";

  // 2. Deploy SkillNFT
  const SkillNFT = await hre.ethers.getContractFactory("SkillNFT");
  const skillNFT = await SkillNFT.deploy(registry.target);
  await skillNFT.waitForDeployment();
  console.log("SkillNFT deployed to:", skillNFT.target);

  // 3. Deploy RentalManager
  const RentalManager = await hre.ethers.getContractFactory("RentalManager");
  const rentalMgr = await RentalManager.deploy(skillNFT.target, registry.target);
  await rentalMgr.waitForDeployment();
  console.log("RentalManager deployed to:", rentalMgr.target);

  // 4. Deploy IssuanceAPI
  const IssuanceAPI = await hre.ethers.getContractFactory("IssuanceAPI");
  const issuanceAPI = await IssuanceAPI.deploy(skillNFT.target, backendWallet);
  await issuanceAPI.waitForDeployment();
  console.log("IssuanceAPI deployed to:", issuanceAPI.target);

  console.log("\nDEPLOYED ADDRESSES:");
  console.log("CERTIFICATION_REGISTRY=", registry.target);
  console.log("SKILL_NFT=", skillNFT.target);
  console.log("RENTAL_MANAGER=", rentalMgr.target);
  console.log("ISSUANCE_API=", issuanceAPI.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});