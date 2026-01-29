"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import ErrorToast from "@/components/ErrorToast";
import { publicApi } from "@/lib/axios";

export default function ForgotOtpPage() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await publicApi.post<{ status: string; message?: string }>("/auth/verify-reset-otp", {
        email,
        otp,
      });
      if (res.data?.status === "success") {
        router.push(`/forgot/reset?email=${encodeURIComponent(email)}`);
        return;
      }
      setError(res.data?.message || "OTP verification failed.");
    } catch (err) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(message || "Unable to verify OTP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <Navbar />
      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-semibold">Verify reset OTP</h1>
        <p className="text-slate-600 mt-1">Enter the OTP sent to {email || "your email"}.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">OTP</label>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2"
              maxLength={6}
              required
            />
          </div>
          {error && <ErrorToast message={error} />}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>
      </main>
    </div>
  );
}

