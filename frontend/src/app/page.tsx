'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGetPopularProductsQuery, useGetProductsQuery } from '@/store/api/productApi';
import { Spinner } from '@/components/ui/Spinner';
import { useGetCategoriesQuery } from '@/store/api/categoryApi';
import { ProductCard } from '@/components/ProductCard';
import { CategoryCard } from '@/components/CategoryCard';

export default function Home() {
  const router = useRouter();
  const { data, isLoading } = useGetPopularProductsQuery({ limit: 8 });
  const products = data?.data.products ?? [];
  const { data: catData, isLoading: catsLoading } = useGetCategoriesQuery({});
  const categories = catData?.data.categories ?? [];
  const { data: newData, isLoading: newLoading } = useGetProductsQuery({ sortBy: 'createdAt', order: 'desc', limit: 8 });
  const newArrivals = newData?.data.products ?? [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <section className="mb-10 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-10 text-white">
        <h1 className="text-3xl font-bold">Discover our latest products</h1>
        <p className="mt-2 text-sm opacity-90">Shop the best picks across categories</p>
        <div className="mt-6 flex max-w-xl flex-col gap-2 sm:flex-row">
          <SearchBar onSubmit={(q) => router.push(`/products?search=${encodeURIComponent(q)}`)} />
          <Link href="/products" className="btn-secondary border-white/60 text-indigo-600">Browse all</Link>
        </div>
      </section>

      <section className="mt-10 sm:mt-12 lg:mt-14">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Shop by category</h2>
          <a href="/products" className="cursor-pointer text-sm text-indigo-600 hover:underline">Explore all</a>
        </div>
        {catsLoading ? (
          <div className="flex items-center justify-center py-10"><Spinner size={28} /></div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => (
              <CategoryCard key={c._id} category={c} />
            ))}
          </div>
        )}
      </section>

      {/* New arrivals */}
      <section className="mt-12 sm:mt-16 lg:mt-20">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">New arrivals</h2>
          <Link href="/products?sortBy=createdAt&order=desc" className="btn-ghost text-sm no-underline">See all</Link>
        </div>
        {newLoading ? (
          <div className="flex items-center justify-center py-10"><Spinner size={32} /></div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {newArrivals.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Popular products */}
      <section className="mt-12 sm:mt-16 lg:mt-20">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Popular products</h2>
          <Link href="/products" className="btn-ghost text-sm no-underline">See all</Link>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-10"><Spinner size={32} /></div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Stay in the loop</h3>
          <p className="mt-1 text-sm text-gray-600">Get updates on new arrivals and exclusive offers.</p>
          <NewsletterForm />
        </div>
      </section>
    </main>
  );
}

import { useState } from 'react';
import { useRef } from 'react';

function NewsletterForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [name, setName] = useState('');

  return (
    <div className="mt-4 max-w-md">
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={async (e) => {
          e.preventDefault();
          setStatus('loading');
          // Simüle edilen async istek (gerçek endpoint eklenince buraya bağlanır)
          await new Promise((r) => setTimeout(r, 600));
          setStatus('success');
        }}
      >
        <input
          type="text"
          name="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-40"
        />
        <input
          type="email"
          name="email"
          required
          placeholder="Your email"
          className="w-full flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="cursor-pointer rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </form>
      <div className="mt-2 min-h-[1.5rem]" aria-live="polite">
        {status === 'success' && (
          <p className="text-sm text-green-700">Thanks{name ? `, ${name}` : ''}! Please check your inbox to confirm your subscription.</p>
        )}
      </div>
    </div>
  );
}

function SearchBar({ onSubmit }: { onSubmit: (query: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex w-full items-center rounded-md bg-white/90 p-1 shadow-sm backdrop-blur">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search products..."
        className="flex-1 rounded-md border border-transparent px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit(inputRef.current?.value || '');
        }}
      />
      <button
        onClick={() => onSubmit(inputRef.current?.value || '')}
        className="btn-primary"
        type="button"
      >
        Search
      </button>
    </div>
  );
}