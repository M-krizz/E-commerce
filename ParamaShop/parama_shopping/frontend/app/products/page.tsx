"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ProductCard, { type Product } from "@/components/ProductCard";
import Loader from "@/components/Loader";
import ErrorToast from "@/components/ErrorToast";
import api from "@/lib/axios";
import { addToCart } from "@/utils/cart";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await api.get<{ status: string; data?: Product[] }>("/product/all");
        setProducts(res.data?.data ?? []);
      } catch {
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  function handleAdd(product: Product) {
    addToCart(product);
    setSuccess(`${product.name} added to cart.`);
    setTimeout(() => setSuccess(null), 1500);
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Products</h1>
            <p className="text-slate-600">Browse all available items from sellers.</p>
          </div>
        </div>

        {error && <ErrorToast message={error} />}
        {success && <div className="mt-4 text-sm text-emerald-600">{success}</div>}

        {loading ? (
          <div className="mt-10">
            <Loader label="Loading products" />
          </div>
        ) : products.length === 0 ? (
          <p className="mt-6 text-slate-500">No products found.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.product_id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <ProductCard product={product} />
                <button
                  type="button"
                  onClick={() => handleAdd(product)}
                  className="mt-4 w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Add to cart
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

