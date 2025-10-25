// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./interfaces/ISkillNFT.sol";

contract IssuanceAPI {
    ISkillNFT public immutable skillNFT;
    address public immutable backend;

    event CredentialIssued(uint256 indexed tokenId, address indexed user);

    constructor(address _skillNFT, address _backend) {
        skillNFT = ISkillNFT(_skillNFT);
        backend = _backend;
    }

    modifier onlyBackend() {
        require(msg.sender == backend, "Not backend");
        _;
    }

    function issueCredential(
        address user,
        string memory uri,
        uint64 expires,
        string memory skill
    ) external onlyBackend returns (uint256) {
        uint256 tokenId = skillNFT.mintToUser(user, uri, expires, skill);
        emit CredentialIssued(tokenId, user);
        return tokenId;
    }
}