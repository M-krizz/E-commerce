"use client";

import { useState, useEffect, FormEvent, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import ProductCard, { type Product } from "@/components/ProductCard";
import api from "@/lib/axios";
import { ROLES } from "@/utils/roleGuard";
import { getProfile } from "@/utils/auth";

type SellerOrderItem = {
  product_id?: number;
  name?: string;
  price?: number;
  quantity?: number;
};

type SellerOrder = {
  order_id: number;
  transaction_id?: string | null;
  user_id: number;
  created_at: string;
  items: SellerOrderItem[];
  total_for_seller?: number;
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

export default function SellerDashboardPage() {
  const profile = getProfile();
  const sellerId = profile?.id ?? null;

  const [activeTab, setActiveTab] = useState<"add" | "products" | "orders">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<{ status: string; data?: (Product & { seller_id?: number })[] }>(
        "/product/all"
      );
      const all = res.data?.data ?? [];
      if (sellerId != null) {
        setProducts(all.filter((p) => p.seller_id === sellerId));
      } else {
        setProducts(all);
      }
    } catch (_err) {
      setError("Failed to load products. Please refresh the page.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  const loadOrders = useCallback(async () => {
    try {
      const res = await api.get<{ status: string; data?: SellerOrder[] }>("/order/seller-orders");
      const data = res.data?.data ?? [];
      setOrders(data);
    } catch (err) {
      console.error("Failed to load seller orders:", err);
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, [loadProducts, loadOrders]);

  async function handleAddProduct(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const name = form.name.trim();
    const description = form.description.trim();
    const category = form.category.trim();
    const price = parseFloat(form.price);
    const stock = parseInt(form.stock, 10);

    if (!name) {
      setError("Product name is required.");
      return;
    }
    if (!category) {
      setError("Category is required.");
      return;
    }
    if (Number.isNaN(price) || price < 0) {
      setError("Please enter a valid price.");
      return;
    }
    if (Number.isNaN(stock) || stock < 0) {
      setError("Please enter a valid stock quantity.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post<{ status: string; message?: string }>("/product/add", {
        name,
        description: description || "",
        category,
        price,
        stock,
      });
      setSuccess("Product added successfully.");
      setForm({ name: "", description: "", category: "", price: "", stock: "" });
      await loadProducts();
      setActiveTab("products");
    } catch (err) {
      const ax = err as { response?: { data?: { message?: string } } };
      setError(ax.response?.data?.message ?? "Failed to add product. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  }

  const userName = profile?.name ?? "Seller";
  const sellerProfile = profile?.seller_profile;

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_for_seller ?? 0), 0);
  const recentOrders = orders.filter((o) => {
    const date = new Date(o.created_at).getTime();
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return !Number.isNaN(date) && date >= weekAgo;
  });

  const categoryCount = products.reduce<Record<string, number>>((acc, p) => {
    const key = (p.category || "Uncategorized").trim() || "Uncategorized";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";

  const productNameById = products.reduce<Record<number, string>>((acc, p) => {
    if (p.product_id != null) acc[p.product_id] = p.name;
    return acc;
  }, {});

  const revenueByProduct = orders.reduce<Record<number, number>>((acc, o) => {
    for (const item of o.items || []) {
      if (item.product_id == null) continue;
      const price = item.price ?? 0;
      const qty = item.quantity ?? 0;
      acc[item.product_id] = (acc[item.product_id] || 0) + price * qty;
    }
    return acc;
  }, {});

  const topProducts = Object.entries(revenueByProduct)
    .map(([id, revenue]) => ({
      product_id: Number(id),
      name: productNameById[Number(id)] || `Product ${id}`,
      revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <ProtectedRoute allowedRoles={[ROLES.SELLER]}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Seller Dashboard - {userName}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Manage products, orders, and revenue in one place.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 min-w-[260px]">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Seller profile</p>
                  <div className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <p>
                      <span className="font-medium text-gray-900 dark:text-gray-100">Shop:</span>{" "}
                      {sellerProfile?.shop_name || "Not set"}
                    </p>
                    <p>
                      <span className="font-medium text-gray-900 dark:text-gray-100">Category:</span>{" "}
                      {sellerProfile?.category || "Not set"}
                    </p>
                    <p>
                      <span className="font-medium text-gray-900 dark:text-gray-100">Phone:</span>{" "}
                      {sellerProfile?.phone || "Not set"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {sellerProfile?.address || "Address not set"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Available products</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{products.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">New orders (7 days)</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{recentOrders.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Top category</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{topCategory}</p>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Rs {totalRevenue.toFixed(2)}</p>
                </div>
              </div>

              <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="flex gap-4 sm:gap-6">
                  {(["products", "orders", "add"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setError("");
                        setSuccess("");
                      }}
                      className={`px-4 py-2 font-medium text-sm sm:text-base transition-colors border-b-2 ${
                        activeTab === tab
                          ? "border-blue-600 text-blue-600 dark:text-blue-400"
                          : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                      }`}
                    >
                      {tab === "add" && "Add Product"}
                      {tab === "products" && "My Products"}
                      {tab === "orders" && "Track Orders"}
                    </button>
                  ))}
                </nav>
              </div>

              {error && (
                <div
                  className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm"
                  role="alert"
                >
                  {success}
                </div>
              )}

              {activeTab === "add" && (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden max-w-2xl">
                  <div className="p-6 sm:p-8">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                      Add new product
                    </h2>
                    <form onSubmit={handleAddProduct} className="space-y-5">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Product name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder="e.g. Wireless Headphones"
                          required
                          className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
                          disabled={submitting}
                        />
                      </div>
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description
                        </label>
                        <textarea
                          id="description"
                          rows={3}
                          value={form.description}
                          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                          placeholder="Brief product description"
                          className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:opacity-60"
                          disabled={submitting}
                        />
                      </div>
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="category"
                          type="text"
                          value={form.category}
                          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                          placeholder="Electronics, Fashion, Home"
                          required
                          className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
                          disabled={submitting}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Price <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="price"
                            type="number"
                            min={0}
                            step={0.01}
                            value={form.price}
                            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                            placeholder="0.00"
                            required
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
                            disabled={submitting}
                          />
                        </div>
                        <div>
                          <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Stock <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="stock"
                            type="number"
                            min={0}
                            value={form.stock}
                            onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                            placeholder="0"
                            required
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
                            disabled={submitting}
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full sm:w-auto px-6 py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {submitting ? "Adding..." : "Add Product"}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === "products" && (
                <div>
                  {loading ? (
                    <p className="text-gray-500 py-8">Loading products...</p>
                  ) : products.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 sm:p-12 text-center">
                      <p className="text-gray-600 dark:text-gray-400">You have not added any products yet.</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Add one from the "Add Product" tab.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                      {products.map((p) => (
                        <ProductCard key={p.product_id} product={p} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "orders" && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                    {orders.length === 0 ? (
                      <div className="p-8 sm:p-12 text-center text-gray-600 dark:text-gray-400">
                        No orders for your products yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Order ID</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Transaction ID</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Customer ID</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Items</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Revenue</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Delivery</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {orders.map((o) => (
                              <tr key={o.order_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{o.order_id}</td>
                                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{o.transaction_id || "-"}</td>
                                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{o.user_id}</td>
                                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{o.items?.length ?? 0}</td>
                                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">Rs {(o.total_for_seller ?? 0).toFixed(2)}</td>
                                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                                  {o.delivery?.name ? (
                                    <div className="text-xs text-gray-600 dark:text-gray-300">
                                      <p className="font-medium">{o.delivery.name}</p>
                                      <p>
                                        {[o.delivery.city, o.delivery.state].filter(Boolean).join(", ") || "-"}
                                      </p>
                                    </div>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(o.created_at)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Revenue by product</h3>
                    {topProducts.length === 0 ? (
                      <p className="text-sm text-gray-500">No revenue data yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {topProducts.map((p) => (
                          <div key={p.product_id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{p.name}</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">Rs {p.revenue.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
