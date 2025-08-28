import React, { useEffect, useState } from "react";
import DrawerLayout from "../components/DrawerLayout";

type Profile = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  birthday?: string;
  country?: string;
  mobile?: string;
  email: string;
  createdAt?: string;
};

export default function Profiles() {
  const [rows, setRows] = useState<Profile[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/profile/getProfiles");
        const data = await res.json();
        setRows(data);
      } catch (e: any) {
        setErr(e?.message || "Failed to fetch.");
      }
    })();
  }, []);

  return (
    <DrawerLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-slate-900">Profiles</h1>
        {err && <p className="text-red-600 mt-2">{err}</p>}
        <div className="mt-4 overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="text-left px-3 py-2">Username</th>
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-left px-3 py-2">Email</th>
                <th className="text-left px-3 py-2">Country</th>
                <th className="text-left px-3 py-2">Mobile</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">{r.username}</td>
                  <td className="px-3 py-2">{r.firstName} {r.lastName}</td>
                  <td className="px-3 py-2">{r.email}</td>
                  <td className="px-3 py-2">{r.country || "-"}</td>
                  <td className="px-3 py-2">{r.mobile || "-"}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={5}>No profiles yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DrawerLayout>
  );
}