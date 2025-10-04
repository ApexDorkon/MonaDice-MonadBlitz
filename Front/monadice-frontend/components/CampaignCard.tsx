// components/CampaignCard.tsx
import React from "react";
import Link from "next/link";
import type { CampaignDTO } from "../types";

export default function CampaignCard({ c }: { c: CampaignDTO }) {
  return (
    <Link href={`/campaign/${c.id}`}>
      <div className="border rounded p-4 hover:bg-gray-50 cursor-pointer">
        <div className="flex justify-between">
          <h3 className="font-semibold">{c.title}</h3>
          <span className="text-sm">{c.symbol}</span>
        </div>
        <div className="text-sm text-gray-600">Status: {c.status}</div>
        <div className="text-xs text-gray-500">Ends: {new Date(c.end_time).toLocaleString()}</div>
      </div>
    </Link>
  );
}
