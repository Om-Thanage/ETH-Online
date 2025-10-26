import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SkillChain", (m) => {
  const backendWallet = m.getParameter("backendWallet", "0x67064960A63eCAc39B07d4A8D33EE99B7e757cf4");

  // Use existing SkillNFT address (already deployed)
  const skillNFTAddress = "0x0F46259A86b79011d40Af2038172fEfc4E673eC5";
  
  // Deploy IssuanceAPI
  const issuanceAPI = m.contract("IssuanceAPI", [skillNFTAddress, backendWallet]);
  
  // Deploy CredentialVerifier
  const verifier = m.contract("CredentialVerifier", [skillNFTAddress]);
  
  return { issuanceAPI, verifier };
});