"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import OrderTable, { type OrderRow } from "@/components/OrderTable";
import Loader from "@/components/Loader";
import ErrorToast from "@/components/ErrorToast";
import api from "@/lib/axios";
import { ROLES } from "@/utils/roleGuard";
import { getProfile } from "@/utils/auth";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const role = getProfile()?.role ?? ROLES.USER;

  useEffect(() => {
    async function loadOrders() {
      try {
        if (role === ROLES.SELLER) {
          const res = await api.get<{ status: string; data?: (OrderRow & { total_for_seller?: number })[] }>(
            "/order/seller-orders"
          );
          const payload = (res.data?.data ?? []).map((o) => ({
            ...o,
            total: o.total ?? o.total_for_seller ?? 0,
          }));
          setOrders(payload);
          return;
        }
        if (role === ROLES.ADMIN) {
          const res = await api.get<OrderRow[]>("/admin/orders");
          setOrders(res.data ?? []);
          return;
        }
        const res = await api.get<{ status: string; data?: OrderRow[] }>("/order/history");
        setOrders(res.data?.data ?? []);
      } catch {
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [role]);

  return (
    <ProtectedRoute allowedRoles={[ROLES.USER, ROLES.SELLER, ROLES.ADMIN]}>
      <div className="min-h-screen bg-transparent text-slate-900">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-2xl font-semibold">Order history</h1>
          <p className="text-slate-600 mt-1">Track your recent purchases and delivery details.</p>

          <div className="mt-6">
            {error && <ErrorToast message={error} />}
            {loading ? (
              <div className="mt-6">
                <Loader label="Loading orders" />
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <OrderTable orders={orders} />
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

