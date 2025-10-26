import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Deployment module for SkillChain v2 (with URI update capability)
 * 
 * To deploy:
 * npx hardhat ignition deploy ./ignition/modules/DeploySkillChainV2.ts --network polygonAmoy
 */
const SkillChainV2Module = buildModule("SkillChainV2Module", (m) => {
  // Deploy SkillNFTv2 (upgraded version with URI updates)
  const skillNFTv2 = m.contract("SkillNFTv2");

  // Deploy CredentialVerifier
  const credentialVerifier = m.contract("CredentialVerifier", [skillNFTv2]);

  // Deploy RentalManager (requires a registry address)
  // For now, we'll use a placeholder - update this with your actual registry
  const registryPlaceholder = m.getParameter("registryAddress", "0x0000000000000000000000000000000000000000");
  const rentalManager = m.contract("RentalManager", [skillNFTv2, registryPlaceholder]);

  // Get backend wallet address from environment or use deployer
  const backendAddress = m.getParameter("backendAddress", m.getAccount(0));
  
  // Deploy IssuanceAPI
  const issuanceAPI = m.contract("IssuanceAPI", [skillNFTv2, backendAddress]);

  return {
    skillNFTv2,
    credentialVerifier,
    rentalManager,
    issuanceAPI,
  };
});

export default SkillChainV2Module;
