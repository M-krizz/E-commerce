"use client";

import Link from "next/link";
import { getProfile, getToken } from "@/utils/auth";
import { ROLES } from "@/utils/roleGuard";

export default function Sidebar() {
  const token = typeof window !== "undefined" ? getToken() : null;
  const profile = typeof window !== "undefined" ? getProfile() : null;
  const role = profile?.role ?? null;

  const isAuthed = !!token;

  const links = [
    { href: "/dashboard/user", label: "User Dashboard", show: !isAuthed || role === ROLES.USER },
    { href: "/dashboard/seller", label: "Seller Dashboard", show: role === ROLES.SELLER },
    { href: "/dashboard/admin", label: "Admin Dashboard", show: role === ROLES.ADMIN },
    { href: "/products/list", label: "Product List", show: true },
    { href: "/products/add", label: "Add Product", show: role === ROLES.SELLER },
    { href: "/orders/place", label: "Place Order", show: role === ROLES.USER },
    { href: "/orders/history", label: "Order History", show: role === ROLES.USER },
    { href: "/logs", label: "Logs", show: role === ROLES.ADMIN },
  ];

  return (
    <aside className="w-56 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 min-h-screen p-4">
      <h2 className="font-semibold mb-4 px-2">Menu</h2>
      <ul className="space-y-2">
        {links.filter((l) => l.show).map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="block px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
