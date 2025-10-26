// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ERC4907.sol";
import "./interfaces/ISkillNFT.sol";

/**
 * @title SkillNFTv2
 * @dev ERC-721 + ERC-4907 + Soulbound with URI update capability
 * NOTE: All issuer validation happens in Next.js backend
 * 
 * CHANGES FROM v1:
 * - Added updateTokenURI function for admin to fix metadata URIs
 * - Added Ownable for admin functions
 */
contract SkillNFTv2 is ERC721, ERC721URIStorage, ERC4907, Ownable, ISkillNFT {
    uint256 private _nextTokenId;
    
    // Mapping to track which addresses can update URIs (issuers/admins)
    mapping(address => bool) public isAuthorizedUpdater;

    event CredentialMinted(
        uint256 indexed tokenId,
        address indexed user,
        uint64 expiresAt,
        string skill,
        address indexed issuer
    );
    
    event TokenURIUpdated(
        uint256 indexed tokenId,
        string oldURI,
        string newURI,
        address updatedBy
    );

    constructor() ERC721("SkillCredential", "SKILL") ERC4907() Ownable(msg.sender) {
        // Contract deployer is the initial owner
        isAuthorizedUpdater[msg.sender] = true;
    }
    
    /**
     * @dev Add or remove authorized updaters (for issuers/admins)
     */
    function setAuthorizedUpdater(address updater, bool authorized) external onlyOwner {
        isAuthorizedUpdater[updater] = authorized;
    }

    /**
     * @dev Update token URI - only authorized updaters can call this
     * This is useful for migrating from ipfs:// to https:// gateway URLs
     */
    function updateTokenURI(uint256 tokenId, string memory newURI) external {
        require(
            isAuthorizedUpdater[msg.sender] || msg.sender == owner(),
            "Not authorized to update URI"
        );
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        
        string memory oldURI = tokenURI(tokenId);
        _setTokenURI(tokenId, newURI);
        
        emit TokenURIUpdated(tokenId, oldURI, newURI, msg.sender);
    }
    
    /**
     * @dev Batch update token URIs for migration
     */
    function batchUpdateTokenURIs(
        uint256[] calldata tokenIds,
        string[] calldata newURIs
    ) external {
        require(
            isAuthorizedUpdater[msg.sender] || msg.sender == owner(),
            "Not authorized to update URI"
        );
        require(tokenIds.length == newURIs.length, "Array length mismatch");
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(ownerOf(tokenIds[i]) != address(0), "Token does not exist");
            string memory oldURI = tokenURI(tokenIds[i]);
            _setTokenURI(tokenIds[i], newURIs[i]);
            emit TokenURIUpdated(tokenIds[i], oldURI, newURIs[i], msg.sender);
        }
    }

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
            _setUser(tokenId, to, expires);
        }

        emit CredentialMinted(tokenId, to, expires, skill, msg.sender);
        return tokenId;
    }
    
    // Internal function to set user without permission check (used during minting)
    function _setUser(uint256 tokenId, address user, uint64 expires) internal {
        UserInfo storage info = _users[tokenId];
        info.user = user;
        info.expires = expires;
        emit UpdateUser(tokenId, user, expires);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
        //uint256 batchSize
    ) internal view {
        if (from != address(0) && to != address(0)) {
            require(userOf(tokenId) == address(0), "Soulbound: rental active");
        }
    }

    function setUser(uint256 tokenId, address user, uint64 expires) 
        public override(ERC4907, ISkillNFT) {
        // Allow owner, approved addresses, or the token owner to set user
        address owner = ownerOf(tokenId);
        require(
            msg.sender == owner || 
            isApprovedForAll(owner, msg.sender) || 
            getApproved(tokenId) == msg.sender,
            "Not owner/approved"
        );
        
        UserInfo storage info = _users[tokenId];
        info.user = user;
        info.expires = expires;
        emit UpdateUser(tokenId, user, expires);
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
