import React from "react";
import type { Profile } from "../types";

type Props = {
  items: Profile[];
  loading?: boolean;
  error?: string | null;
};

export const ProfileTable: React.FC<Props> = ({ items, loading, error }) => {
  if (loading) {
    return <div className="table-card p-6 text-brand-blue">Loading profiles…</div>;
  }
  if (error) {
    return <div className="table-card p-6 text-red-600">Error: {error}</div>;
  }
  if (!items.length) {
    return <div className="table-card p-6 text-slate-600">No profiles found.</div>;
  }

  return (
    <div className="table-card overflow-x-auto">
      <table className="min-w-full table-auto">
        <thead className="table-head">
          <tr>
            <th className="text-left px-4 py-3 font-semibold">Username</th>
            <th className="text-left px-4 py-3 font-semibold">Name</th>
            <th className="text-left px-4 py-3 font-semibold">Email</th>
            <th className="text-left px-4 py-3 font-semibold">Mobile</th>
            <th className="text-left px-4 py-3 font-semibold">Country</th>
            <th className="text-left px-4 py-3 font-semibold">Birthday</th>
            <th className="text-left px-4 py-3 font-semibold">Profile ID</th>
            <th className="text-left px-4 py-3 font-semibold">Created</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id} className="border-b last:border-0 border-slate-200">
              <td className="px-4 py-3"><span className="badge badge-blue">{p.username}</span></td>
              <td className="px-4 py-3">{p.firstName} {p.lastName}</td>
              <td className="px-4 py-3">{p.email}</td>
              <td className="px-4 py-3">{p.mobile ?? "—"}</td>
              <td className="px-4 py-3">{p.country}</td>
              <td className="px-4 py-3">{p.birthday ?? "—"}</td>
              <td className="px-4 py-3 text-xs text-slate-600">{p.profileId}</td>
              <td className="px-4 py-3 text-xs text-slate-600">
                {new Date(p.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};