"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import CartItemRow, { type CartItem } from "@/components/CartItem";
import ErrorToast from "@/components/ErrorToast";
import api from "@/lib/axios";
import { ROLES } from "@/utils/roleGuard";
import { getCart, updateQuantity, removeFromCart, clearCart } from "@/utils/cart";

export default function CartPage() {
  const [cart, setCartState] = useState<CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
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

  useEffect(() => {
    setCartState(getCart());
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function handleIncrease(id?: number) {
    const updated = updateQuantity(id, 1);
    setCartState(updated);
  }

  function handleDecrease(id?: number) {
    const updated = updateQuantity(id, -1);
    setCartState(updated);
  }

  function handleRemove(id?: number) {
    const updated = removeFromCart(id);
    setCartState(updated);
  }

  async function placeOrder() {
    if (cart.length === 0) {
      setError("Cart is empty.");
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

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    setTransactionId(null);

    try {
      const items = cart.map((item) => ({
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));
      const res = await api.post<{ status: string; data?: { transaction_id?: string } }>("/order/place", {
        items,
        total,
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
      });
      setSuccess("Order placed successfully.");
      setTransactionId(res.data?.data?.transaction_id ?? null);
      clearCart();
      setCartState([]);
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
    } catch (err) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(message || "Failed to place order.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ProtectedRoute allowedRoles={[ROLES.USER]}>
      <div className="min-h-screen bg-transparent text-slate-900">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-2xl font-semibold">Your Cart</h1>
          <p className="text-slate-600 mt-1">Review items and enter delivery details.</p>

          <div className="mt-6 space-y-4">
            {cart.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
                Your cart is empty.
              </div>
            ) : (
              cart.map((item) => (
                <CartItemRow
                  key={item.product_id}
                  item={item}
                  onIncrease={() => handleIncrease(item.product_id)}
                  onDecrease={() => handleDecrease(item.product_id)}
                  onRemove={() => handleRemove(item.product_id)}
                />
              ))
            )}
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Delivery details</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={delivery.name}
                onChange={(e) => setDelivery((d) => ({ ...d, name: e.target.value }))}
                placeholder="Full name *"
                className="rounded-md border border-slate-200 px-3 py-2"
              />
              <input
                value={delivery.phone}
                onChange={(e) => setDelivery((d) => ({ ...d, phone: e.target.value }))}
                placeholder="Phone *"
                className="rounded-md border border-slate-200 px-3 py-2"
              />
              <input
                value={delivery.address_line1}
                onChange={(e) => setDelivery((d) => ({ ...d, address_line1: e.target.value }))}
                placeholder="Address line 1 *"
                className="rounded-md border border-slate-200 px-3 py-2 md:col-span-2"
              />
              <input
                value={delivery.address_line2}
                onChange={(e) => setDelivery((d) => ({ ...d, address_line2: e.target.value }))}
                placeholder="Address line 2"
                className="rounded-md border border-slate-200 px-3 py-2 md:col-span-2"
              />
              <input
                value={delivery.city}
                onChange={(e) => setDelivery((d) => ({ ...d, city: e.target.value }))}
                placeholder="City *"
                className="rounded-md border border-slate-200 px-3 py-2"
              />
              <input
                value={delivery.state}
                onChange={(e) => setDelivery((d) => ({ ...d, state: e.target.value }))}
                placeholder="State *"
                className="rounded-md border border-slate-200 px-3 py-2"
              />
              <input
                value={delivery.postal_code}
                onChange={(e) => setDelivery((d) => ({ ...d, postal_code: e.target.value }))}
                placeholder="Postal code *"
                className="rounded-md border border-slate-200 px-3 py-2"
              />
              <input
                value={delivery.country}
                onChange={(e) => setDelivery((d) => ({ ...d, country: e.target.value }))}
                placeholder="Country *"
                className="rounded-md border border-slate-200 px-3 py-2"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>Rs {total.toFixed(2)}</span>
            </div>
            {error && <ErrorToast message={error} />}
            {success && <div className="text-sm text-emerald-600">{success}</div>}
            {transactionId && (
              <div className="text-sm text-slate-700">
                Transaction ID: <span className="font-semibold">{transactionId}</span>
              </div>
            )}
            <button
              type="button"
              onClick={placeOrder}
              disabled={isSubmitting || cart.length === 0}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {isSubmitting ? "Placing order..." : "Place order"}
            </button>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

