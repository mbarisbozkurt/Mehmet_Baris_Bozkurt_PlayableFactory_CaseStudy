"use client";
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useGetProductsQuery, useBulkUpdateProductStatusMutation, useDeleteProductMutation } from '@/store/api/productApi';
import { API_BASE } from '@/lib/config';
import { message } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppSelector } from '@/store/store';

function AdminProductsPageContent() {
  const user = useAppSelector((s) => s.auth.user);
  const router = useRouter();
  useEffect(() => { if (user && user.role !== 'admin') router.push('/'); }, [user, router]);

  const sp = useSearchParams();
  const params = useMemo(() => { const o: any = {}; sp.forEach((v,k)=>o[k]=v); return o; }, [sp]);
  const [search, setSearch] = useState(params.search ?? '');
  const { data, isLoading, refetch } = useGetProductsQuery({ search, limit: 20, order: 'desc', sortBy: 'createdAt', includeInactive: true });
  const products = data?.data.products ?? [];
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [msg, holder] = message.useMessage();
  const [bulkUpdate] = useBulkUpdateProductStatusMutation();
  const [deleteProduct] = useDeleteProductMutation();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {holder}
      <h1 className="mb-4 text-2xl font-semibold">Products</h1>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search products..." className="w-full max-w-sm rounded-md border px-3 py-2 text-sm" />
          <button className="btn-secondary" onClick={()=>router.push(`/admin/products?search=${encodeURIComponent(search)}`)}>Search</button>
          <button
          className="btn-primary"
          onClick={async ()=>{
            const ids = Object.entries(selected).filter(([_,v])=>v).map(([id])=>id);
            if (!ids.length) return msg.info('Select products first');
            try { await bulkUpdate({ ids, isActive: true }).unwrap(); msg.success('Activated'); } catch { msg.error('Failed'); }
          }}
        >Activate</button>
          <button
          className="btn-secondary"
          onClick={async ()=>{
            const ids = Object.entries(selected).filter(([_,v])=>v).map(([id])=>id);
            if (!ids.length) return msg.info('Select products first');
            try { await bulkUpdate({ ids, isActive: false }).unwrap(); msg.success('Deactivated'); } catch { msg.error('Failed'); }
          }}
        >Deactivate</button>
        </div>
        <div className="sm:ml-auto">
          <a href="/admin/products/new" className="btn-primary no-underline">New product</a>
        </div>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-12 animate-pulse rounded bg-gray-100" />))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">
                  <input type="checkbox" onChange={(e)=>{
                    const next: Record<string, boolean> = {};
                    products.forEach((p:any)=> next[p._id] = e.target.checked);
                    setSelected(next);
                  }} />
                </th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Category</th>
                <th className="px-3 py-2 text-left">Price</th>
                <th className="px-3 py-2 text-left">Active</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-t">
                  <td className="px-3 py-2"><input type="checkbox" checked={!!selected[p._id]} onChange={(e)=> setSelected({ ...selected, [p._id]: e.target.checked })} /></td>
                  <td className="px-3 py-2">{p.name}</td>
                  <td className="px-3 py-2">{(p as any).category?.name ?? '—'}</td>
                  <td className="px-3 py-2">${p.basePrice?.toFixed?.(2) ?? p.variants?.[0]?.price}</td>
                  <td className="px-3 py-2">{(p as any).isActive ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2 space-x-2">
                    <a href={`/admin/products/${p._id}/edit`} className="btn-primary no-underline">Edit</a>
                    <button
                      className="btn-danger"
                      onClick={async ()=>{
                        if (!confirm('Delete this product?')) return;
                        try { await deleteProduct(p._id).unwrap(); msg.success('Deleted'); } catch { msg.error('Failed'); }
                      }}
                    >Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center">Loading…</div>}>
      <AdminProductsPageContent />
    </Suspense>
  );
}


