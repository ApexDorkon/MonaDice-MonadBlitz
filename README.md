# monaDice — Social Sidebets (README.md)

**Short description**  
monaDice converts social speculation into on-chain, tradable bets. Users create per-bet `Campaign` contracts directly via a `Factory` (no chat-bot required). Participants join a side (YES/NO) by staking USDC to the campaign; each join mints a transferable **Ticket NFT** (ERC-721) whose `tokenId` equals the join order. After on-chain resolution, winning ticket holders claim their share from the campaign contract.

---

## Quick highlights
- **Factory-first creation:** users call `Factory.createCampaign(...)` to deploy a per-bet `Campaign` (lightweight clone pattern recommended).  
- **Ticket NFTs:** every join mints a Ticket NFT representing position & claim right. `tokenId` == join order.  
- **Fees:** platform fee taken at join (e.g., 10%) and split between **Treasury** (revenue) and **Bounty** (promos/insurance).  
- **Transferable claims:** Tickets are transferable; current owner of `tokenId` can call `claim(tokenId)`.  
- **Resolver:** an oracle/admin resolves outcomes; contract computes payouts and enables claiming.

---

## Core flow (concise)
1. **Create campaign:** user calls `Factory.createCampaign(params)` → deploys `Campaign`. Creator pays creation fee to Treasury.  
2. **Join campaign:** `Campaign.join(side, amount)` transfers USDC, deducts fee, mints `Ticket` (ERC-721) to joiner. Net stake increments yesPool/noPool.  
3. **Resolve:** authorized resolver calls `Campaign.resolve(winningSide, proof)`. Contract sets claimable amounts per tokenId.  
4. **Claim:** owner calls `Campaign.claim(tokenId)` to withdraw their payout.

---

## Contracts (brief)
- `SidebetFactory` — deploys `Campaign` clones; emits `CampaignCreated`.  
- `Campaign` — per-bet logic: pools, minting, resolve, claim. Exposes `join`, `resolve`, `claim`.  
- `TicketNFT` (ERC-721) — metadata includes `campaignId`, `position`, `side`, `stake`.  
- `Treasury` — accumulates revenue portion of fees.

### Example signatures
```solidity
function createCampaign(address creator, uint256 minStake, uint256 feeBP, uint256 lockTime, address resolver) external returns (address);
function join(uint8 side, uint256 amount) external;
function resolve(uint8 winningSide, bytes calldata proof) external;
function claim(uint256 tokenId) external;


----
<img width="1920" height="1080" alt="protocol" src="https://github.com/user-attachments/assets/16ea9a1d-4860-4d4a-a408-ae2231fc1cf0" />

