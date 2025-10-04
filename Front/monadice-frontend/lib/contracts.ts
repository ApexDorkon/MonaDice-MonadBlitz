// lib/contracts.ts
import { ethers } from "ethers";
import factoryAbi from "../contracts/factory_abi.json";
import campaignAbi from "../contracts/campaign_abi.json";

export const FACTORY_ADDR = process.env.NEXT_PUBLIC_FACTORY_ADDRESS!;
export const USDC_ADDR = process.env.NEXT_PUBLIC_USDC_ADDRESS!;
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL!;
export const USDC_DECIMALS = Number(process.env.NEXT_PUBLIC_USDC_DECIMALS || "6");
export const DEFAULT_FEE_BPS = Number(process.env.NEXT_PUBLIC_DEFAULT_FEE_BPS || "500");

// Minimal ERC20 approve ABI
export const erc20Abi = [
  "function approve(address spender, uint256 value) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function decimals() view returns (uint8)",
] as const;

export function getReadProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(RPC_URL);
}

export async function getWriteContracts(): Promise<{
  signer: ethers.Signer;
  factory: ethers.Contract;
  usdc: ethers.Contract;
}> {
  const { signer } = await import("./wallet").then((mod) => mod.connectWallet());
  const factory = new ethers.Contract(FACTORY_ADDR, factoryAbi as unknown as ethers.InterfaceAbi, signer);
  const usdc = new ethers.Contract(USDC_ADDR, erc20Abi as unknown as ethers.InterfaceAbi, signer);
  return { signer, factory, usdc };
}

export function getReadContracts(): { provider: ethers.JsonRpcProvider; factory: ethers.Contract } {
  const provider = getReadProvider();
  const factory = new ethers.Contract(FACTORY_ADDR, factoryAbi as unknown as ethers.InterfaceAbi, provider);
  return { provider, factory };
}

export function getCampaignWrite(address: string, signer: ethers.Signer): ethers.Contract {
  return new ethers.Contract(address, campaignAbi as unknown as ethers.InterfaceAbi, signer);
}

export function getCampaignRead(address: string): ethers.Contract {
  const provider = getReadProvider();
  return new ethers.Contract(address, campaignAbi as unknown as ethers.InterfaceAbi, provider);
}
