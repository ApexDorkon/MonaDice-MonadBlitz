// components/Navbar.tsx
import { useState } from "react";
import Link from "next/link";
import { connectWallet } from "../lib/wallet";
import { apiCreateUser } from "../lib/api";
import toast from "react-hot-toast";

export default function Navbar() {
  const [addr, setAddr] = useState<string | null>(null);

  async function onConnect(): Promise<void> {
    try {
      const { address } = await connectWallet();
      setAddr(address);
      await apiCreateUser(address);
      toast.success("Wallet connected & user registered");
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      toast.error(message || "Connect failed");
    }
  }

  return (
    <nav className="w-full flex items-center justify-between px-6 py-3 border-b">
      <div className="flex gap-4">
        <Link href="/">Home</Link>
        <Link href="/create">Create</Link>
        <Link href="/profile">Profile</Link>
      </div>
      <button onClick={onConnect} className="px-4 py-2 border rounded">
        {addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "Connect"}
      </button>
    </nav>
  );
}
