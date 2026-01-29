export interface UserProfile {
  id: number;
  name:string;
  email: string;
  role: number;
  seller_profile?: {
    shop_name?: string;
    phone?: string;
    address?: string;
    category?: string;
    status?: string;
    approved_at?: string;
  };
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("jwt", token);
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("jwt");
}

export function clearToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("jwt");
  }
}

export function setProfile(profile: UserProfile): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("profile", JSON.stringify(profile));
  }
}

export function getProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const profileStr = localStorage.getItem("profile");
    if (!profileStr) return null;
    return JSON.parse(profileStr) as UserProfile;
  } catch (e) {
    return null;
  }
}

export function removeAuth(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("jwt");
    localStorage.removeItem("profile");
  }
}
