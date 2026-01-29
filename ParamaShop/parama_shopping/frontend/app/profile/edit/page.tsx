"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loader from "@/components/Loader";
import ErrorToast from "@/components/ErrorToast";
import ProfileForm, { type ProfileFormValues } from "@/components/ProfileForm";
import api from "@/lib/axios";
import { ROLES } from "@/utils/roleGuard";
import { setProfile, type UserProfile } from "@/utils/auth";

export default function ProfileEditPage() {
  const [initial, setInitial] = useState<ProfileFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.get<{ status: string; data?: UserProfile }>("/user/profile");
        if (res.data?.data) {
          setInitial({ name: res.data.data.name, email: res.data.data.email });
        }
      } catch {
        setError("Failed to load profile.");
      }
    }
    loadProfile();
  }, []);

  async function handleSave(values: ProfileFormValues) {
    const res = await api.put<{ status: string; data?: UserProfile }>("/user/profile", values);
    if (res.data?.data) {
      setProfile(res.data.data);
    }
  }

  return (
    <ProtectedRoute allowedRoles={[ROLES.USER, ROLES.SELLER, ROLES.ADMIN]}>
      <div className="min-h-screen bg-transparent text-slate-900">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-2xl font-semibold">Edit profile</h1>
          <p className="text-slate-600 mt-1">Update your name or email address.</p>

          <div className="mt-6">
            {error && <ErrorToast message={error} />}
            {!initial ? (
              <Loader label="Loading profile" />
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <ProfileForm initialValues={initial} onSave={handleSave} />
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

