import React, { useMemo, useState } from "react";
import DrawerLayout from "../components/DrawerLayout";
import PasswordStrengthBar, { scorePassword } from "../components/PasswordStrengthBar";
import { Link, useNavigate } from "react-router-dom";

type FormState = {
  username: string;
  firstName: string;
  lastName: string;
  birthday: string; // yyyy-mm-dd
  country: string;
  mobile?: string;
  email: string;
  email2: string;
  password: string;
  password2: string;
};

const initial: FormState = {
  username: "",
  firstName: "",
  lastName: "",
  birthday: "",
  country: "",
  mobile: "",
  email: "",
  email2: "",
  password: "",
  password2: "",
};

function isEmailValid(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function usernameValid(u: string) {
  return /^[A-Za-z0-9]{6,12}$/.test(u);
}

function passwordValid(p: string) {
  return (
    /^.{12,24}$/.test(p) &&
    /[a-z]/.test(p) &&
    /[A-Z]/.test(p) &&
    /\d/.test(p) &&
    /[^A-Za-z0-9]/.test(p)
  );
}

export default function Signup() {
  const [f, setF] = useState<FormState>(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const nav = useNavigate();

  const emailMatch = f.email.length > 0 && f.email === f.email2;
  const passwordMatch = f.password.length > 0 && f.password === f.password2;
  const pwScore = useMemo(() => scorePassword(f.password), [f.password]);

  const canSubmit =
    usernameValid(f.username) &&
    f.firstName.trim().length > 0 &&
    f.lastName.trim().length > 0 &&
    f.country.trim().length > 0 &&
    f.birthday.trim().length > 0 &&
    isEmailValid(f.email) &&
    emailMatch &&
    passwordValid(f.password) &&
    passwordMatch;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || busy) return;
    setErr(null);
    setOk(null);
    setBusy(true);

    try {
      const res = await fetch("/profile/createProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: f.username,
          firstName: f.firstName,
          lastName: f.lastName,
          birthday: f.birthday,
          country: f.country,
          mobile: f.mobile || undefined,
          email: f.email,
          password: f.password,
        }),
      });

      const text = await res.text();
      const data = (() => {
        try { return JSON.parse(text); } catch { return { raw: text }; }
      })();

      if (!res.ok) {
        throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
      }

      setOk("Profile created!");
      setTimeout(() => nav("/profiles"), 800);
    } catch (e: any) {
      setErr(e?.message || "Failed to sign up.");
    } finally {
      setBusy(false);
    }
  }

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setF((s) => ({ ...s, [k]: v }));
  }

  return (
    <DrawerLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h1 className="text-2xl font-semibold text-slate-900">Create your account</h1>
          <p className="text-slate-600 mt-1">
            Fill in your details to create a new profile.
          </p>

          {err && (
            <div className="mt-4 rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
              {err}
            </div>
          )}
          {ok && (
            <div className="mt-4 rounded-md bg-green-50 border border-green-200 text-green-700 px-3 py-2 text-sm">
              {ok}
            </div>
          )}

          <form className="mt-6 space-y-6" onSubmit={submit}>
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Username</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="6–12 letters or digits"
                value={f.username}
                onChange={(e) => set("username", e.target.value)}
                required
              />
              {!usernameValid(f.username) && f.username.length > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  Username must be 6–12 characters (letters and numbers only).
                </p>
              )}
            </div>

            {/* First + Last */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">First name</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  value={f.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Last name</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  value={f.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email + Verify Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  value={f.email}
                  onChange={(e) => set("email", e.target.value)}
                  required
                />
                {f.email.length > 0 && !isEmailValid(f.email) && (
                  <p className="text-xs text-red-600 mt-1">Invalid email format.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Verify email</label>
                <input
                  type="email"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  value={f.email2}
                  onChange={(e) => set("email2", e.target.value)}
                  required
                />
                {f.email2.length > 0 && f.email.length > 0 && !(f.email === f.email2) && (
                  <p className="text-xs text-red-600 mt-1">Emails do not match.</p>
                )}
              </div>
            </div>

            {/* Country + Mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Country</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Country name (e.g., UK)"
                  value={f.country}
                  onChange={(e) => set("country", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Mobile (optional)</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+44..."
                  value={f.mobile}
                  onChange={(e) => set("mobile", e.target.value)}
                />
              </div>
            </div>

            {/* Birthday */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Birthday</label>
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                value={f.birthday}
                onChange={(e) => set("birthday", e.target.value)}
                required
              />
            </div>

            {/* Password + Verify */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12–24 chars, mixed"
                  value={f.password}
                  onChange={(e) => set("password", e.target.value)}
                  required
                />
                <PasswordStrengthBar value={f.password} />
                {f.password.length > 0 && !passwordValid(f.password) && (
                  <p className="text-xs text-red-600 mt-1">
                    12–24 chars, must include upper, lower, digit, and special character.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Verify password</label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  value={f.password2}
                  onChange={(e) => set("password2", e.target.value)}
                  required
                />
                {f.password2.length > 0 && !(f.password === f.password2) && (
                  <p className="text-xs text-red-600 mt-1">Passwords do not match.</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={!canSubmit || busy}
                className={`px-4 py-2 rounded-lg text-white ${
                  canSubmit && !busy ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
                }`}
              >
                {busy ? "Saving…" : "Create account"}
              </button>
              <Link to="/" className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </DrawerLayout>
  );
}