"use client";
import { SafeImage } from '@/components/SafeImage';
import { useParams } from 'next/navigation';
import { useGetProductByIdQuery, useGetRelatedProductsQuery } from '@/store/api/productApi';
import { useAppDispatch } from '@/store/store';
import { addItem } from '@/store/features/cartSlice';
import { useRouter } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data, isLoading } = useGetProductByIdQuery(id);
  const { data: related } = useGetRelatedProductsQuery({ id, limit: 8 });
  const dispatch = useAppDispatch();
  const router = useRouter();

  const product = data?.data.product;

  if (isLoading || !product) {
    return <div className="mx-auto max-w-7xl px-4 py-6">Loading...</div>;
  }

  const price = product.basePrice ?? product.variants?.[0]?.price ?? 0;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-50">
          <SafeImage src={product.images?.[0]} alt={product.name} fill className="object-cover" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          {product.brand && <p className="mt-1 text-sm text-gray-600">{product.brand}</p>}
          <p className="mt-4 text-lg font-bold">${price.toFixed(2)}</p>
          <button
            className="btn-primary mt-3"
            onClick={() => {
              dispatch(addItem({ productId: product._id, name: product.name, image: product.images?.[0], price, quantity: 1 }));
              router.push('/cart');
            }}
          >
            Add to cart
          </button>
          {product.averageRating !== undefined && (
            <p className="mt-2 text-sm text-yellow-600">★ {product.averageRating?.toFixed(1)} ({product.totalReviews})</p>
          )}
          <p className="mt-4 whitespace-pre-line text-sm text-gray-700">{product.description}</p>
        </div>
      </div>

      {related?.data.products?.length ? (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">Related products</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {related.data.products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}


