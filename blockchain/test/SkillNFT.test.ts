import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("SkillNFT", function () {
  async function deployFixture() {
    const [owner, user, issuer] = await ethers.getSigners();

    const Registry = await ethers.getContractFactory("CertificationRegistry");
    const registry = await Registry.deploy();
    await registry.registerIssuer(issuer.address, "TestIssuer");

    const NFT = await ethers.getContractFactory("SkillNFT");
    const nft = await NFT.deploy(registry.target);

    return { registry, nft, owner, user, issuer };
  }

  it("Mints permanent credential", async function () {
    const { nft, user, issuer } = await loadFixture(deployFixture);
    await nft.connect(issuer).mintToUser(user.address, "ipfs://perm", 0, "Solidity");
    expect(await nft.ownerOf(1)).to.equal(user.address);
  });

  it("Mints rentable credential", async function () {
    const { nft, user, issuer } = await loadFixture(deployFixture);
    const expires = Math.floor(Date.now() / 1000) + 86400;
    await nft.connect(issuer).mintToUser(user.address, "ipfs://temp", expires, "Python");
    expect(await nft.userOf(1)).to.equal(user.address);
  });

  it("Soulbound: cannot transfer rental", async function () {
    const { nft, user, issuer } = await loadFixture(deployFixture);
    await nft.connect(issuer).mintToUser(user.address, "ipfs://temp", 9999999999, "JS");
    await expect(nft.connect(user).transferFrom(user.address, issuer.address, 1))
      .to.be.revertedWith("Soulbound: rental active");
  });
});