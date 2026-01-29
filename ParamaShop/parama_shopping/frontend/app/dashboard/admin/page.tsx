"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import api from "@/lib/axios";
import { ROLES } from "@/utils/roleGuard";
import { getProfile } from "@/utils/auth";

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
  delivery?: {
    name?: string;
    phone?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
};

type LogEntry = {
  user_id: number;
  action: string;
  ip?: string;
  time?: string;
};

type SellerRequest = {
  user_id: number;
  user_name?: string;
  user_email?: string;
  shop_name?: string;
  phone?: string;
  address?: string;
  category?: string;
  status?: string;
  created_at?: string;
};

type SellerRow = SellerRequest & { approved_at?: string };

type AdminProduct = {
  product_id: number;
  name: string;
  category?: string;
  price: number;
  stock?: number;
  seller_id?: number;
};

const ROLE_LABELS: Record<number, string> = {
  1: "USER",
  2: "ADMIN",
  3: "SELLER",
};

function formatDate(value?: string): string {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return value;
  }
}

export default function AdminDashboardPage() {
  const profile = getProfile();
  const [activeTab, setActiveTab] = useState<"users" | "orders" | "logs" | "sellerRequests" | "sellers" | "products" | "revenue">("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [sellerRequests, setSellerRequests] = useState<SellerRequest[]>([]);
  const [sellers, setSellers] = useState<SellerRow[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [revenue, setRevenue] = useState<{ total_revenue: number; order_count: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [statusOverrides, setStatusOverrides] = useState<Record<number, string>>({});
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role_id: 1 });

  useEffect(() => {
    if (activeTab === "users") loadUsers();
    if (activeTab === "orders") loadOrders();
    if (activeTab === "logs") loadLogs();
    if (activeTab === "sellerRequests") loadSellerRequests();
    if (activeTab === "sellers") loadSellers();
    if (activeTab === "products") loadProducts();
    if (activeTab === "revenue") loadRevenue();
  }, [activeTab]);

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<AdminUser[] | { data: AdminUser[] }>("/admin/users");
      const data = Array.isArray(res.data) ? res.data : (res.data as { data: AdminUser[] }).data ?? [];
      setUsers(data);
    } catch (_err) {
      setError("Failed to load users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadOrders() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<AdminOrder[] | { data: AdminOrder[] }>("/admin/orders");
      const data = Array.isArray(res.data) ? res.data : (res.data as { data: AdminOrder[] }).data ?? [];
      setOrders(data);
    } catch (_err) {
      setError("Failed to load orders.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadLogs() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<LogEntry[] | { data: LogEntry[] }>("/logs/all");
      const data = Array.isArray(res.data) ? res.data : (res.data as { data: LogEntry[] }).data ?? [];
      setLogs(data);
    } catch (_err) {
      setError("Failed to load logs.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadSellerRequests() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<SellerRequest[]>("/admin/seller-requests");
      setSellerRequests(res.data ?? []);
    } catch (_err) {
      setError("Failed to load seller requests.");
      setSellerRequests([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadSellers() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<SellerRow[]>("/admin/sellers");
      setSellers(res.data ?? []);
    } catch (_err) {
      setError("Failed to load sellers.");
      setSellers([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<AdminProduct[]>("/admin/products");
      setProducts(res.data ?? []);
    } catch (_err) {
      setError("Failed to load products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadRevenue() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<{ total_revenue: number; order_count: number }>("/admin/revenue");
      setRevenue(res.data ?? null);
    } catch (_err) {
      setError("Failed to load revenue.");
      setRevenue(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser() {
    if (!newUser.name || !newUser.email || !newUser.password) {
      setError("Name, email and password are required.");
      return;
    }
    setCreating(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/admin/users", newUser);
      setSuccess("User created.");
      setNewUser({ name: "", email: "", password: "", role_id: 1 });
      await loadUsers();
    } catch (err) {
      const ax = err as { response?: { data?: { message?: string } } };
      setError(ax.response?.data?.message || "Failed to create user.");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleUser(id: number) {
    setTogglingId(id);
    setError("");
    setSuccess("");
    try {
      await api.put<{ message?: string }>(`/admin/user/${id}/toggle`);
      setSuccess("User status updated.");
      setStatusOverrides((prev) => ({
        ...prev,
        [id]: prev[id] === "DISABLED" ? "ACTIVE" : "DISABLED",
      }));
      await loadUsers();
    } catch (_err) {
      const ax = _err as { response?: { data?: { message?: string } } };
      setError(ax.response?.data?.message || "Failed to update user status.");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDeleteUser(id: number) {
    setError("");
    setSuccess("");
    try {
      await api.delete(`/admin/users/${id}`);
      setSuccess("User deleted.");
      await loadUsers();
    } catch (_err) {
      setError("Failed to delete user.");
    }
  }

  async function handleApproveSeller(id: number) {
    setError("");
    setSuccess("");
    try {
      await api.post(`/admin/sellers/${id}/approve`);
      setSuccess("Seller approved.");
      await loadSellerRequests();
      await loadSellers();
    } catch (_err) {
      setError("Failed to approve seller.");
    }
  }

  async function handleRejectSeller(id: number) {
    setError("");
    setSuccess("");
    try {
      await api.post(`/admin/sellers/${id}/reject`);
      setSuccess("Seller rejected.");
      await loadSellerRequests();
    } catch (_err) {
      setError("Failed to reject seller.");
    }
  }

  async function handleDeleteSeller(id: number) {
    setError("");
    setSuccess("");
    try {
      await api.delete(`/admin/sellers/${id}`);
      setSuccess("Seller deleted.");
      await loadSellers();
    } catch (_err) {
      setError("Failed to delete seller.");
    }
  }

  async function handleDeleteProduct(id: number) {
    setError("");
    setSuccess("");
    try {
      await api.delete(`/admin/products/${id}`);
      setSuccess("Product deleted.");
      await loadProducts();
    } catch (_err) {
      setError("Failed to delete product.");
    }
  }

  function getUserStatus(u: AdminUser): string {
    if (statusOverrides[u.id]) return statusOverrides[u.id];
    return u.status || "-";
  }

  const userName = profile?.name || "Admin";

  const tableBase = "min-w-full divide-y divide-gray-200 dark:divide-gray-700";
  const thBase =
    "px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800";
  const tdBase = "px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap";

  return (
    <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
      <div className="min-h-screen bg-transparent flex flex-col">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Admin Dashboard
                </h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {userName} - System overview and management
                </p>
              </div>

              <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
                <nav className="flex gap-6">
                  {(["users", "sellerRequests", "sellers", "products", "orders", "revenue", "logs"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setError("");
                        setSuccess("");
                      }}
                      className={`px-1 py-3 font-medium text-sm border-b-2 transition-colors ${
                        activeTab === tab
                          ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                          : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      {tab === "users" && "Users"}
                      {tab === "sellerRequests" && "Seller Requests"}
                      {tab === "sellers" && "Sellers"}
                      {tab === "products" && "Products"}
                      {tab === "orders" && "Orders"}
                      {tab === "revenue" && "Revenue"}
                      {tab === "logs" && "System Logs"}
                    </button>
                  ))}
                </nav>
              </div>

              {error && (
                <div
                  className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-center gap-2"
                  role="alert"
                >
                  <span className="shrink-0 size-5 rounded-full bg-red-500/20 flex items-center justify-center">!</span>
                  {error}
                </div>
              )}

              {success && (
                <div
                  className="mb-4 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2"
                  role="alert"
                >
                  <span className="shrink-0 size-5 rounded-full bg-emerald-500/20 flex items-center justify-center">OK</span>
                  {success}
                </div>
              )}

              {activeTab === "users" && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-4 py-4 sm:px-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">All Users</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Manage user access and status.
                    </p>
                  </div>
                  <div className="px-4 py-4 sm:px-6 border-b border-slate-200 dark:border-slate-700 bg-transparent dark:bg-slate-800/50">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <input
                        placeholder="Name"
                        value={newUser.name}
                        onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
                        className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                      />
                      <input
                        placeholder="Email"
                        value={newUser.email}
                        onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                        className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                      />
                      <input
                        placeholder="Password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
                        className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                      />
                      <select
                        value={newUser.role_id}
                        onChange={(e) => setNewUser((prev) => ({ ...prev, role_id: Number(e.target.value) }))}
                        className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                      >
                        <option value={1}>USER</option>
                        <option value={2}>ADMIN</option>
                        <option value={3}>SELLER</option>
                      </select>
                    </div>
                    <button
                      onClick={handleCreateUser}
                      disabled={creating}
                      className="mt-3 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium disabled:opacity-60"
                    >
                      {creating ? "Creating..." : "Add User"}
                    </button>
                  </div>
                  {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading users...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className={tableBase}>
                        <thead>
                          <tr>
                            <th className={thBase}>ID</th>
                            <th className={thBase}>Name</th>
                            <th className={thBase}>Email</th>
                            <th className={thBase}>Role</th>
                            <th className={thBase}>Status</th>
                            <th className={thBase}>Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                          {users.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                No users found.
                              </td>
                            </tr>
                          ) : (
                            users.map((u) => (
                              <tr key={u.id} className="hover:bg-transparent dark:hover:bg-slate-800/50">
                                <td className={tdBase}>{u.id}</td>
                                <td className={tdBase}>{u.name || "-"}</td>
                                <td className={tdBase}>{u.email || "-"}</td>
                                <td className={tdBase}>
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      u.role === ROLES.ADMIN
                                        ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300"
                                        : u.role === ROLES.SELLER
                                        ? "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300"
                                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                    }`}
                                  >
                                    {ROLE_LABELS[u.role] ?? u.role}
                                  </span>
                                </td>
                                <td className={tdBase}>
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      getUserStatus(u) === "ACTIVE"
                                        ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300"
                                        : getUserStatus(u) === "DISABLED"
                                        ? "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300"
                                        : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                                    }`}
                                  >
                                    {getUserStatus(u)}
                                  </span>
                                </td>
                                <td className={tdBase}>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleUser(u.id)}
                                    disabled={togglingId === u.id}
                                    className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                                  >
                                    {togglingId === u.id ? "Updating..." : "Toggle status"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(u.id)}
                                    className="ml-2 inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-500"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "sellerRequests" && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-4 py-4 sm:px-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Seller Requests</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Approve or reject pending seller accounts.
                    </p>
                  </div>
                  {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading requests...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className={tableBase}>
                        <thead>
                          <tr>
                            <th className={thBase}>User</th>
                            <th className={thBase}>Email</th>
                            <th className={thBase}>Shop</th>
                            <th className={thBase}>Category</th>
                            <th className={thBase}>Requested</th>
                            <th className={thBase}>Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                          {sellerRequests.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                No pending requests.
                              </td>
                            </tr>
                          ) : (
                            sellerRequests.map((s) => (
                              <tr key={s.user_id} className="hover:bg-transparent dark:hover:bg-slate-800/50">
                                <td className={tdBase}>{s.user_name || "-"}</td>
                                <td className={tdBase}>{s.user_email || "-"}</td>
                                <td className={tdBase}>{s.shop_name || "-"}</td>
                                <td className={tdBase}>{s.category || "-"}</td>
                                <td className={tdBase}>{formatDate(s.created_at)}</td>
                                <td className={tdBase}>
                                  <button
                                    className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm"
                                    onClick={() => handleApproveSeller(s.user_id)}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    className="ml-2 px-3 py-1.5 rounded-md bg-red-600 text-white text-sm"
                                    onClick={() => handleRejectSeller(s.user_id)}
                                  >
                                    Reject
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "sellers" && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-4 py-4 sm:px-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Approved Sellers</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Manage approved sellers and stores.
                    </p>
                  </div>
                  {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading sellers...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className={tableBase}>
                        <thead>
                          <tr>
                            <th className={thBase}>Seller</th>
                            <th className={thBase}>Email</th>
                            <th className={thBase}>Shop</th>
                            <th className={thBase}>Category</th>
                            <th className={thBase}>Approved</th>
                            <th className={thBase}>Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                          {sellers.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                No sellers found.
                              </td>
                            </tr>
                          ) : (
                            sellers.map((s) => (
                              <tr key={s.user_id} className="hover:bg-transparent dark:hover:bg-slate-800/50">
                                <td className={tdBase}>{s.user_name || "-"}</td>
                                <td className={tdBase}>{s.user_email || "-"}</td>
                                <td className={tdBase}>{s.shop_name || "-"}</td>
                                <td className={tdBase}>{s.category || "-"}</td>
                                <td className={tdBase}>{formatDate(s.approved_at)}</td>
                                <td className={tdBase}>
                                  <button
                                    className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm"
                                    onClick={() => handleDeleteSeller(s.user_id)}
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "products" && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-4 py-4 sm:px-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Products</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage products and inventory.</p>
                  </div>
                  {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading products...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className={tableBase}>
                        <thead>
                          <tr>
                            <th className={thBase}>ID</th>
                            <th className={thBase}>Name</th>
                            <th className={thBase}>Category</th>
                            <th className={thBase}>Price</th>
                            <th className={thBase}>Stock</th>
                            <th className={thBase}>Seller</th>
                            <th className={thBase}>Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                          {products.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                No products found.
                              </td>
                            </tr>
                          ) : (
                            products.map((p) => (
                              <tr key={p.product_id} className="hover:bg-transparent dark:hover:bg-slate-800/50">
                                <td className={tdBase}>{p.product_id}</td>
                                <td className={tdBase}>{p.name}</td>
                                <td className={tdBase}>{p.category || "-"}</td>
                                <td className={tdBase}>Rs {p.price}</td>
                                <td className={tdBase}>{p.stock ?? "-"}</td>
                                <td className={tdBase}>{p.seller_id ?? "-"}</td>
                                <td className={tdBase}>
                                  <button
                                    className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm"
                                    onClick={() => handleDeleteProduct(p.product_id)}
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "orders" && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-4 py-4 sm:px-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">All Orders</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">System-wide order list.</p>
                  </div>
                  {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading orders...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className={tableBase}>
                        <thead>
                          <tr>
                            <th className={thBase}>Order ID</th>
                            <th className={thBase}>User ID</th>
                            <th className={thBase}>Transaction ID</th>
                            <th className={thBase}>Status</th>
                            <th className={thBase}>Delivery</th>
                            <th className={thBase}>Date</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                          {orders.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                No orders found.
                              </td>
                            </tr>
                          ) : (
                            orders.map((o) => (
                              <tr key={o.order_id} className="hover:bg-transparent dark:hover:bg-slate-800/50">
                                <td className={tdBase}>{o.order_id}</td>
                                <td className={tdBase}>{o.user_id}</td>
                                <td className={tdBase}>{o.transaction_id || "-"}</td>
                                <td className={tdBase}>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                    {o.status || "-"}
                                  </span>
                                </td>
                                <td className={tdBase}>
                                  {o.delivery?.name ? (
                                    <div className="text-xs text-slate-600 dark:text-slate-300">
                                      <p className="font-medium">{o.delivery.name}</p>
                                      <p>
                                        {[o.delivery.city, o.delivery.state].filter(Boolean).join(", ") || "-"}
                                      </p>
                                    </div>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                                <td className={tdBase}>{formatDate(o.created_at)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "revenue" && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-4 py-4 sm:px-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Revenue</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Total platform revenue.</p>
                  </div>
                  {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading revenue...</div>
                  ) : revenue ? (
                    <div className="p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-transparent dark:bg-slate-800 rounded-lg p-4">
                          <p className="text-xs uppercase text-slate-500">Total Revenue</p>
                          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                            Rs {revenue.total_revenue.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-transparent dark:bg-slate-800 rounded-lg p-4">
                          <p className="text-xs uppercase text-slate-500">Total Orders</p>
                          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                            {revenue.order_count}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-500">No revenue data.</div>
                  )}
                </div>
              )}

              {activeTab === "logs" && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-4 py-4 sm:px-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">System Logs</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Activity and audit trail.</p>
                  </div>
                  {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading logs...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className={tableBase}>
                        <thead>
                          <tr>
                            <th className={thBase}>User ID</th>
                            <th className={thBase}>Action</th>
                            <th className={thBase}>IP</th>
                            <th className={thBase}>Time</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                          {logs.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                                No logs found.
                              </td>
                            </tr>
                          ) : (
                            logs.map((log, i) => (
                              <tr key={i} className="hover:bg-transparent dark:hover:bg-slate-800/50">
                                <td className={tdBase}>{log.user_id}</td>
                                <td className={`${tdBase} max-w-xs truncate`} title={log.action}>
                                  {log.action || "-"}
                                </td>
                                <td className={tdBase}>{log.ip || "-"}</td>
                                <td className={tdBase}>{formatDate(log.time)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

