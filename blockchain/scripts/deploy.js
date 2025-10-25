const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // 1. Deploy IssuerRegistry
  const IssuerRegistry = await hre.ethers.getContractFactory("IssuerRegistry");
  const issuerRegistry = await IssuerRegistry.deploy();
  await issuerRegistry.waitForDeployment();
  console.log("IssuerRegistry deployed to:", issuerRegistry.target);

  // 2. Deploy CertificationNFT
  const CertNFT = await hre.ethers.getContractFactory("CertificationNFT");
  const certNFT = await CertNFT.deploy(issuerRegistry.target);
  await certNFT.waitForDeployment();
  console.log("CertificationNFT deployed to:", certNFT.target);

  // 3. Deploy SkillRental
  const SkillRental = await hre.ethers.getContractFactory("SkillRental");
  const skillRental = await SkillRental.deploy(certNFT.target);
  await skillRental.waitForDeployment();
  console.log("SkillRental deployed to:", skillRental.target);

  // 4. Add test issuer (Udemy)
  // await issuerRegistry.addIssuer("0x70997970C51812dc3A010C7d01b50e0d17dc79C8", "Udemy");
  // console.log("Udemy added as issuer");

  // console.log("\nDEPLOYED ADDRESSES:");
  // console.log("ISSUER_REGISTRY=", issuerRegistry.target);
  // console.log("CERT_NFT=", certNFT.target);
  // console.log("SKILL_RENTAL=", skillRental.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});