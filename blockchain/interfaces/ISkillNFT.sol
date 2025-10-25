// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ISkillNFT {
    function mintToUser(
        address to,
        string memory uri,
        uint64 expires,
        string memory skill
    ) external returns (uint256);

    function setUser(uint256 tokenId, address user, uint64 expires) external;
    function userOf(uint256 tokenId) external view returns (address);
    function userExpires(uint256 tokenId) external view returns (uint64);
}