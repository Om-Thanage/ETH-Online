import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("RentalManager", function () {
  async function deployFixture() {
    const [owner, user, issuer] = await ethers.getSigners();

    const Registry = await ethers.getContractFactory("CertificationRegistry");
    const registry = await Registry.deploy();
    await registry.registerIssuer(issuer.address, "TestIssuer");

    const NFT = await ethers.getContractFactory("SkillNFT");
    const nft = await NFT.deploy(registry.target);

    const Manager = await ethers.getContractFactory("RentalManager");
    const manager = await Manager.deploy(nft.target, registry.target);

    const expires = Math.floor(Date.now() / 1000) + 86400;
    await nft.connect(issuer).mintToUser(user.address, "ipfs://temp", expires, "JS");

    return { nft, manager, user, issuer };
  }

  it("Extends rental", async function () {
    const { manager, issuer } = await loadFixture(deployFixture);
    await manager.connect(issuer).extendRental(1, 86400);
    // Verify via userExpires
  });

  it("Revokes rental", async function () {
    const { manager, issuer } = await loadFixture(deployFixture);
    await manager.connect(issuer).revokeRental(1);
    expect(await manager.skillNFT.userOf(1)).to.equal("0x0000000000000000000000000000000000000000");
  });
});