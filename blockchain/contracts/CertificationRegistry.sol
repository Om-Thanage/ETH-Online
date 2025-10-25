// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title CertificationRegistry
 * @dev Whitelist of trusted issuers
 */
contract CertificationRegistry {
    mapping(address => bool) public isVerifiedIssuer;
    mapping(address => string) public issuerName;

    address public immutable admin;

    event IssuerRegistered(address indexed issuer, string name);
    event IssuerUnregistered(address indexed issuer);

    constructor() {
        admin = msg.sender;
        isVerifiedIssuer[msg.sender] = true;
        issuerName[msg.sender] = "Admin";
        emit IssuerRegistered(msg.sender, "Admin");
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    function registerIssuer(address issuer, string memory name) external onlyAdmin {
        require(issuer != address(0), "Zero address");
        require(bytes(name).length > 0, "Empty name");
        require(!isVerifiedIssuer[issuer], "Already issuer");

        isVerifiedIssuer[issuer] = true;
        issuerName[issuer] = name;
        emit IssuerRegistered(issuer, name);
    }

    function unregisterIssuer(address issuer) external onlyAdmin {
        require(isVerifiedIssuer[issuer], "Not issuer");
        isVerifiedIssuer[issuer] = false;
        delete issuerName[issuer];
        emit IssuerUnregistered(issuer);
    }
}