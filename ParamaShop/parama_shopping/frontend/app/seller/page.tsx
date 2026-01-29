"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorToast from "@/components/ErrorToast";
import Loader from "@/components/Loader";
import api from "@/lib/axios";
import { ROLES } from "@/utils/roleGuard";
import type { Product } from "@/components/ProductCard";

type SellerOrder = {
  order_id: number;
  user_id: number;
  transaction_id?: string | null;
  created_at?: string;
  items?: { product_id?: number; name?: string; price?: number; quantity?: number }[];
};

export default function SellerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [form, setForm] = useState({
    product_id: undefined as number | undefined,
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
  });
  const [saving, setSaving] = useState(false);

  async function loadProducts() {
    try {
      const res = await api.get<{ status: string; data?: Product[] }>("/product/my-products");
      setProducts(res.data?.data ?? []);
    } catch {
      setError("Failed to load products.");
    }
  }

  async function loadOrders() {
    try {
      const res = await api.get<{ status: string; data?: SellerOrder[] }>("/order/seller-orders");
      setOrders(res.data?.data ?? []);
    } catch {
      setError("Failed to load orders.");
    }
  }

  useEffect(() => {
    async function init() {
      setLoading(true);
      setError(null);
      await Promise.all([loadProducts(), loadOrders()]);
      setLoading(false);
    }
    init();
  }, []);

  function startEdit(product: Product) {
    setForm({
      product_id: product.product_id,
      name: product.name,
      description: product.description || "",
      category: product.category || "",
      price: String(product.price),
      stock: String(product.stock ?? ""),
    });
  }

  function resetForm() {
    setForm({ product_id: undefined, name: "", description: "", category: "", price: "", stock: "" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock),
      };
      if (form.product_id) {
        await api.put(`/product/update/${form.product_id}`, payload);
      } else {
        await api.post("/product/add", payload);
      }
      await loadProducts();
      resetForm();
      setActiveTab("products");
    } catch {
      setError("Failed to save product.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id?: number) {
    if (!id) return;
    try {
      await api.delete(`/product/delete/${id}`);
      await loadProducts();
    } catch {
      setError("Failed to delete product.");
    }
  }

  return (
    <ProtectedRoute allowedRoles={[ROLES.SELLER]}>
      <div className="min-h-screen bg-transparent text-slate-900">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-2xl font-semibold">Seller Panel</h1>
          <p className="text-slate-600 mt-1">Manage products and track orders.</p>

          <div className="mt-6 flex gap-4 text-sm font-medium">
            {(["products", "orders"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-md px-4 py-2 ${
                  activeTab === tab ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-700"
                }`}
              >
                {tab === "products" ? "Products" : "Orders"}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {error && <ErrorToast message={error} />}
            {loading ? (
              <Loader label="Loading seller data" />
            ) : activeTab === "products" ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
                  <h2 className="text-lg font-semibold">{form.product_id ? "Edit product" : "Add product"}</h2>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Product name"
                    className="w-full rounded-md border border-slate-200 px-3 py-2"
                    required
                  />
                  <input
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    placeholder="Category"
                    className="w-full rounded-md border border-slate-200 px-3 py-2"
                    required
                  />
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Description"
                    className="w-full rounded-md border border-slate-200 px-3 py-2"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      placeholder="Price"
                      type="number"
                      step="0.01"
                      className="w-full rounded-md border border-slate-200 px-3 py-2"
                      required
                    />
                    <input
                      value={form.stock}
                      onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                      placeholder="Stock"
                      type="number"
                      className="w-full rounded-md border border-slate-200 px-3 py-2"
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                      {saving ? "Saving..." : form.product_id ? "Update" : "Add"}
                    </button>
                    {form.product_id && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-transparent"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                <div className="lg:col-span-2 space-y-4">
                  {products.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
                      No products yet.
                    </div>
                  ) : (
                    products.map((product) => (
                      <div key={product.product_id} className="rounded-lg border border-slate-200 bg-white p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base font-semibold text-slate-900">{product.name}</h3>
                            <p className="text-sm text-slate-600">{product.category}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(product)}
                              className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(product.product_id)}
                              className="text-xs font-semibold text-red-600 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 mt-2">Rs {product.price}</p>
                        <p className="text-xs text-slate-500">Stock: {product.stock ?? "-"}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-transparent">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Order</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">User</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Transaction</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Items</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">
                          No orders yet.
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.order_id} className="hover:bg-transparent">
                          <td className="px-4 py-3 text-sm text-slate-700">{order.order_id}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{order.user_id}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{order.transaction_id || "-"}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{order.items?.length ?? 0}</td>
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

