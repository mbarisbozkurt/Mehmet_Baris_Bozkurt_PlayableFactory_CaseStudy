"use client";
import { SafeImage } from '@/components/SafeImage';
import { useParams } from 'next/navigation';
import { useGetProductByIdQuery, useGetRelatedProductsQuery } from '@/store/api/productApi';
import { useAppDispatch } from '@/store/store';
import { addItem } from '@/store/features/cartSlice';
import { useRouter } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { useGetReviewsQuery, useAddReviewMutation } from '@/store/api/reviewApi';
import { message } from 'antd';

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data, isLoading } = useGetProductByIdQuery(id);
  const { data: related } = useGetRelatedProductsQuery({ id, limit: 8 });
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { data: reviewsData, refetch } = useGetReviewsQuery(id);
  const [addReview] = useAddReviewMutation();
  const [msg, holder] = message.useMessage();

  const product = data?.data.product;

  if (isLoading || !product) {
    return <div className="mx-auto max-w-7xl px-4 py-6">Loading...</div>;
  }

  const price = product.basePrice ?? product.variants?.[0]?.price ?? 0;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      {holder}
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

      {/* Reviews */}
      <section className="mt-10">
        <h2 className="mb-3 text-xl font-semibold">Reviews</h2>
        <div className="space-y-3">
          {reviewsData?.data.reviews?.length ? (
            reviewsData.data.reviews.map((r: any, i: number) => (
              <div key={i} className="rounded-lg border p-3">
                <div className="text-sm text-yellow-700">★ {r.rating}</div>
                <p className="text-sm text-gray-800">{r.comment}</p>
                <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No reviews yet.</p>
          )}
        </div>

        <div className="mt-4 rounded-lg border p-4">
          <h3 className="mb-2 font-medium">Add a review</h3>
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const rating = Number((form.elements.namedItem('rating') as HTMLInputElement).value);
              const comment = (form.elements.namedItem('comment') as HTMLInputElement).value;
              try {
                await addReview({ productId: id, rating, comment }).unwrap();
                msg.success('Review submitted');
                form.reset();
                refetch();
              } catch (err: any) {
                msg.error(err?.data?.message || 'Failed to submit review');
              }
            }}
          >
            <select name="rating" required className="w-28 rounded-md border px-3 py-2 text-sm">
              <option value="">Rating</option>
              <option value="5">5</option>
              <option value="4">4</option>
              <option value="3">3</option>
              <option value="2">2</option>
              <option value="1">1</option>
            </select>
            <input name="comment" required minLength={10} placeholder="Share your thoughts" className="flex-1 rounded-md border px-3 py-2 text-sm" />
            <button type="submit" className="btn-primary">Submit</button>
          </form>
          <p className="mt-1 text-xs text-gray-500">Note: You can review only products you purchased.</p>
        </div>
      </section>

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


