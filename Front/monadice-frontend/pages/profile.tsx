// pages/profile.tsx
import { useEffect, useState } from "react";
import { apiGetUsers } from "../lib/api";
import type { UserDTO } from "../types";

export default function ProfilePage() {
  const [users, setUsers] = useState<UserDTO[]>([]);

  useEffect(() => {
    apiGetUsers().then((res) => setUsers(res.data)).catch((err) => console.error(err));
  }, []);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Profile (placeholder)</h1>
      <div className="text-sm text-gray-600 mb-3">
        Replace this with your real profile view (created campaigns, tickets, claimable items, etc.).
      </div>
      <pre className="bg-gray-50 p-3 rounded border text-xs overflow-auto">{JSON.stringify(users, null, 2)}</pre>
    </main>
  );
}
