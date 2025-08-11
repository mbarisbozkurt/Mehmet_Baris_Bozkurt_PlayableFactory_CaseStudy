"use client";
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/store';
import { useRouter } from 'next/navigation';
import { message } from 'antd';
import { useGetAdminOrdersQuery, useUpdateOrderStatusMutation } from '@/store/api/adminApi';

export default function AdminOrdersPage() {
  const user = useAppSelector((s) => s.auth.user);
  const router = useRouter();
  useEffect(()=>{ if (user && user.role !== 'admin') router.push('/'); }, [user, router]);
  const [status, setStatus] = useState('');
  const [msg, holder] = message.useMessage();

  const { data, isLoading, refetch } = useGetAdminOrdersQuery(
    status ? { status } : undefined
  );
  const orders = data?.data?.orders || [];
  const [updateStatus] = useUpdateOrderStatusMutation();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {holder}
      <h1 className="mb-4 text-2xl font-semibold">Orders</h1>
      <div className="mb-4 flex items-end gap-2">
        <div>
          <label className="mb-1 block text-xs text-gray-600">Status</label>
          <select className="rounded-md border px-3 py-2 text-sm" value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
        <button className="btn-secondary" onClick={() => refetch()}>Filter</button>
      </div>
      <div className="overflow-hidden rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Order</th>
              <th className="px-3 py-2 text-left">User</th>
              <th className="px-3 py-2 text-left">Total</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o)=> (
              <tr key={o._id} className="border-t">
                <td className="px-3 py-2">#{o._id.slice(-6)}</td>
                <td className="px-3 py-2">{o.user?.email ?? '—'}</td>
                <td className="px-3 py-2">${o.totalAmount?.toFixed?.(2) ?? '—'}</td>
                <td className="px-3 py-2">
                  <span className={statusBadgeClass(o.status)}>{o.status}</span>
                </td>
                <td className="px-3 py-2">
                  {o.status === 'paid' ? (
                    <button
                      className="btn-primary"
                      onClick={async () => {
                        try {
                          await updateStatus({ id: o._id, status: 'delivered' }).unwrap();
                          msg.success('Marked as delivered');
                        } catch (e: any) {
                          msg.error(e?.data?.message || 'Failed');
                        }
                      }}
                    >
                      Mark delivered
                    </button>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isLoading && <p className="mt-3 text-sm text-gray-500">Loading…</p>}
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


