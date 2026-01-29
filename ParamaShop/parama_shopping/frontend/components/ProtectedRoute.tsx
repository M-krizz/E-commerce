"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRoleGuard } from "@/utils/roleGuard";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: number[];
};

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { hasToken, role, loading } = useRoleGuard();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading) return;
    if (!hasToken) {
      router.replace("/login");
      return;
    }
    if (allowedRoles != null && allowedRoles.length > 0 && (role == null || !allowedRoles.includes(role))) {
      router.replace("/home");
      return;
    }
  }, [mounted, loading, hasToken, role, allowedRoles, router]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }
  if (!hasToken) return null;
  if (allowedRoles != null && allowedRoles.length > 0 && (role == null || !allowedRoles.includes(role))) return null;

  return <>{children}</>;
}
