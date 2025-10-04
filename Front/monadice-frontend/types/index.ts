// types/index.ts
export type UUID = string;

export type CampaignStatus = "open" | "resolved" | "canceled";

export interface UserDTO {
  id: UUID;
  wallet_address: string;
  email?: string | null;
}

export interface CampaignDTO {
  id: UUID;
  creator_wallet: string;
  contract_address: string;
  title: string;
  symbol: string;
  end_time: string; // ISO string
  fee_bps: number;
  creation_stake: string;
  status: CampaignStatus;
  outcome?: boolean;
}

export interface TicketDTO {
  id: UUID;
  campaign_id: UUID;
  user_id: UUID;
  nft_id: number;
  side: boolean;
  stake: string; // input as string to preserve precision
  claimed: boolean;
  created_at: string; // ISO string
}
