// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IStrategyRegistry — AI DeFi Agent Registry Interface
/// @notice Defines the interface for YieldPilot's on-chain AI agent identity and strategy system
/// @dev Inspired by BNB Chain NFA (Non-Fungible Agent) standards for AI agent on-chain identity
interface IStrategyRegistry {
    /// @notice On-chain identity for an AI DeFi strategy agent
    struct AgentProfile {
        string name;
        string version;
        string modules;         // JSON-encoded list of analysis modules
        uint256 totalStrategies;
        uint256 avgRiskScore;   // weighted average risk score across strategies
        uint256 registeredAt;
        bool active;
    }

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

    event AgentRegistered(address indexed agent, string name, string version);
    event AgentProfileUpdated(address indexed agent, string name, string version);

    event StrategyPublished(
        uint256 indexed tokenId,
        address indexed creator,
        uint8 riskScore,
        uint16 expectedAPY,
        uint8 protocolCount
    );

    event StrategyURIUpdated(uint256 indexed tokenId, string newURI);

    function registerAgent(
        string calldata name,
        string calldata version,
        string calldata modules
    ) external;

    function getAgentProfile(address agent) external view returns (AgentProfile memory);

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
