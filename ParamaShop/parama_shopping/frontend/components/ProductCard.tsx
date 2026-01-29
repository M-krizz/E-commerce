"use client";

export type Product = {
  product_id?: number;
  name: string;
  description?: string;
  category?: string;
  price: number;
  stock?: number;
  image?: string;
};

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg">
      {product.image && (
        <div
          className="mb-4 h-40 w-full rounded-xl bg-cover bg-center"
          style={{ backgroundImage: `url(${product.image})` }}
        />
      )}
      <h3 className="font-semibold text-lg text-slate-900">{product.name}</h3>
      {product.category && (
        <p className="text-xs uppercase tracking-wide text-slate-500 mt-2">{product.category}</p>
      )}
      {product.description && (
        <p className="text-slate-600 text-sm mt-1 line-clamp-2">
          {product.description}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between">
        <p className="text-lg font-semibold text-slate-900">Rs {product.price}</p>
        {product.stock != null && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            Stock: {product.stock}
          </span>
        )}
      </div>
    </div>
  );
}
