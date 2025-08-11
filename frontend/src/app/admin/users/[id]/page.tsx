"use client";
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useGetAdminUserDetailQuery } from '@/store/api/adminApi';

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data } = useGetAdminUserDetailQuery(id);

  const user = data?.data?.user;
  const orders = data?.data?.orders || [];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-semibold">Customer detail</h1>
      {user && (
        <section className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-700"><span className="mr-2 text-gray-500">Name:</span>{user.firstName} {user.lastName}</p>
          <p className="text-sm text-gray-700"><span className="mr-2 text-gray-500">Email:</span>{user.email}</p>
          <p className="text-sm text-gray-700"><span className="mr-2 text-gray-500">Joined:</span>{new Date(user.createdAt).toLocaleString()}</p>
        </section>
      )}

      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Order history</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Total</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o:any)=> (
                <tr key={o._id} className="border-t">
                  <td className="px-3 py-2">{new Date(o.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-2">${o.totalAmount?.toFixed?.(2) ?? '—'}</td>
                  <td className="px-3 py-2">{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}


