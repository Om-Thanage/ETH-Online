// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.28;

/**
 * @title ERC4907 – Rentable NFTs
 */
abstract contract ERC4907 {

    struct UserInfo {
        address user;
        uint64 expires;
    }

    mapping(uint256 => UserInfo) internal _users;

    event UpdateUser(uint256 indexed tokenId, address indexed user, uint64 expires);

    function setUser(uint256 tokenId, address user, uint64 expires) public virtual {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not owner/approved");
        UserInfo storage info = _users[tokenId];
        info.user = user;
        info.expires = expires;
        emit UpdateUser(tokenId, user, expires);
    }

    function userOf(uint256 tokenId) public view virtual returns (address) {
        if (uint256(_users[tokenId].expires) >= block.timestamp) {
            return _users[tokenId].user;
        }
        return address(0);
    }

    function userExpires(uint256 tokenId) public view virtual returns (uint64) {
        return _users[tokenId].expires;
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view virtual returns (bool);

    function supportsInterface(bytes4 interfaceId) public view virtual returns (bool) {
        return interfaceId == type(ERC4907).interfaceId;
    }
}