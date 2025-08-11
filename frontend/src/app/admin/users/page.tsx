"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/store';
import { useGetAdminUsersQuery } from '@/store/api/adminApi';

export default function AdminUsersPage() {
  const user = useAppSelector((s) => s.auth.user);
  const router = useRouter();
  useEffect(()=>{ if (user && user.role !== 'admin') router.push('/'); }, [user, router]);
  const [search, setSearch] = useState('');
  const { data, refetch, isLoading } = useGetAdminUsersQuery(search ? { search } : undefined);
  const users = data?.data?.users || [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-semibold">Users</h1>
      <div className="mb-4 flex gap-2">
        <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search users..." className="w-full max-w-sm rounded-md border px-3 py-2 text-sm" />
        <button className="btn-secondary" onClick={() => refetch()}>Search</button>
      </div>
      <div className="overflow-hidden rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Orders</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u)=> (
              <tr key={u._id} className="border-t">
                <td className="px-3 py-2">{u.firstName} {u.lastName}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">{u.ordersCount}</td>
                <td className="px-3 py-2">
                  <a href={`/admin/users/${u._id}`} className="btn-ghost no-underline">View</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}


