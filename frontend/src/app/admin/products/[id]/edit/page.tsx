"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { message } from 'antd';
import { API_BASE } from '@/lib/config';
import { useUpdateProductMutation } from '@/store/api/productApi';
import { useGetCategoriesQuery } from '@/store/api/categoryApi';

export default function AdminEditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [msg, holder] = message.useMessage();
  const [updateProduct, { isLoading }] = useUpdateProductMutation();
  const { data: cats } = useGetCategoriesQuery({ limit: 100 });
  const router = useRouter();

  const [form, setForm] = useState<any>({ name: '', description: '', basePrice: '', brand: '', category: '', images: [] as string[] });

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_BASE}/api/products/${id}`);
      const json = await res.json();
      const p = json?.data?.product;
      if (!p) return;
      setForm({
        name: p.name,
        description: p.description,
        basePrice: p.basePrice,
        brand: p.brand,
        category: (p.category && typeof p.category === 'object') ? p.category._id : p.category,
        images: p.images || [],
      });
    })();
  }, [id]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      {holder}
      <h1 className="mb-4 text-2xl font-semibold">Edit Product</h1>
      <form
        className="space-y-3"
        onSubmit={async (e)=>{
          e.preventDefault();
          try {
            const body = {
              name: form.name,
              description: form.description,
              basePrice: Number(form.basePrice),
              brand: form.brand,
              category: form.category,
              images: form.images,
            } as any;
            await updateProduct({ id, body }).unwrap();
            msg.success('Product updated');
            router.push('/admin/products');
          } catch (err: any) {
            msg.error(err?.data?.message || 'Failed');
          }
        }}
      >
        <input required value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full rounded border px-3 py-2 text-sm" />
        <textarea required value={form.description} onChange={(e)=>setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full rounded border px-3 py-2 text-sm" />
        <div className="flex gap-2">
          <input required type="number" value={form.basePrice} onChange={(e)=>setForm({ ...form, basePrice: e.target.value })} placeholder="Base price" className="w-1/2 rounded border px-3 py-2 text-sm" />
          <input required value={form.brand} onChange={(e)=>setForm({ ...form, brand: e.target.value })} placeholder="Brand" className="w-1/2 rounded border px-3 py-2 text-sm" />
        </div>
        <select required value={form.category} onChange={(e)=>setForm({ ...form, category: e.target.value })} className="w-full rounded border px-3 py-2 text-sm">
          <option value="">Select category</option>
          {cats?.data?.categories?.map((c: any) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <div className="rounded border p-3">
          <p className="mb-2 text-sm font-medium">Images</p>
          <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
            {form.images.map((u:string,i:number)=>(<li key={i}>{u}</li>))}
          </ul>
        </div>
        <button disabled={isLoading} className="btn-primary">{isLoading? 'Saving…':'Save changes'}</button>
      </form>
    </main>
  );
}


