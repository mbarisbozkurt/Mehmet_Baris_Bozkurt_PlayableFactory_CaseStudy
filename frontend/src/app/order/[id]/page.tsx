"use client";
import { useParams, useRouter } from 'next/navigation';
import { API_BASE } from '@/lib/config';
import { useEffect, useState } from 'react';
import { message } from 'antd';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, holder] = message.useMessage();
  const router = useRouter();

  const fetchOrder = async () => {
    const res = await fetch(`${API_BASE}/api/orders/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
    });
    const json = await res.json();
    setOrder(json?.data?.order);
    setLoading(false);
  };

  useEffect(()=>{ fetchOrder(); }, [id]);

  const payNow = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/api/orders/${id}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
    });
    const json = await res.json();
    if (res.ok) {
      msg.success('Payment completed');
      setOrder(json.data.order);
      setTimeout(()=>router.push('/checkout/success'), 600);
    } else {
      msg.error(json?.message || 'Payment failed');
    }
  };

  if (loading) return <main className="mx-auto max-w-4xl px-4 py-16">{holder}<div className="flex items-center justify-center"><span className="inline-block animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-600" style={{width:32,height:32}}/></div></main>;
  if (!order) return <main className="mx-auto max-w-4xl px-4 py-8">{holder}<p>Order not found</p></main>;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {holder}
      <h1 className="mb-4 text-2xl font-semibold">Order #{String(order._id).slice(-6)}</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <section className="md:col-span-2 rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-semibold">Items</h2>
          <div className="divide-y text-sm">
            {order.items.map((it: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2">
                <span>{it.name}</span>
                <span>x{it.quantity}</span>
                <span>${(it.price * it.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          {(() => {
            const subtotal = order.items.reduce((s: number, it: any) => s + it.price * it.quantity, 0);
            const shipping = order.items.length ? 9.99 : 0;
            const tax = subtotal * 0.08;
            const total = subtotal + shipping + tax;
            return (
              <div className="mt-3 space-y-1 text-right">
                <div className="text-sm text-gray-600">Subtotal: ${subtotal.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Shipping: ${shipping.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Tax: ${tax.toFixed(2)}</div>
                <div className="text-base font-semibold">Total: ${total.toFixed(2)}</div>
              </div>
            );
          })()}
        </section>
        <section className="space-y-4">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <h2 className="mb-2 font-semibold">Shipping</h2>
            <p className="text-sm text-gray-700">{order.shippingAddress.street}</p>
            <p className="text-sm text-gray-700">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
            <p className="text-sm text-gray-700">Phone: {order.shippingAddress.phone}</p>
          </div>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <h2 className="mb-2 font-semibold">Payment</h2>
            <p className="text-sm">Status: <span className="font-medium">{order.status}</span></p>
            {order.status === 'pending' ? (
              <form onSubmit={payNow} className="mt-3 space-y-2">
                <input required placeholder="Card number" className="w-full rounded border px-3 py-2 text-sm" />
                <div className="flex gap-2">
                  <input required placeholder="MM/YY" className="w-1/2 rounded border px-3 py-2 text-sm" />
                  <input required placeholder="CVC" className="w-1/2 rounded border px-3 py-2 text-sm" />
                </div>
                <button type="submit" className="btn-primary w-full">Pay now</button>
              </form>
            ) : (
              <p className="mt-2 text-sm text-green-700">Payment completed</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}


