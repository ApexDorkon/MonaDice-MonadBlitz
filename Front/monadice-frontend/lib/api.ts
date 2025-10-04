// lib/api.ts
import axios, { type AxiosResponse } from "axios";
import type { CampaignDTO, TicketDTO, UserDTO, UUID } from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// USERS
export function apiCreateUser(wallet_address: string, email?: string): Promise<AxiosResponse<UserDTO>> {
  return api.post<UserDTO>("/users/", { wallet_address, email });
}

export function apiGetUsers(): Promise<AxiosResponse<UserDTO[]>> {
  return api.get<UserDTO[]>("/users/");
}

export function apiGetUser(id: UUID): Promise<AxiosResponse<UserDTO>> {
  return api.get<UserDTO>(`/users/${id}`);
}

// CAMPAIGNS
export function apiGetCampaigns(): Promise<AxiosResponse<CampaignDTO[]>> {
  return api.get<CampaignDTO[]>("/campaigns/");
}

export function apiGetCampaign(id: UUID): Promise<AxiosResponse<CampaignDTO>> {
  return api.get<CampaignDTO>(`/campaigns/${id}`);
}

export interface CreateCampaignPayload {
  creator_wallet: string;
  contract_address: string;
  title: string;
  symbol: string;
  end_time: string; // ISO
  fee_bps: number;
  creation_stake: string;
}

export function apiCreateCampaign(data: CreateCampaignPayload): Promise<AxiosResponse<CampaignDTO>> {
  return api.post<CampaignDTO>("/campaigns/", data);
}

// TICKETS
export interface CreateTicketPayload {
  campaign_id: UUID;
  user_id: UUID;
  nft_id: number;
  side: boolean;
  stake: string;
}

export function apiCreateTicket(data: CreateTicketPayload): Promise<AxiosResponse<TicketDTO>> {
  return api.post<TicketDTO>("/tickets/", data);
}

export function apiGetTicket(id: UUID): Promise<AxiosResponse<TicketDTO>> {
  return api.get<TicketDTO>(`/tickets/${id}`);
}

// (optional) You can add a backend endpoint:
// GET /tickets/by-user?wallet=0x..&campaign_id=UUID  -> returns user's tickets for that campaign
