// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./ERC4907.sol";
import "./interfaces/ISkillNFT.sol";

interface ICertificationRegistry {
    function isVerifiedIssuer(address) external view returns (bool);
}

/**
 * @title SkillNFT
 * @dev ERC-721 + ERC-4907 + Soulbound (permanent)
 */
contract SkillNFT is ERC721, ERC721URIStorage, ERC4907, ISkillNFT {
    uint256 private _nextTokenId;
    address public immutable registry;

    event CredentialMinted(
        uint256 indexed tokenId,
        address indexed user,
        uint64 expiresAt,
        string skill,
        address indexed issuer
    );

    constructor(address _registry)
        ERC721("SkillCredential", "SKILL")
        ERC4907("SkillCredential", "SKILL")
    {
        registry = _registry;
    }

    modifier onlyVerifiedIssuer() {
        require(ICertificationRegistry(registry).isVerifiedIssuer(msg.sender), "Not verified");
        _;
    }

    function mintToUser(
        address to,
        string memory uri,
        uint64 expires,
        string memory skill
    ) external onlyVerifiedIssuer returns (uint256) {
        uint256 tokenId = ++_nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        if (expires > 0) {
            _setUser(tokenId, to, expires);
        }

        emit CredentialMinted(tokenId, to, expires, skill, msg.sender);
        return tokenId;
    }

    // Soulbound for permanent credentials
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId, 1);
        if (from != address(0) && to != address(0)) {
            require(userOf(tokenId) == address(0), "Soulbound: rental active");
        }
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId)
        internal view override returns (bool)
    {
        return ERC721._isApprovedOrOwner(spender, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721URIStorage, ERC4907) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
}