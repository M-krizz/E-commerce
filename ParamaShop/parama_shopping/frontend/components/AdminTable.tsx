"use client";

type AdminUserRow = {
  id: number;
  name: string;
  email: string;
  role: number;
  status?: string;
};

type AdminTableProps = {
  users: AdminUserRow[];
  onToggle: (id: number) => void;
};

const ROLE_LABELS: Record<number, string> = {
  1: "USER",
  2: "ADMIN",
  3: "SELLER",
};

export default function AdminTable({ users, onToggle }: AdminTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">ID</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Role</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
                No users found.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-700">{user.id}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{user.name}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{user.email}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{ROLE_LABELS[user.role] ?? user.role}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{user.status ?? "-"}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onToggle(user.id)}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Toggle status
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
