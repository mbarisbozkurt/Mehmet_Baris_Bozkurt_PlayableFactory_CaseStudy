"use client";
import { useEffect } from 'react';
import { useGetAdminStatsQuery } from '@/store/api/adminApi';
import { useAppSelector } from '@/store/store';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const { data, isLoading } = useGetAdminStatsQuery();
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (!user) return; // header rehydration bekle
    if (user.role !== 'admin') router.push('/');
  }, [user, router]);

  const stats = data?.data;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Admin Dashboard</h1>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Sales" value={`$${(stats?.totalSales ?? 0).toFixed(2)}`} />
            <StatCard title="Orders" value={String(stats?.ordersCount ?? 0)} />
            <StatCard title="Customers" value={String(stats?.customersCount ?? 0)} />
            <StatCard title="Top Product" value={stats?.popularProducts?.[0]?.name ?? '—'} />
          </section>

          <section className="mt-8">
            <h2 className="mb-3 text-lg font-semibold">Popular products</h2>
            <div className="overflow-hidden rounded-xl border">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Product</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Sold</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.popularProducts?.map((p) => (
                    <tr key={p.productId} className="border-t">
                      <td className="px-4 py-2">{p.name}</td>
                      <td className="px-4 py-2">{p.qty}</td>
                      <td className="px-4 py-2">{p.averageRating?.toFixed?.(1) ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <h2 className="mb-2 text-lg font-semibold">Recent orders</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">User</th>
                      <th className="px-3 py-2 text-left">Total</th>
                      <th className="px-3 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentOrders?.map((o: any) => (
                      <tr key={o._id} className="border-t">
                        <td className="px-3 py-2">{new Date(o.createdAt).toLocaleString()}</td>
                        <td className="px-3 py-2">{o.user?.email ?? '—'}</td>
                        <td className="px-3 py-2">${o.totalAmount?.toFixed?.(2) ?? '—'}</td>
                        <td className="px-3 py-2">{o.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <h2 className="mb-2 text-lg font-semibold">Status distribution</h2>
              <ul className="text-sm text-gray-700">
                {stats?.statusDistribution && Object.entries(stats.statusDistribution).map(([k,v]) => (
                  <li key={k} className="flex justify-between border-b py-1"><span>{k}</span><span>{v as any}</span></li>
                ))}
              </ul>
              <h2 className="mt-4 mb-2 text-lg font-semibold">Sales (7d)</h2>
              <ul className="text-sm text-gray-700">
                {stats?.salesTrend?.map((p: any) => (
                  <li key={p._id} className="flex justify-between border-b py-1"><span>{p._id}</span><span>${p.total.toFixed(2)}</span></li>
                ))}
              </ul>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}


