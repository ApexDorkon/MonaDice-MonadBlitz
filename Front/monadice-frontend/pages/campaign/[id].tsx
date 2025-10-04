// pages/campaign/[id].tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { apiGetCampaign, apiCreateTicket, type CreateTicketPayload } from "../../lib/api";
import { getCampaignWrite, USDC_DECIMALS, getWriteContracts } from "../../lib/contracts";
import { toUnits } from "../../lib/wallet";
import toast from "react-hot-toast";
import type { CampaignDTO, UUID } from "../../types";
import { ethers } from "ethers";

export default function CampaignDetail() {
  const router = useRouter();
  const id = router.query.id as UUID;
  const [c, setC] = useState<CampaignDTO | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [side, setSide] = useState<"true" | "false">("true");
  const [ticketIdForClaim, setTicketIdForClaim] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    apiGetCampaign(id)
      .then((res) => setC(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  async function approveUSDC(): Promise<void> {
    try {
      const { usdc } = await getWriteContracts();
      const value = toUnits(amount, USDC_DECIMALS);
      const tx = await usdc.approve(c!.contract_address, value);
      await tx.wait();
      toast.success("USDC approved");
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      toast.error(message || "Approve failed");
    }
  }

  async function join(): Promise<void> {
    try {
      if (!c) return;
      const { signer } = await getWriteContracts();
      const campaign = getCampaignWrite(c.contract_address, signer);
      const value = toUnits(amount, USDC_DECIMALS);
      const sideNum = side === "true" ? 1 : 0;

      const tx = await campaign.join(sideNum, value);
      const rc = await tx.wait();

      let mintedTicketId: bigint | null = null;
      for (const log of ((rc?.logs ?? []) as ethers.Log[])) {
        if (!log) continue;
        try {
          const parsed = (campaign.interface as ethers.Interface).parseLog(log);
          if (parsed?.name === "Joined") {
            mintedTicketId = parsed.args.ticketId as bigint;
            break;
          }
        } catch {
          // ignore non-matching logs
        }
      }
      if (!mintedTicketId) {
        toast("Joined, but ticketId not found in logs. You can check later in Profile.", { icon: "ℹ️" });
      }

      const payload: CreateTicketPayload = {
        campaign_id: c.id,
        user_id: "00000000-0000-0000-0000-000000000000" as UUID,
        nft_id: mintedTicketId ? Number(mintedTicketId) : 0,
        side: side === "true",
        stake: amount,
      };
      await apiCreateTicket(payload);

      toast.success("Joined successfully!");
      setAmount("");
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      toast.error(message || "Join failed");
    }
  }

  async function claim(): Promise<void> {
    try {
      if (!c) return;
      const { signer } = await getWriteContracts();
      const campaign = getCampaignWrite(c.contract_address, signer);
      const tx = await campaign.claim(BigInt(ticketIdForClaim));
      await tx.wait();
      toast.success("Claimed!");
      setTicketIdForClaim("");
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      toast.error(message || "Claim failed");
    }
  }

  if (!c) return <main className="p-6">Loading...</main>;

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">
        {c.title} <span className="text-gray-500 text-base">({c.symbol})</span>
      </h1>
      <div className="text-sm text-gray-600 mb-4">
        Ends: {new Date(c.end_time).toLocaleString()} • Status: {c.status}
        {c.status === "resolved" && ` (Outcome: ${c.outcome ? "TRUE" : "FALSE"})`}
      </div>

      {c.status === "open" && (
        <section className="border rounded p-4 mb-5">
          <h2 className="font-semibold mb-2">Join</h2>
          <div className="flex gap-2 mb-2">
            <select
              className="border p-2 rounded"
              value={side}
              onChange={(e) => setSide(e.target.value as "true" | "false")}
            >
              <option value="true">TRUE</option>
              <option value="false">FALSE</option>
            </select>
            <input
              className="border p-2 rounded flex-1"
              placeholder={`Amount (USDC, ${USDC_DECIMALS} d)`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="border rounded px-4 py-2" onClick={approveUSDC}>
              Approve USDC
            </button>
            <button className="border rounded px-4 py-2" onClick={join}>
              Join
            </button>
          </div>
        </section>
      )}

      {c.status === "resolved" && (
        <section className="border rounded p-4">
          <h2 className="font-semibold mb-2">Claim</h2>
          <div className="text-sm text-gray-600 mb-2">Enter your Ticket ID to claim payout.</div>
          <div className="flex gap-2">
            <input
              className="border p-2 rounded flex-1"
              placeholder="Ticket ID"
              value={ticketIdForClaim}
              onChange={(e) => setTicketIdForClaim(e.target.value)}
            />
            <button className="border rounded px-4 py-2" onClick={claim}>
              Claim
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            (Optional improvement: fetch your tickets from the backend with a /tickets/by-user endpoint filtered by campaign_id and wallet.)
          </div>
        </section>
      )}
    </main>
  );
}
