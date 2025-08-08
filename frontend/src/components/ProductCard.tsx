import { SafeImage } from '@/components/SafeImage';
import Link from 'next/link';
import { Product } from '@/store/api/productApi';

interface Props {
  product: Product;
}

export const ProductCard = ({ product }: Props) => {
  const price = product.basePrice ?? product.variants?.[0]?.price ?? 0;
  return (
    <Link
      href={`/products/${product._id}`}
      className="group block overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md no-underline"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg bg-gray-50">
        <SafeImage
          src={product.images?.[0]}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-3">
        <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wide text-indigo-600 no-underline">
          {typeof (product as any).category === 'object' && (product as any).category?.name}
        </div>
        <h3 className="line-clamp-1 text-sm font-semibold text-gray-900 md:text-base">
          {product.name}
        </h3>
        {product.brand && (
          <p className="mt-1 text-xs text-gray-500 md:text-sm">{product.brand}</p>
        )}
        <div className="mt-2 flex items-center justify-between no-underline">
          <span className="text-base font-semibold text-gray-900 md:text-lg">${price.toFixed(2)}</span>
          {typeof product.averageRating === 'number' && (
            <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800 no-underline">★ {product.averageRating.toFixed(1)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};


