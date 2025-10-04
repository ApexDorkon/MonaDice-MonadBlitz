// lib/wallet.ts
import { ethers } from "ethers";

export interface WalletConnection {
  address: string;
  provider: ethers.BrowserProvider;
  signer: ethers.Signer;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

export async function connectWallet(): Promise<WalletConnection> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not detected");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  return { address, provider, signer };
}

export function toUnits(amount: string | number, decimals = 6): bigint {
  return ethers.parseUnits(String(amount), decimals);
}

export function fromUnits(amountWei: bigint, decimals = 6): number {
  return Number(ethers.formatUnits(amountWei, decimals));
}

export function checksum(addr: string): string {
  return ethers.getAddress(addr);
}
