import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SkillChain", (m) => {
  const backendWallet = m.getParameter("backendWallet", "0x67064960A63eCAc39B07d4A8D33EE99B7e757cf4");

  // Deploy SkillNFT (with fixed setUser function)
  const skillNFT = m.contract("SkillNFT");
  
  // Deploy IssuanceAPI
  const issuanceAPI = m.contract("IssuanceAPI", [skillNFT, backendWallet]);
  
  // Deploy CredentialVerifier
  const verifier = m.contract("CredentialVerifier", [skillNFT]);
  
  return { skillNFT, issuanceAPI, verifier };
});