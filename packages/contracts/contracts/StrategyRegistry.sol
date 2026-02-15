// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IStrategyRegistry.sol";

/// @title YieldPilot AI DeFi Agent Registry
/// @notice On-chain registry for AI DeFi agents and their strategy reports (ERC-721 NFTs)
/// @dev Implements AI agent on-chain identity inspired by BNB Chain NFA standards.
///      Each AI agent registers with analysis modules and builds verifiable reputation
///      through published strategies. Strategies are minted as NFTs for immutable proof.
contract StrategyRegistry is ERC721URIStorage, Ownable, IStrategyRegistry {
    uint256 private _nextTokenId;

    // Agent identity registry
    mapping(address => AgentProfile) private _agents;
    address[] private _registeredAgents;

    // Strategy data
    mapping(uint256 => Strategy) private _strategies;
    mapping(address => uint256[]) private _creatorStrategies;

    uint256 public totalStrategies;
    uint256 public totalProtocolsAnalyzed;
    uint256 public totalAgents;

    constructor() ERC721("YieldPilot Strategy", "YPS") Ownable(msg.sender) {}

    // ═══════════════════════════════════════════════════════════════
    //  AI AGENT IDENTITY
    // ═══════════════════════════════════════════════════════════════

    /// @notice Register an AI agent with on-chain identity and analysis modules
    /// @param name Human-readable agent name (e.g. "YieldPilot DeFi Agent")
    /// @param version Agent version string (e.g. "1.0.0")
    /// @param modules JSON-encoded module list (e.g. '["health","yield","il","liquidation"]')
    function registerAgent(
        string calldata name,
        string calldata version,
        string calldata modules
    ) external {
        require(bytes(name).length > 0, "Agent name required");
        require(bytes(version).length > 0, "Agent version required");

        bool isUpdate = _agents[msg.sender].registeredAt != 0;

        _agents[msg.sender] = AgentProfile({
            name: name,
            version: version,
            modules: modules,
            totalStrategies: _agents[msg.sender].totalStrategies,
            avgRiskScore: _agents[msg.sender].avgRiskScore,
            registeredAt: isUpdate ? _agents[msg.sender].registeredAt : block.timestamp,
            active: true
        });

        if (!isUpdate) {
            _registeredAgents.push(msg.sender);
            totalAgents++;
            emit AgentRegistered(msg.sender, name, version);
        } else {
            emit AgentProfileUpdated(msg.sender, name, version);
        }
    }

    /// @notice Get the on-chain profile of a registered AI agent
    function getAgentProfile(address agent) external view returns (AgentProfile memory) {
        require(_agents[agent].registeredAt != 0, "Agent not registered");
        return _agents[agent];
    }

    /// @notice Check if an address is a registered agent
    function isRegisteredAgent(address agent) external view returns (bool) {
        return _agents[agent].registeredAt != 0;
    }

    /// @notice Get all registered agent addresses
    function getRegisteredAgents() external view returns (address[] memory) {
        return _registeredAgents;
    }

    // ═══════════════════════════════════════════════════════════════
    //  STRATEGY REPORTS (ERC-721 NFTs)
    // ═══════════════════════════════════════════════════════════════

    /// @notice Publish a new DeFi strategy and mint it as an NFT
    /// @dev If the caller is a registered agent, their reputation is updated automatically
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

        // Update agent reputation if caller is a registered agent
        if (_agents[msg.sender].registeredAt != 0) {
            AgentProfile storage agent = _agents[msg.sender];
            uint256 prevTotal = agent.totalStrategies;
            agent.avgRiskScore = (agent.avgRiskScore * prevTotal + riskScore) / (prevTotal + 1);
            agent.totalStrategies = prevTotal + 1;
        }

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
