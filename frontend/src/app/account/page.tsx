"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/store';
import { useGetOrdersQuery } from '@/store/api/orderApi';

export default function AccountPage() {
  const router = useRouter();
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (!token) {
      // try to rehydrate from localStorage before redirecting
      try {
        const t = localStorage.getItem('token');
        const u = localStorage.getItem('user');
        if (t && u) return; // Providers will set it in header
      } catch {}
      router.push('/login');
    }
  }, [token, router]);

  const { data } = useGetOrdersQuery(undefined, { skip: !token });
  const orders: any[] = data?.data?.orders || [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Account</h1>

      <section className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Profile</h2>
        {user ? (
          <div className="text-sm text-gray-700">
            <p><span className="mr-2 text-gray-500">Name:</span>{user.firstName} {user.lastName}</p>
            <p><span className="mr-2 text-gray-500">Email:</span>{user.email}</p>
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Order history</h2>
        {!orders.length ? (
          <p className="text-sm text-gray-500">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o._id} className="rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-gray-600">#{o._id.slice(-6)}</span>
                  <span className={statusBadgeClass(o.status)}>{o.status}</span>
                </div>
                <div className="text-sm text-gray-700">
                  <p>{new Date(o.createdAt).toLocaleString()}</p>
                  <p className="font-medium">Total: ${o.totalAmount?.toFixed?.(2) || '—'}</p>
                  {o.status === 'pending' && (
                    <a href={`/order/${o._id}`} className="btn-primary mt-2 inline-block no-underline">Complete payment</a>
                  )}
                  {Array.isArray(o.items) && o.items.length > 0 && (
                    <div className="mt-2">
                      <p className="text-gray-600">Items:</p>
                      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-gray-800">
                        {o.items.map((it: any, idx: number) => (
                          <li key={idx}>
                            {(it.name || it.product?.name) ?? 'Product'} x{it.quantity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function statusBadgeClass(status: string) {
  const base = 'rounded px-2 py-0.5 text-xs font-medium';
  switch (status) {
    case 'pending':
      return `${base} bg-yellow-50 text-yellow-700`;
    case 'paid':
      return `${base} bg-green-50 text-green-700`;
    case 'delivered':
      return `${base} bg-blue-50 text-blue-700`;
    default:
      return `${base} bg-gray-100 text-gray-600`;
  }
}


