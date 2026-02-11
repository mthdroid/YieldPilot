import { ethers } from "ethers";

export const BSC_MAINNET = {
  chainId: 56,
  name: "BNB Smart Chain",
  rpc: "https://bsc-dataseed.binance.org/",
  explorer: "https://bscscan.com",
};

export async function connectWallet() {
  const eth = typeof window !== "undefined"
    ? (window as unknown as { ethereum?: ethers.Eip1193Provider }).ethereum
    : undefined;
  if (!eth) throw new Error("No wallet found. Install MetaMask.");

  const provider = new ethers.BrowserProvider(eth);
  await provider.send("eth_requestAccounts", []);

  try {
    await provider.send("wallet_switchEthereumChain", [
      { chainId: "0x" + BSC_MAINNET.chainId.toString(16) },
    ]);
  } catch (switchError: unknown) {
    if ((switchError as { code?: number }).code === 4902) {
      await provider.send("wallet_addEthereumChain", [{
        chainId: "0x" + BSC_MAINNET.chainId.toString(16),
        chainName: BSC_MAINNET.name,
        rpcUrls: [BSC_MAINNET.rpc],
        blockExplorerUrls: [BSC_MAINNET.explorer],
        nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
      }]);
    }
  }

  const signer = await provider.getSigner();
  return { provider, signer, address: await signer.getAddress() };
}
