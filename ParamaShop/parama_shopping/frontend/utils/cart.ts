import type { Product } from "@/components/ProductCard";
import type { CartItem } from "@/components/CartItem";

const CART_KEY = "cart_items";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(product: Product): CartItem[] {
  const cart = getCart();
  const existing = cart.find((item) => item.product_id === product.product_id);
  let updated: CartItem[];
  if (existing) {
    updated = cart.map((item) =>
      item.product_id === product.product_id ? { ...item, quantity: item.quantity + 1 } : item
    );
  } else {
    updated = [...cart, { ...product, quantity: 1 }];
  }
  setCart(updated);
  return updated;
}

export function updateQuantity(productId: number | undefined, delta: number): CartItem[] {
  if (productId == null) return getCart();
  const cart = getCart();
  const updated = cart
    .map((item) =>
      item.product_id === productId ? { ...item, quantity: item.quantity + delta } : item
    )
    .filter((item) => item.quantity > 0);
  setCart(updated);
  return updated;
}

export function removeFromCart(productId: number | undefined): CartItem[] {
  if (productId == null) return getCart();
  const updated = getCart().filter((item) => item.product_id !== productId);
  setCart(updated);
  return updated;
}

export function clearCart(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_KEY);
}
