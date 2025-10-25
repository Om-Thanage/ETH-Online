// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/ISkillNFT.sol";

contract CredentialVerifier {
    ISkillNFT public immutable skillNFT;

    constructor(address _skillNFT) {
        skillNFT = ISkillNFT(_skillNFT);
    }

    function isValid(uint256 tokenId) public view returns (bool) {
        address user = skillNFT.userOf(tokenId);
        if (user != address(0)) {
            return skillNFT.userExpires(tokenId) > block.timestamp;
        }
        try skillNFT.ownerOf(tokenId) returns (address) {
            return true;
        } catch {
            return false;
        }
    }

    function getCredential(uint256 tokenId)
        external
        view
        returns (address holder, string memory uri, uint64 expires, bool valid)
    {
        holder = skillNFT.userOf(tokenId);
        if (holder == address(0)) {
            holder = skillNFT.ownerOf(tokenId);
        }
        uri = skillNFT.tokenURI(tokenId);
        expires = skillNFT.userExpires(tokenId);
        valid = isValid(tokenId);
    }
}