"use client";
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { useSearchParams, useRouter } from 'next/navigation';
import { useGetProductsQuery } from '@/store/api/productApi';
import { useGetCategoriesQuery } from '@/store/api/categoryApi';
import { ProductCard } from '@/components/ProductCard';
import { Suspense, useMemo, useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    searchParams.forEach((v, k) => (p[k] = v));
    return p;
  }, [searchParams]);

  const { data, isLoading } = useGetProductsQuery({
    page: params.page ?? '1',
    limit: params.limit ?? '12',
    search: params.search,
    category: params.category,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    rating: params.rating,
    tags: params.tags,
    brand: params.brand,
    featured: params.featured,
    active: params.active,
    inStock: params.inStock,
    popular: params.popular,
    sortBy: params.sortBy ?? 'createdAt',
    order: params.order ?? 'desc',
  });

  const products = data?.data.products ?? [];
  const pagination = data?.data.pagination;

  // Categories for filters
  const { data: catData } = useGetCategoriesQuery({});
  const categories = catData?.data.categories ?? [];

  const setPage = (page: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', String(page));
    router.push(`${url.pathname}?${url.searchParams.toString()}`);
  };

  const updateParams = (updates: Record<string, string | undefined>) => {
    const url = new URL(window.location.href);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === '') url.searchParams.delete(k);
      else url.searchParams.set(k, String(v));
    });
    url.searchParams.set('page', '1');
    router.push(`${url.pathname}?${url.searchParams.toString()}`);
  };

  // Local inputs for search/price
  const [search, setSearch] = useState(params.search ?? '');
  const [minPrice, setMinPrice] = useState(params.minPrice ?? '');
  const [maxPrice, setMaxPrice] = useState(params.maxPrice ?? '');

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold">Products</h1>

      {/* Filters bar */}
      <section className="mb-5 flex flex-col gap-3 rounded-lg border bg-white p-3 sm:flex-row sm:items-end sm:gap-4">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-600">Search</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && updateParams({ search })}
            placeholder="Search products..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="sm:w-48">
          <label className="mb-1 block text-xs font-medium text-gray-600">Category</label>
          <select
            defaultValue={params.category ?? ''}
            onChange={(e) => updateParams({ category: e.target.value || undefined })}
            className="w-full cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="sm:w-32">
          <label className="mb-1 block text-xs font-medium text-gray-600">Min price</label>
          <input
            type="number"
            inputMode="numeric"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={() => updateParams({ minPrice: minPrice || undefined })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="sm:w-32">
          <label className="mb-1 block text-xs font-medium text-gray-600">Max price</label>
          <input
            type="number"
            inputMode="numeric"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={() => updateParams({ maxPrice: maxPrice || undefined })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="sm:w-40">
          <label className="mb-1 block text-xs font-medium text-gray-600">Min rating</label>
          <select
            defaultValue={params.rating ?? ''}
            onChange={(e) => updateParams({ rating: e.target.value || undefined })}
            className="w-full cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="4.5">4.5+</option>
          </select>
        </div>
        <div className="sm:w-48">
          <label className="mb-1 block text-xs font-medium text-gray-600">Sort by</label>
          <select
            defaultValue={params.sortBy ? `${params.sortBy}:${params.order ?? 'desc'}` : 'createdAt:desc'}
            onChange={(e) => {
              const [s, o] = e.target.value.split(':');
              updateParams({ sortBy: s, order: o });
            }}
            className="w-full cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="createdAt:desc">Newest</option>
            <option value="basePrice:asc">Price: Low to High</option>
            <option value="basePrice:desc">Price: High to Low</option>
            <option value="averageRating:desc">Rating</option>
          </select>
        </div>
        <div className="flex gap-2 sm:w-40">
          <button
            onClick={() => updateParams({ search, minPrice, maxPrice })}
            className="btn-primary"
          >
            Apply
          </button>
          <button
            onClick={() => {
              setSearch(''); setMinPrice(''); setMaxPrice('');
              updateParams({ search: undefined, category: undefined, minPrice: undefined, maxPrice: undefined, rating: undefined, sortBy: undefined, order: undefined });
            }}
            className="btn-secondary"
          >
            Clear
          </button>
        </div>
      </section>
      {isLoading ? (
        <div className="flex items-center justify-center py-10"><Spinner size={32} /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
          {pagination && pagination.pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage(Math.max(1, (pagination.page ?? 1) - 1))}
                className="btn-secondary disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                disabled={pagination.page <= 1}
                aria-label="Previous page"
                title="Previous page"
              >
                ‹ Prev
              </button>
              <span className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 shadow-sm">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage(Math.min(pagination.pages, (pagination.page ?? 1) + 1))}
                className="btn-primary disabled:cursor-not-allowed disabled:bg-gray-300"
                disabled={pagination.page >= pagination.pages}
                aria-label="Next page"
                title="Next page"
              >
                Next ›
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-10"><Spinner size={32} /></div>}>
      <ProductsPageContent />
    </Suspense>
  );
}


