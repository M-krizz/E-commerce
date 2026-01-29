"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function PasswordResetSuccessPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md">
        <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl shadow-2xl shadow-blue-950/30 overflow-hidden backdrop-blur-sm">
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
          <div className="p-6 sm:p-8 text-center">
            <h1 className="text-xl font-semibold text-slate-100 mb-2">Password updated</h1>
            <p className="text-sm text-slate-400">
              Your password has been changed successfully.
              {email ? " A confirmation was sent to your registered email." : ""}
            </p>

            <div className="mt-6">
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center py-3 px-4 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors"
              >
                Go to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
