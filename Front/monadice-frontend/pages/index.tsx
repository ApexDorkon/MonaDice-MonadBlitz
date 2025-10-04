// pages/index.tsx
import { useEffect, useState } from "react";
import { apiGetCampaigns } from "../lib/api";
import CampaignCard from "../components/CampaignCard";
import type { CampaignDTO } from "../types";

export default function Home() {
  const [items, setItems] = useState<CampaignDTO[]>([]);

  useEffect(() => {
    apiGetCampaigns()
      .then((res) => setItems(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Campaigns</h1>
      <div className="grid gap-3">
        {items.map((c) => (
          <CampaignCard key={c.id} c={c} />
        ))}
        {items.length === 0 && <div>No campaigns yet.</div>}
      </div>
    </main>
  );
}
