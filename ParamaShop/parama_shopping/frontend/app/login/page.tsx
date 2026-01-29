"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ErrorToast from "@/components/ErrorToast";
import { publicApi } from "@/lib/axios";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await publicApi.post<{ status: string; data?: { user_id?: number }; message?: string }>(
        "/auth/login",
        { email, password }
      );
      if (res.data?.status === "success" && res.data.data?.user_id != null) {
        router.push(`/otp?user_id=${res.data.data.user_id}`);
        return;
      }
      setError(res.data?.message || "Login failed.");
    } catch (err) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(message || "Unable to login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <Navbar />
      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl border border-slate-200 bg-white/90 shadow-xl backdrop-blur">
          <div className="border-b border-slate-100 px-6 py-5">
            <h1 className="text-2xl font-semibold">Sign in</h1>
            <p className="text-slate-600 mt-1">Enter your credentials to receive an OTP.</p>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              required
            />
          </div>
          {error && <ErrorToast message={error} />}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Sending OTP..." : "Continue"}
          </button>
          <div className="mt-4 flex items-center justify-between text-sm">
            <Link href="/forgot" className="text-slate-600 hover:text-slate-900">
              Forgot password?
            </Link>
            <Link href="/auth/register" className="text-slate-600 hover:text-slate-900">
              Create account
            </Link>
          </div>
          </form>
        </div>
      </main>
    </div>
  );
}

