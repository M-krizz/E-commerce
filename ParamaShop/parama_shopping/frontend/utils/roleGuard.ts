import { useState, useEffect } from "react";
import type { UserProfile } from "./auth";

export const ROLES = {
  USER: 1,
  ADMIN: 2,
  SELLER: 3,
};

export function useRoleGuard() {
  const [role, setRole] = useState<number | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const token = localStorage.getItem("jwt");
        const profileStr = localStorage.getItem("profile");
        
        setHasToken(!!token);

        if (profileStr) {
          const profile: UserProfile = JSON.parse(profileStr);
          setRole(profile.role);
        }
      } catch (e) {
        console.error("Failed to parse user profile:", e);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  return { role, hasToken, loading };
}