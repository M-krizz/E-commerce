"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ROLES } from "@/utils/roleGuard";
import { getProfile } from "@/utils/auth";

export default function SellerPendingPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [shopName, setShopName] = useState<string | null>(null);

  useEffect(() => {
    const profile = getProfile();
    setStatus(profile?.seller_profile?.status || "PENDING");
    setShopName(profile?.seller_profile?.shop_name || null);
  }, []);

  const statusText =
    status === "REJECTED"
      ? "Your seller request was rejected. Please contact support."
      : status === "APPROVED"
      ? "Your seller request is approved. You can now access the Seller Panel."
      : "Your seller request is pending approval from the admin.";

  return (
    <ProtectedRoute allowedRoles={[ROLES.USER, ROLES.SELLER]}>
    <div className="min-h-screen bg-transparent text-slate-900">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
            <h1 className="text-2xl font-semibold">Seller verification</h1>
            {shopName && <p className="text-slate-600 mt-1">Store: {shopName}</p>}
            <p className="mt-6 text-slate-700">{statusText}</p>
            <div className="mt-6">
              {status === "APPROVED" ? (
                <a
                  href="/seller"
                  className="inline-flex items-center justify-center rounded-md bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Go to Seller Panel
                </a>
              ) : (
                <span className="inline-flex items-center justify-center rounded-md border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600">
                  Awaiting admin approval
                </span>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

