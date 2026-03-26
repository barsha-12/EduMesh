// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EduCredential
 * @dev ERC-721 NFT-based learning credential for EduMesh platform.
 * Each credential is a unique token with metadata stored on IPFS.
 * Only authorized issuers (owner) can mint new credentials.
 */
contract EduCredential is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Mapping from tokenId to credential metadata
    struct CredentialData {
        address student;
        string subject;
        string level;
        uint256 issuedAt;
        bool valid;
    }

    mapping(uint256 => CredentialData) public credentials;
    mapping(address => bool) public authorizedIssuers;

    // Events
    event CredentialIssued(
        address indexed studentAddress,
        uint256 indexed tokenId,
        string subject,
        string level,
        uint256 timestamp
    );

    event IssuerAuthorized(address indexed issuer);
    event IssuerRevoked(address indexed issuer);

    constructor() ERC721("EduMesh Credential", "EDUC") Ownable(msg.sender) {
        authorizedIssuers[msg.sender] = true;
    }

    modifier onlyAuthorized() {
        require(authorizedIssuers[msg.sender] || msg.sender == owner(), "Not authorized to issue credentials");
        _;
    }

    /**
     * @dev Authorize a new issuer address.
     * @param issuer Address to authorize.
     */
    function authorizeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }

    /**
     * @dev Revoke an issuer's authorization.
     * @param issuer Address to revoke.
     */
    function revokeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer);
    }

    /**
     * @dev Issue a new credential NFT to a student.
     * @param student Wallet address of the student.
     * @param subject Subject area (e.g., "Mathematics").
     * @param level Achievement level (e.g., "Intermediate").
     * @param metadataURI IPFS URI for the credential metadata.
     * @return tokenId The ID of the newly minted credential.
     */
    function issueCredential(
        address student,
        string memory subject,
        string memory level,
        string memory metadataURI
    ) external onlyAuthorized returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(student, tokenId);
        _setTokenURI(tokenId, metadataURI);

        credentials[tokenId] = CredentialData({
            student: student,
            subject: subject,
            level: level,
            issuedAt: block.timestamp,
            valid: true
        });

        emit CredentialIssued(student, tokenId, subject, level, block.timestamp);

        return tokenId;
    }

    /**
     * @dev Verify a credential's validity and return its metadata URI.
     * @param tokenId The token ID to verify.
     * @return valid Whether the credential is valid.
     * @return metadataURI The IPFS metadata URI.
     * @return student The student's address.
     * @return subject The credential subject.
     * @return level The credential level.
     * @return issuedAt The timestamp of issuance.
     */
    function verifyCredential(uint256 tokenId) external view returns (
        bool valid,
        string memory metadataURI,
        address student,
        string memory subject,
        string memory level,
        uint256 issuedAt
    ) {
        require(tokenId < _nextTokenId, "Token does not exist");

        CredentialData memory cred = credentials[tokenId];
        return (
            cred.valid,
            tokenURI(tokenId),
            cred.student,
            cred.subject,
            cred.level,
            cred.issuedAt
        );
    }

    /**
     * @dev Revoke a credential (e.g., if issued in error).
     * @param tokenId The token to revoke.
     */
    function revokeCredential(uint256 tokenId) external onlyOwner {
        require(tokenId < _nextTokenId, "Token does not exist");
        credentials[tokenId].valid = false;
    }

    /**
     * @dev Get total number of credentials issued.
     */
    function totalIssued() external view returns (uint256) {
        return _nextTokenId;
    }

    // Required overrides for ERC721URIStorage
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
