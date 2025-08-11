"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateProductMutation } from '@/store/api/productApi';
import { useGetCategoriesQuery } from '@/store/api/categoryApi';
import { API_BASE } from '@/lib/config';
import { message } from 'antd';

export default function AdminNewProductPage() {
  const [createProduct, { isLoading }] = useCreateProductMutation();
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [msg, holder] = message.useMessage();
  const router = useRouter();
  const { data: cats } = useGetCategoriesQuery({ limit: 100 });

  const upload = async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API_BASE}/api/uploads/products`, {
      method: 'POST',
      body: fd,
      // no manual headers; browser sets multipart boundary
    });
    const json = await res.json();
    if (res.ok) return json.data.url as string;
    throw new Error(json?.message || 'Upload failed');
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      {holder}
      <h1 className="mb-4 text-2xl font-semibold">New Product</h1>
      <form
        className="space-y-3"
        onSubmit={async (e)=>{
          e.preventDefault();
          try {
            if (!images.length) return msg.error('Upload at least one image');
            const body = {
              name,
              description,
              basePrice: typeof price === 'string' ? Number(price) : price,
              category,
              brand,
              images,
              isActive: true,
            } as any;
            const res = await createProduct(body).unwrap();
            msg.success('Product created');
            router.push('/admin/products');
          } catch (err: any) {
            msg.error(err?.data?.message || 'Failed');
          }
        }}
      >
        <input required value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name" className="w-full rounded border px-3 py-2 text-sm" />
        <textarea required value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Description" className="w-full rounded border px-3 py-2 text-sm" />
        <div className="flex gap-2">
          <input required type="number" value={price} onChange={(e)=>setPrice(Number(e.target.value))} placeholder="Base price" className="w-1/2 rounded border px-3 py-2 text-sm" />
          <input required value={brand} onChange={(e)=>setBrand(e.target.value)} placeholder="Brand" className="w-1/2 rounded border px-3 py-2 text-sm" />
        </div>
        <select required value={category} onChange={(e)=>setCategory(e.target.value)} className="w-full rounded border px-3 py-2 text-sm">
          <option value="">Select category</option>
          {cats?.data?.categories?.map((c: any) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <div className="rounded border p-3">
          <p className="mb-2 text-sm font-medium">Images</p>
          <input type="file" accept="image/*" onChange={async (e)=>{ const f=e.target.files?.[0]; if (f) { const url=await upload(f); setImages((prev)=>[...prev, url]); } }} />
          <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
            {images.map((u,i)=>(<li key={i}>{u}</li>))}
          </ul>
        </div>
        <button disabled={isLoading} className="btn-primary">{isLoading? 'Creating…':'Create product'}</button>
      </form>
    </main>
  );
}


