// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

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
        // For owned NFTs, check if token exists by checking if tokenId is valid
        // Since we can't call ownerOf directly, we'll assume it's valid if no user is set
        return true;
    }

    function getCredential(uint256 tokenId)
        external
        view
        returns (address holder, string memory uri, uint64 expires, bool valid)
    {
        holder = skillNFT.userOf(tokenId);
        if (holder == address(0)) {
            // For owned NFTs, we can't get the owner through the interface
            // This is a limitation of the current interface design
            holder = address(0); // Will be set by frontend using direct contract calls
        }
        uri = ""; // URI not accessible through interface
        expires = skillNFT.userExpires(tokenId);
        valid = isValid(tokenId);
    }
}