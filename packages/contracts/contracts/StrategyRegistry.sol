// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IStrategyRegistry.sol";

/// @title YieldPilot Strategy Registry
/// @notice On-chain registry of DeFi portfolio strategies as ERC-721 NFTs
/// @dev Each strategy analysis is minted as an NFT with metadata stored on-chain
contract StrategyRegistry is ERC721URIStorage, Ownable, IStrategyRegistry {
    uint256 private _nextTokenId;

    mapping(uint256 => Strategy) private _strategies;
    mapping(address => uint256[]) private _creatorStrategies;

    uint256 public totalStrategies;
    uint256 public totalProtocolsAnalyzed;

    constructor() ERC721("YieldPilot Strategy", "YPS") Ownable(msg.sender) {}

    /// @notice Publish a new DeFi strategy and mint it as an NFT
    function publishStrategy(
        address walletAnalyzed,
        uint8 riskScore,
        uint16 expectedAPY,
        uint8 protocolCount,
        bytes32 strategyHash,
        string calldata strategyURI,
        uint256 chainId
    ) external returns (uint256 tokenId) {
        require(riskScore <= 100, "Risk score must be 0-100");
        require(strategyHash != bytes32(0), "Strategy hash required");
        require(protocolCount > 0, "Must include at least one protocol");

        _nextTokenId++;
        tokenId = _nextTokenId;

        _strategies[tokenId] = Strategy({
            creator: msg.sender,
            walletAnalyzed: walletAnalyzed,
            riskScore: riskScore,
            expectedAPY: expectedAPY,
            protocolCount: protocolCount,
            strategyHash: strategyHash,
            strategyURI: strategyURI,
            timestamp: block.timestamp,
            chainId: chainId
        });

        _creatorStrategies[msg.sender].push(tokenId);
        totalStrategies++;
        totalProtocolsAnalyzed += protocolCount;

        _mint(msg.sender, tokenId);
        if (bytes(strategyURI).length > 0) {
            _setTokenURI(tokenId, strategyURI);
        }

        emit StrategyPublished(tokenId, msg.sender, riskScore, expectedAPY, protocolCount);
        return tokenId;
    }

    /// @notice Get strategy by token ID
    function getStrategy(uint256 tokenId) external view returns (Strategy memory) {
        require(_ownerOf(tokenId) != address(0), "Strategy does not exist");
        return _strategies[tokenId];
    }

    /// @notice Get all strategy token IDs by a specific creator
    function getStrategiesByCreator(address creator) external view returns (uint256[] memory) {
        return _creatorStrategies[creator];
    }

    /// @notice Get total number of strategies
    function getStrategyCount() external view returns (uint256) {
        return totalStrategies;
    }

    /// @notice Update the strategy URI (only token owner)
    function updateStrategyURI(uint256 tokenId, string calldata newURI) external {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        _setTokenURI(tokenId, newURI);
        emit StrategyURIUpdated(tokenId, newURI);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721URIStorage) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
