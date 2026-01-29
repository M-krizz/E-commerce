"use client";

type ErrorToastProps = {
  message?: string | null;
};

export default function ErrorToast({ message }: ErrorToastProps) {
  if (!message) return null;
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
      {message}
    </div>
  );
}
