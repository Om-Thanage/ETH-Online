// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./interfaces/ISkillNFT.sol";

interface ICertificationRegistry {
    function isVerifiedIssuer(address) external view returns (bool);
}

contract RentalManager {
    ISkillNFT public immutable skillNFT;
    address public immutable registry;

    event RentalExtended(uint256 indexed tokenId, uint64 newExpiresAt);
    event RentalRevoked(uint256 indexed tokenId);

    constructor(address _skillNFT, address _registry) {
        skillNFT = ISkillNFT(_skillNFT);
        registry = _registry;
    }

    modifier onlyVerifiedIssuer() {
        require(ICertificationRegistry(registry).isVerifiedIssuer(msg.sender), "Not issuer");
        _;
    }

    function extendRental(uint256 tokenId, uint64 additionalSeconds) external onlyVerifiedIssuer {
        address currentUser = skillNFT.userOf(tokenId);
        require(currentUser != address(0), "No active rental");

        uint64 currentExpires = skillNFT.userExpires(tokenId);
        uint64 newExpires = currentExpires + additionalSeconds;

        skillNFT.setUser(tokenId, currentUser, newExpires);
        emit RentalExtended(tokenId, newExpires);
    }

    function revokeRental(uint256 tokenId) external onlyVerifiedIssuer {
        skillNFT.setUser(tokenId, address(0), 0);
        emit RentalRevoked(tokenId);
    }
}