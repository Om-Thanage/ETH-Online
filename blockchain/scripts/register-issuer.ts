import { ethers } from "hardhat";

async function main() {
  const [admin] = await ethers.getSigners();
  const registry = await ethers.getContractAt(
    "CertificationRegistry",
    "0xYourDeployedRegistry"
  );

  await registry.registerIssuer("0xUdemyIssuer", "Udemy");
  console.log("Udemy registered");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});