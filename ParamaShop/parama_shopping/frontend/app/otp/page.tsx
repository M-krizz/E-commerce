"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import ErrorToast from "@/components/ErrorToast";
import { publicApi } from "@/lib/axios";
import api from "@/lib/axios";
import { setToken, setProfile, type UserProfile } from "@/utils/auth";
import { ROLES } from "@/utils/roleGuard";

export default function OtpPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = params.get("user_id");

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!userId) {
        setError("Missing user ID. Please login again.");
        return;
      }
      const res = await publicApi.post<{ status: string; data?: { token?: string }; message?: string }>(
        "/auth/verify-otp",
        { user_id: userId, otp }
      );
      const token = res.data?.data?.token;
      if (res.data?.status === "success" && token) {
        setToken(token);
        const profileRes = await api.get<{ status: string; data?: UserProfile }>("/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (profileRes.data?.data) {
          setProfile(profileRes.data.data);
          const role = profileRes.data.data.role;
          const sellerStatus = profileRes.data.data.seller_profile?.status;
          if (role === ROLES.ADMIN) {
            router.replace("/admin");
            return;
          }
          if (role === ROLES.SELLER && sellerStatus && sellerStatus !== "APPROVED") {
            router.replace("/seller/pending");
            return;
          }
          if (role === ROLES.SELLER) {
            router.replace("/seller");
            return;
          }
          if (sellerStatus && sellerStatus !== "APPROVED") {
            router.replace("/seller/pending");
            return;
          }
          router.replace("/home");
          return;
        }
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
        <h1 className="text-2xl font-semibold">Verify OTP</h1>
        <p className="text-slate-600 mt-1">Enter the 6-digit code sent to your email.</p>

        <form onSubmit={handleVerify} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6">
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

