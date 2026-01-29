"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ErrorToast from "@/components/ErrorToast";
import { publicApi } from "@/lib/axios";

export default function SellerRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await publicApi.post<{ status: string; data?: { user_id?: number }; message?: string }>(
        "/auth/register-seller",
        {
          name,
          email,
          password,
          shop_name: shopName,
          phone,
          address,
          category,
        }
      );
      if (res.data?.status === "success" && res.data.data?.user_id != null) {
        router.push(`/otp?user_id=${res.data.data.user_id}`);
        return;
      }
      setError(res.data?.message || "Seller registration failed.");
    } catch (err) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(message || "Unable to register seller.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-semibold">Register as seller</h1>
        <p className="text-slate-600 mt-1">Submit your store details for approval.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-md border border-slate-200 px-3 py-2"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-md border border-slate-200 px-3 py-2"
              required
            />
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-md border border-slate-200 px-3 py-2"
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="Shop name"
              className="w-full rounded-md border border-slate-200 px-3 py-2"
              required
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              className="w-full rounded-md border border-slate-200 px-3 py-2"
              required
            />
          </div>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Business address"
            className="w-full rounded-md border border-slate-200 px-3 py-2"
            required
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Product category"
            className="w-full rounded-md border border-slate-200 px-3 py-2"
            required
          />
          {error && <ErrorToast message={error} />}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Create seller account"}
          </button>
        </form>

        <div className="mt-4 text-sm">
          <Link href="/auth/register" className="text-slate-600 hover:text-slate-900">
            Register as user instead
          </Link>
        </div>
      </main>
    </div>
  );
}

