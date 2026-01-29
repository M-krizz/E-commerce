"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminTable from "@/components/AdminTable";
import Loader from "@/components/Loader";
import ErrorToast from "@/components/ErrorToast";
import api from "@/lib/axios";
import { ROLES } from "@/utils/roleGuard";

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: number;
  status?: string;
};

type AdminOrder = {
  order_id: number;
  user_id: number;
  status?: string;
  created_at?: string;
  transaction_id?: string | null;
};

type LogEntry = {
  user_id: number;
  action: string;
  ip?: string;
  time?: string;
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"users" | "orders" | "logs">("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        if (activeTab === "users") {
          const res = await api.get<AdminUser[]>("/admin/users");
          setUsers(res.data ?? []);
        }
        if (activeTab === "orders") {
          const res = await api.get<AdminOrder[]>("/admin/orders");
          setOrders(res.data ?? []);
        }
        if (activeTab === "logs") {
          const res = await api.get<LogEntry[]>("/logs/all");
          setLogs(res.data ?? []);
        }
      } catch {
        setError("Failed to load admin data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeTab]);

  async function handleToggle(id: number) {
    setError(null);
    try {
      await api.put(`/admin/user/${id}/toggle`);
      const res = await api.get<AdminUser[]>("/admin/users");
      setUsers(res.data ?? []);
    } catch {
      setError("Unable to update status.");
    }
  }

  return (
    <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
      <div className="min-h-screen bg-transparent text-slate-900">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-2xl font-semibold">Admin Panel</h1>
          <p className="text-slate-600 mt-1">Manage users, orders, and system logs.</p>

          <div className="mt-6 flex gap-4 text-sm font-medium">
            {(["users", "orders", "logs"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-md px-4 py-2 ${
                  activeTab === tab ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-700"
                }`}
              >
                {tab === "users" && "Users"}
                {tab === "orders" && "Orders"}
                {tab === "logs" && "System Logs"}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {error && <ErrorToast message={error} />}
            {loading ? (
              <Loader label="Loading admin data" />
            ) : activeTab === "users" ? (
              <AdminTable users={users} onToggle={handleToggle} />
            ) : activeTab === "orders" ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Order</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">User</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Transaction</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">
                          No orders found.
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.order_id} className="hover:bg-transparent">
                          <td className="px-4 py-3 text-sm text-slate-700">{order.order_id}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{order.user_id}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{order.transaction_id || "-"}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{order.status || "-"}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{order.created_at || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">User</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">IP</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">
                          No logs available.
                        </td>
                      </tr>
                    ) : (
                      logs.map((log, idx) => (
                        <tr key={idx} className="hover:bg-transparent">
                          <td className="px-4 py-3 text-sm text-slate-700">{log.user_id}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{log.action}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{log.ip || "-"}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{log.time || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

