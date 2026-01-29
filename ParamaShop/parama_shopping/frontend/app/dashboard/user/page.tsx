"use client";

import { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import ProductCard, { type Product } from "@/components/ProductCard";
import OrderTable, { type OrderRow } from "@/components/OrderTable";
import api from "@/lib/axios";
import { ROLES } from "@/utils/roleGuard";
import { getProfile } from "@/utils/auth";

type CartItem = {
  product: Product;
  quantity: number;
};

export default function UserDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<"products" | "cart" | "orders">("products");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState("");
  const [delivery, setDelivery] = useState({
    name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
  });

  const loadProducts = useCallback(async () => {
    try {
      const res = await api.get<{ status: string; data?: Product[] }>("/product/all");
      const data = res.data?.data ?? [];
      setProducts(data);
    } catch (_err) {
      setError("Failed to load products. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const res = await api.get<{ status: string; data?: OrderRow[] }>("/user/orders");
      const data = res.data?.data ?? [];
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders:", err);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, [loadProducts, loadOrders]);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.product_id === product.product_id);
      if (existing) {
        return prev.map((item) =>
          item.product.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setOrderSuccess("");
  }

  function updateCartQuantity(productId: number | undefined, delta: number) {
    if (!productId) return;
    setCart((prev) => {
      const item = prev.find((i) => i.product.product_id === productId);
      if (!item) return prev;
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((i) => i.product.product_id !== productId);
      }
      return prev.map((i) =>
        i.product.product_id === productId ? { ...i, quantity: newQty } : i
      );
    });
  }

  function removeFromCart(productId: number | undefined) {
    if (!productId) return;
    setCart((prev) => prev.filter((item) => item.product.product_id !== productId));
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalSpent = orders.reduce((sum, order) => sum + (order.total ?? 0), 0);
  const cartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const orderCount = orders.length;
  const productCount = products.length;

  async function placeOrder() {
    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (
      !delivery.name.trim() ||
      !delivery.phone.trim() ||
      !delivery.address_line1.trim() ||
      !delivery.city.trim() ||
      !delivery.state.trim() ||
      !delivery.postal_code.trim() ||
      !delivery.country.trim()
    ) {
      setError("Please fill in all required delivery details.");
      return;
    }

    setPlacingOrder(true);
    setError("");
    setOrderSuccess("");

    try {
      const orderData = {
        items: cart.map((item) => ({
          product_id: item.product.product_id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
        total: cartTotal,
        timestamp: new Date().toISOString(),
        delivery: {
          name: delivery.name.trim(),
          phone: delivery.phone.trim(),
          address_line1: delivery.address_line1.trim(),
          address_line2: delivery.address_line2.trim(),
          city: delivery.city.trim(),
          state: delivery.state.trim(),
          postal_code: delivery.postal_code.trim(),
          country: delivery.country.trim(),
        },
      };

      const res = await api.post<{ status: string; message?: string; data?: { transaction_id?: string } }>(
        "/order/place",
        orderData
      );
      setOrderSuccess("Order placed successfully!");
      setCart([]);
      setDelivery({
        name: "",
        phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
      });
      await loadOrders();
      setActiveTab("orders");
    } catch (err) {
      const ax = err as { response?: { data?: { message?: string } } };
      setError(ax.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  }

  const profile = getProfile();
  const userName = profile?.name || "User";

  return (
    <ProtectedRoute allowedRoles={[ROLES.USER]}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Welcome, {userName}
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Available products</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{productCount}</p>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Cart items</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{cartItems}</p>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Orders placed</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{orderCount}</p>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Total spent</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Rs {totalSpent.toFixed(2)}</p>
                </div>
              </div>

              <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="flex gap-4 sm:gap-6">
                  {(["products", "cart", "orders"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setError("");
                        setOrderSuccess("");
                      }}
                      className={`px-4 py-2 font-medium text-sm sm:text-base transition-colors border-b-2 ${
                        activeTab === tab
                          ? "border-blue-600 text-blue-600 dark:text-blue-400"
                          : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                      }`}
                    >
                      {tab === "products" && "Products"}
                      {tab === "cart" && `Cart ${cart.length > 0 ? `(${cart.length})` : ""}`}
                      {tab === "orders" && "Order History"}
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

              {orderSuccess && (
                <div
                  className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm"
                  role="alert"
                >
                  {orderSuccess}
                </div>
              )}

              {activeTab === "products" && (
                <div>
                  {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading products...</div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No products available.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                      {products.map((product) => (
                        <div key={product.product_id} className="relative">
                          <ProductCard product={product} />
                          <button
                            onClick={() => addToCart(product)}
                            disabled={product.stock === 0}
                            className="mt-3 w-full py-2 px-4 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                          >
                            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "cart" && (
                <div>
                  {cart.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      Your cart is empty. Add products from the Products tab.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                        <div className="divide-y divide-gray-200 dark:divide-gray-800">
                          {cart.map((item) => (
                            <div
                              key={item.product.product_id}
                              className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4"
                            >
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                  {item.product.name}
                                </h3>
                                {item.product.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                                    {item.product.description}
                                  </p>
                                )}
                                <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mt-2">
                                  Rs {item.product.price} x {item.quantity} = Rs {item.product.price * item.quantity}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                                  <button
                                    onClick={() => updateCartQuantity(item.product.product_id, -1)}
                                    className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    aria-label="Decrease quantity"
                                  >
                                    -
                                  </button>
                                  <span className="px-4 py-1 text-gray-900 dark:text-gray-100 min-w-[3rem] text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateCartQuantity(item.product.product_id, 1)}
                                    className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    aria-label="Increase quantity"
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  onClick={() => removeFromCart(item.product.product_id)}
                                  className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                  aria-label="Remove from cart"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                          <div className="mb-6 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              Delivery details
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Full name <span className="text-red-500">*</span>
                                </label>
                                <input
                                  value={delivery.name}
                                  onChange={(e) => setDelivery((d) => ({ ...d, name: e.target.value }))}
                                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                  placeholder="Recipient name"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Phone <span className="text-red-500">*</span>
                                </label>
                                <input
                                  value={delivery.phone}
                                  onChange={(e) => setDelivery((d) => ({ ...d, phone: e.target.value }))}
                                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                  placeholder="Contact number"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Address line 1 <span className="text-red-500">*</span>
                                </label>
                                <input
                                  value={delivery.address_line1}
                                  onChange={(e) => setDelivery((d) => ({ ...d, address_line1: e.target.value }))}
                                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                  placeholder="Street address"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Address line 2
                                </label>
                                <input
                                  value={delivery.address_line2}
                                  onChange={(e) => setDelivery((d) => ({ ...d, address_line2: e.target.value }))}
                                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                  placeholder="Apartment, suite, landmark"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  City <span className="text-red-500">*</span>
                                </label>
                                <input
                                  value={delivery.city}
                                  onChange={(e) => setDelivery((d) => ({ ...d, city: e.target.value }))}
                                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                  placeholder="City"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  State <span className="text-red-500">*</span>
                                </label>
                                <input
                                  value={delivery.state}
                                  onChange={(e) => setDelivery((d) => ({ ...d, state: e.target.value }))}
                                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                  placeholder="State"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Postal code <span className="text-red-500">*</span>
                                </label>
                                <input
                                  value={delivery.postal_code}
                                  onChange={(e) => setDelivery((d) => ({ ...d, postal_code: e.target.value }))}
                                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                  placeholder="Postal code"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Country <span className="text-red-500">*</span>
                                </label>
                                <input
                                  value={delivery.country}
                                  onChange={(e) => setDelivery((d) => ({ ...d, country: e.target.value }))}
                                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                  placeholder="Country"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total:</span>
                            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                              Rs {cartTotal.toFixed(2)}
                            </span>
                          </div>
                          <button
                            onClick={placeOrder}
                            disabled={placingOrder || cart.length === 0}
                            className="w-full py-3 px-4 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                          >
                            {placingOrder ? "Placing Order..." : "Place Order"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "orders" && (
                <div>
                  {orders.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No orders yet.</div>
                  ) : (
                    <OrderTable orders={orders} />
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
