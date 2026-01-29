"use client";

type LoaderProps = {
  label?: string;
};

export default function Loader({ label = "Loading..." }: LoaderProps) {
  return (
    <div className="flex items-center justify-center gap-3 text-slate-600">
      <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
