"use client";

import type { Product } from "@/components/ProductCard";

export type CartItem = Product & { quantity: number };

type CartItemProps = {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
};

export default function CartItemRow({ item, onIncrease, onDecrease, onRemove }: CartItemProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-base font-semibold text-slate-900">{item.name}</h3>
        <p className="text-sm text-slate-600">Rs {item.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onDecrease}
            className="px-3 py-1 text-slate-600 hover:bg-slate-100 rounded-l-full"
          >
            -
          </button>
          <span className="px-3 text-sm font-medium text-slate-900">{item.quantity}</span>
          <button
            type="button"
            onClick={onIncrease}
            className="px-3 py-1 text-slate-600 hover:bg-slate-100 rounded-r-full"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-sm font-medium text-rose-600 hover:text-rose-700"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
