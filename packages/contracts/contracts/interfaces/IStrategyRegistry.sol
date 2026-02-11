// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IStrategyRegistry {
    struct Strategy {
        address creator;
        address walletAnalyzed;
        uint8 riskScore;          // 0-100 (0 = safest)
        uint16 expectedAPY;       // basis points (e.g., 1250 = 12.50%)
        uint8 protocolCount;      // number of protocols in strategy
        bytes32 strategyHash;     // SHA256 of the full strategy JSON
        string strategyURI;       // IPFS or URL to full strategy
        uint256 timestamp;
        uint256 chainId;
    }

    event StrategyPublished(
        uint256 indexed tokenId,
        address indexed creator,
        uint8 riskScore,
        uint16 expectedAPY,
        uint8 protocolCount
    );

    event StrategyURIUpdated(uint256 indexed tokenId, string newURI);

    function publishStrategy(
        address walletAnalyzed,
        uint8 riskScore,
        uint16 expectedAPY,
        uint8 protocolCount,
        bytes32 strategyHash,
        string calldata strategyURI,
        uint256 chainId
    ) external returns (uint256 tokenId);

    function getStrategy(uint256 tokenId) external view returns (Strategy memory);
    function getStrategiesByCreator(address creator) external view returns (uint256[] memory);
    function getStrategyCount() external view returns (uint256);
    function updateStrategyURI(uint256 tokenId, string calldata newURI) external;
}
