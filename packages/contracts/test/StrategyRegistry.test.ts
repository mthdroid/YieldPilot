import { expect } from "chai";
import { ethers } from "hardhat";
import { StrategyRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("StrategyRegistry", () => {
  let registry: StrategyRegistry;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const STRATEGY_HASH = ethers.keccak256(ethers.toUtf8Bytes("strategy json content"));
  const WALLET = "0x1234567890123456789012345678901234567890";

  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("StrategyRegistry");
    registry = await Factory.deploy();
    await registry.waitForDeployment();
  });

  describe("Deployment", () => {
    it("should set correct name and symbol", async () => {
      expect(await registry.name()).to.equal("YieldPilot Strategy");
      expect(await registry.symbol()).to.equal("YPS");
    });

    it("should start with zero strategies", async () => {
      expect(await registry.getStrategyCount()).to.equal(0);
      expect(await registry.totalStrategies()).to.equal(0);
    });

    it("should support ERC-721 interface", async () => {
      expect(await registry.supportsInterface("0x80ac58cd")).to.be.true;
    });
  });

  describe("publishStrategy", () => {
    it("should mint NFT and store strategy data", async () => {
      const tx = await registry.connect(user1).publishStrategy(
        WALLET, 35, 1250, 3, STRATEGY_HASH, "https://example.com/strategy", 56
      );
      await tx.wait();

      expect(await registry.getStrategyCount()).to.equal(1);
      expect(await registry.ownerOf(1)).to.equal(user1.address);
      expect(await registry.totalStrategies()).to.equal(1);
    });

    it("should emit StrategyPublished event", async () => {
      await expect(
        registry.connect(user1).publishStrategy(
          WALLET, 35, 1250, 3, STRATEGY_HASH, "", 56
        )
      ).to.emit(registry, "StrategyPublished")
        .withArgs(1, user1.address, 35, 1250, 3);
    });

    it("should store complete strategy data", async () => {
      await registry.connect(user1).publishStrategy(
        WALLET, 42, 850, 5, STRATEGY_HASH, "ipfs://QmTest", 56
      );

      const strategy = await registry.getStrategy(1);
      expect(strategy.creator).to.equal(user1.address);
      expect(strategy.walletAnalyzed).to.equal(WALLET);
      expect(strategy.riskScore).to.equal(42);
      expect(strategy.expectedAPY).to.equal(850);
      expect(strategy.protocolCount).to.equal(5);
      expect(strategy.strategyHash).to.equal(STRATEGY_HASH);
      expect(strategy.chainId).to.equal(56);
    });

    it("should revert if riskScore > 100", async () => {
      await expect(
        registry.connect(user1).publishStrategy(
          WALLET, 101, 1000, 2, STRATEGY_HASH, "", 56
        )
      ).to.be.revertedWith("Risk score must be 0-100");
    });

    it("should revert if strategyHash is zero", async () => {
      await expect(
        registry.connect(user1).publishStrategy(
          WALLET, 50, 1000, 2, ethers.ZeroHash, "", 56
        )
      ).to.be.revertedWith("Strategy hash required");
    });

    it("should revert if protocolCount is zero", async () => {
      await expect(
        registry.connect(user1).publishStrategy(
          WALLET, 50, 1000, 0, STRATEGY_HASH, "", 56
        )
      ).to.be.revertedWith("Must include at least one protocol");
    });

    it("should increment totalProtocolsAnalyzed", async () => {
      await registry.connect(user1).publishStrategy(
        WALLET, 50, 1000, 3, STRATEGY_HASH, "", 56
      );
      expect(await registry.totalProtocolsAnalyzed()).to.equal(3);

      const hash2 = ethers.keccak256(ethers.toUtf8Bytes("strategy2"));
      await registry.connect(user1).publishStrategy(
        WALLET, 30, 800, 4, hash2, "", 56
      );
      expect(await registry.totalProtocolsAnalyzed()).to.equal(7);
    });

    it("should auto-increment token IDs", async () => {
      const hash2 = ethers.keccak256(ethers.toUtf8Bytes("strategy2"));
      await registry.connect(user1).publishStrategy(
        WALLET, 50, 1000, 2, STRATEGY_HASH, "", 56
      );
      await registry.connect(user2).publishStrategy(
        WALLET, 30, 800, 1, hash2, "", 97
      );

      expect(await registry.ownerOf(1)).to.equal(user1.address);
      expect(await registry.ownerOf(2)).to.equal(user2.address);
    });
  });

  describe("getStrategy", () => {
    it("should revert for non-existent strategy", async () => {
      await expect(registry.getStrategy(999)).to.be.revertedWith("Strategy does not exist");
    });
  });

  describe("getStrategiesByCreator", () => {
    it("should return all strategies by a creator", async () => {
      const hash2 = ethers.keccak256(ethers.toUtf8Bytes("strategy2"));
      await registry.connect(user1).publishStrategy(
        WALLET, 50, 1000, 2, STRATEGY_HASH, "", 56
      );
      await registry.connect(user1).publishStrategy(
        WALLET, 30, 800, 3, hash2, "", 56
      );

      const ids = await registry.getStrategiesByCreator(user1.address);
      expect(ids.length).to.equal(2);
      expect(ids[0]).to.equal(1);
      expect(ids[1]).to.equal(2);
    });

    it("should return empty array for unknown creator", async () => {
      const ids = await registry.getStrategiesByCreator(user2.address);
      expect(ids.length).to.equal(0);
    });
  });

  describe("updateStrategyURI", () => {
    it("should allow token owner to update URI", async () => {
      await registry.connect(user1).publishStrategy(
        WALLET, 50, 1000, 2, STRATEGY_HASH, "old-uri", 56
      );

      await expect(
        registry.connect(user1).updateStrategyURI(1, "ipfs://updated")
      ).to.emit(registry, "StrategyURIUpdated").withArgs(1, "ipfs://updated");

      expect(await registry.tokenURI(1)).to.equal("ipfs://updated");
    });

    it("should revert if caller is not token owner", async () => {
      await registry.connect(user1).publishStrategy(
        WALLET, 50, 1000, 2, STRATEGY_HASH, "", 56
      );

      await expect(
        registry.connect(user2).updateStrategyURI(1, "ipfs://malicious")
      ).to.be.revertedWith("Not token owner");
    });
  });

  describe("ERC-721 transfers", () => {
    it("should allow transfer of strategy NFTs", async () => {
      await registry.connect(user1).publishStrategy(
        WALLET, 50, 1000, 2, STRATEGY_HASH, "", 56
      );

      await registry.connect(user1).transferFrom(user1.address, user2.address, 1);
      expect(await registry.ownerOf(1)).to.equal(user2.address);
    });
  });
});
