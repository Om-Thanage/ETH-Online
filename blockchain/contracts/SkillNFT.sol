// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./ERC4907.sol";
import "./interfaces/ISkillNFT.sol";

/**
 * @title SkillNFT
 * @dev ERC-721 + ERC-4907 + Soulbound
 * NOTE: All issuer validation happens in Next.js backend
 */
contract SkillNFT is ERC721, ERC721URIStorage, ERC4907, ISkillNFT {
    uint256 private _nextTokenId;

    event CredentialMinted(
        uint256 indexed tokenId,
        address indexed user,
        uint64 expiresAt,
        string skill,
        address indexed issuer
    );

    constructor()
        ERC721("SkillCredential", "SKILL")
        ERC4907()
    {}

    function mintToUser(
        address to,
        string memory uri,
        uint64 expires,
        string memory skill
    ) external returns (uint256) {
        uint256 tokenId = ++_nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        if (expires > 0) {
            setUser(tokenId, to, expires);
        }

        emit CredentialMinted(tokenId, to, expires, skill, msg.sender);
        return tokenId;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        if (from != address(0) && to != address(0)) {
            require(userOf(tokenId) == address(0), "Soulbound: rental active");
        }
    }

    function setUser(uint256 tokenId, address user, uint64 expires) 
        public override(ERC4907, ISkillNFT) {
        ERC4907.setUser(tokenId, user, expires);
    }

    function userOf(uint256 tokenId) 
        public view override(ERC4907, ISkillNFT) returns (address) {
        return ERC4907.userOf(tokenId);
    }

    function userExpires(uint256 tokenId) 
        public view override(ERC4907, ISkillNFT) returns (uint64) {
        return ERC4907.userExpires(tokenId);
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId) 
        internal view override returns (bool) {
        address owner = ownerOf(tokenId);
        return (spender == owner || isApprovedForAll(owner, spender) || getApproved(tokenId) == spender);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721URIStorage, ERC4907) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId) 
        public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return ERC721URIStorage.tokenURI(tokenId);
    }
}