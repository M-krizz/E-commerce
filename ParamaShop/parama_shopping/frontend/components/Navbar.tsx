"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getProfile, getToken, clearToken } from "@/utils/auth";
import { ROLES } from "@/utils/roleGuard";

type NavItem = {
  href: string;
  label: string;
};

function getMenuForRole(role: number | null, authenticated: boolean): NavItem[] {
  if (!authenticated || role == null) {
    return [
      { href: "/home", label: "Home" },
      { href: "/products", label: "Products" },
      { href: "/login", label: "Login" },
    ];
  }
  if (role === ROLES.ADMIN) {
    return [
      { href: "/home", label: "Home" },
      { href: "/products", label: "Products" },
      { href: "/orders", label: "Orders" },
      { href: "/profile", label: "Profile" },
      { href: "/admin", label: "Admin" },
    ];
  }
  if (role === ROLES.SELLER) {
    return [
      { href: "/home", label: "Home" },
      { href: "/products", label: "Products" },
      { href: "/orders", label: "Orders" },
      { href: "/profile", label: "Profile" },
      { href: "/seller", label: "Seller Panel" },
    ];
  }
  return [
    { href: "/home", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/cart", label: "Cart" },
    { href: "/orders", label: "Orders" },
    { href: "/profile", label: "Profile" },
  ];
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  const token = mounted ? getToken() : null;
  const profile = mounted ? getProfile() : null;
  const authenticated = !!token;
  const role = profile?.role ?? null;
  const menuItems = getMenuForRole(role, authenticated);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function handleLogout() {
    clearToken();
    setOpen(false);
    router.push("/login");
  }

  const linkClass =
    "block px-4 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-md transition-colors";
  const linkClassActive = "bg-slate-100 text-slate-900 font-medium";

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
        <Link
          href="/home"
          className="text-xl font-semibold text-slate-900 whitespace-nowrap"
        >
          Parama Shopping
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {authenticated && (
            <button
              type="button"
              onClick={handleLogout}
              className="ml-2 px-3 py-2 rounded-md text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="md:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white/95">
          <div className="flex flex-col gap-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${linkClass} ${pathname === item.href ? linkClassActive : ""}`}
              >
                {item.label}
              </Link>
            ))}
            {authenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-md font-medium transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
