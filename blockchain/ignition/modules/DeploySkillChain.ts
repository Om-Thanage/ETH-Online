import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SkillChain", (m) => {
  const backendWallet = m.getParameter("backendWallet", "0xYourBackendWallet");

  const registry = m.contract("CertificationRegistry");
  const skillNFT = m.contract("SkillNFT", [registry]);
  const rentalMgr = m.contract("RentalManager", [skillNFT, registry]);
  const issuanceAPI = m.contract("IssuanceAPI", [skillNFT, backendWallet]);
  const verifier = m.contract("CredentialVerifier", [skillNFT]);

  return { registry, skillNFT, rentalMgr, issuanceAPI, verifier };
});