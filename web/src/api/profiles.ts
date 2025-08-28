import type { CreateProfileRequest, Profile } from "../types";

export async function createProfile(body: CreateProfileRequest): Promise<Profile> {
  const res = await fetch("/profile/createProfile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const e = await res.json();
      if (e?.error) msg = e.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}