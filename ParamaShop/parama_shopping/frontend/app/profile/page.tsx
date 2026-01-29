"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loader from "@/components/Loader";
import ErrorToast from "@/components/ErrorToast";
import api from "@/lib/axios";
import { ROLES } from "@/utils/roleGuard";
import { setProfile, type UserProfile } from "@/utils/auth";

const ROLE_LABELS: Record<number, string> = {
  [ROLES.USER]: "USER",
  [ROLES.ADMIN]: "ADMIN",
  [ROLES.SELLER]: "SELLER",
};

export default function ProfilePage() {
  const [profile, setProfileState] = useState<(UserProfile & { status?: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.get<{ status: string; data?: UserProfile & { status?: string } }>("/user/profile");
        if (res.data?.data) {
          setProfileState(res.data.data);
          setProfile(res.data.data);
        }
      } catch {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  return (
    <ProtectedRoute allowedRoles={[ROLES.USER, ROLES.SELLER, ROLES.ADMIN]}>
      <div className="min-h-screen bg-transparent text-slate-900">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <Link
              href="/profile/edit"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Edit profile
            </Link>
          </div>

          <div className="mt-6">
            {error && <ErrorToast message={error} />}
            {loading ? (
              <Loader label="Loading profile" />
            ) : profile ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
                <div>
                  <p className="text-sm text-slate-500">Name</p>
                  <p className="text-lg font-semibold text-slate-900">{profile.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="text-lg font-semibold text-slate-900">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Role</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {ROLE_LABELS[profile.role] ?? profile.role}
                  </p>
                </div>
                {profile.status && (
                  <div>
                    <p className="text-sm text-slate-500">Account status</p>
                    <p className="text-lg font-semibold text-slate-900">{profile.status}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-500">Profile not available.</p>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

