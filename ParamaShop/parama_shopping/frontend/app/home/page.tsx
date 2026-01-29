"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { type Product } from "@/components/ProductCard";

const MOCK_PRODUCTS: (Product & { image?: string })[] = [
  {
    product_id: 1,
    name: "Nova Wireless Headphones",
    description: "Studio-grade sound with 40-hour battery life.",
    category: "Electronics",
    price: 2499,
    stock: 32,
    image: "https://images.unsplash.com/photo-1518441902113-f5a56a9c2c0c?auto=format&fit=crop&w=800&q=80",
  },
  {
    product_id: 2,
    name: "Urban Carry Backpack",
    description: "Water-resistant with padded laptop compartment.",
    category: "Accessories",
    price: 1799,
    stock: 18,
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
  },
  {
    product_id: 3,
    name: "Aura Desk Lamp",
    description: "Warm LED glow with touch dimming control.",
    category: "Home",
    price: 899,
    stock: 25,
    image: "https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=800&q=80",
  },
  {
    product_id: 4,
    name: "Everyday Sneakers",
    description: "Cushioned sole built for all-day comfort.",
    category: "Footwear",
    price: 2199,
    stock: 21,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  },
  {
    product_id: 5,
    name: "Zen Brew Coffee Set",
    description: "Premium beans and ceramic pour-over kit.",
    category: "Kitchen",
    price: 1299,
    stock: 44,
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
  },
  {
    product_id: 6,
    name: "Smart Fitness Band",
    description: "Track workouts, sleep, and heart rate.",
    category: "Fitness",
    price: 1399,
    stock: 54,
    image: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=800&q=80",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-12 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Parama Shopping
            </p>
            <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-slate-900">
              Shop smarter with a modern, curated marketplace
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Browse trending products without logging in. Create an account to unlock secure ordering, OTP verification,
              and order tracking.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Explore products
              </Link>
              <Link
                href="/login"
                className="rounded-md border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-white"
              >
                Sign in to order
              </Link>
            </div>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-8 text-white shadow-xl">
            <h2 className="text-2xl font-semibold">Why Parama Shopping?</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li>Secure JWT + OTP login flow</li>
              <li>Role-based dashboards for sellers and admins</li>
              <li>Fast checkout with delivery details and tracking</li>
              <li>Curated categories across tech, fashion, and home</li>
            </ul>
          </div>
        </section>

        <section className="py-12">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Featured picks</h2>
              <p className="text-slate-600 mt-1">Mock data for a fast demo experience.</p>
            </div>
            <Link href="/products" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
              View all products →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_PRODUCTS.map((product) => (
              <div key={product.product_id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div
                  className="h-44 bg-cover bg-center"
                  style={{ backgroundImage: `url(${product.image})` }}
                />
                <div className="p-5 space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                  <p className="text-sm text-slate-600">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-slate-900">Rs {product.price}</span>
                    <span className="text-xs uppercase tracking-wide text-slate-500">{product.category}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                      View product
                    </button>
                    <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

