"use client";

type OrderItem = {
  product_id?: number;
  name?: string;
  price?: number;
  quantity?: number;
};

export type OrderRow = {
  order_id: number;
  transaction_id?: string | null;
  status?: string;
  created_at: string;
  items?: OrderItem[];
  total?: number;
  delivery?: {
    name?: string;
    phone?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
};

type OrderTableProps = {
  orders: OrderRow[];
};

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function OrderTable({ orders }: OrderTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Order ID</th>
            <th className="px-4 py-3 text-left font-medium">Transaction ID</th>
            <th className="px-4 py-3 text-left font-medium">Items</th>
            <th className="px-4 py-3 text-left font-medium">Total</th>
            <th className="px-4 py-3 text-left font-medium">Delivery</th>
            <th className="px-4 py-3 text-left font-medium">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {orders.map((o) => (
            <tr key={o.order_id} className="hover:bg-slate-50">
              <td className="px-4 py-3">{o.order_id}</td>
              <td className="px-4 py-3">{o.transaction_id || "-"}</td>
              <td className="px-4 py-3">{o.items?.length ?? 0}</td>
              <td className="px-4 py-3">Rs {(o.total ?? 0).toFixed(2)}</td>
              <td className="px-4 py-3">
                {o.delivery?.name ? (
                  <div className="text-sm text-slate-700">
                    <p className="font-medium">{o.delivery.name}</p>
                    <p className="text-xs text-slate-500">
                      {[o.delivery.city, o.delivery.state, o.delivery.country].filter(Boolean).join(", ") || "-"}
                    </p>
                  </div>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-4 py-3">{formatDate(o.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && (
        <p className="text-center text-slate-500 py-8">No orders yet.</p>
      )}
    </div>
  );
}
