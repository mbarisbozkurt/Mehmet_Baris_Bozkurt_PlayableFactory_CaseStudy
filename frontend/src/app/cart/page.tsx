"use client";
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { increment, decrement, removeItem, clearCart } from '@/store/features/cartSlice';
import { useCreateOrderMutation } from '@/store/api/orderApi';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { message } from 'antd';

export default function CartPage() {
  const items = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [address, setAddress] = useState({ street: '', city: '', state: '', zipCode: '', phone: '' });
  const router = useRouter();
  const token = useAppSelector((s) => s.auth.token);
  const [msg, contextHolder] = message.useMessage();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = items.length ? 9.99 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const onCheckout = async () => {
    if (!items.length) return;
    // Require login
    if (!token) {
      msg.warning('Please login to place an order.');
      router.push('/login');
      return;
    }
    // Validate address
    if (!address.street || !address.city || !address.state || !address.zipCode || !address.phone) {
      msg.error('Please fill in your shipping address.');
      return;
    }
    await createOrder({
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      shippingAddress: address,
    });
    dispatch(clearCart());
    msg.success('Order placed!');
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {contextHolder}
      <h1 className="mb-6 text-2xl font-semibold">Your cart</h1>
      {!items.length ? (
        <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
          <p className="mb-4 text-gray-600">Your cart is empty.</p>
          <Link className="btn-primary" href="/products">Continue shopping</Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <section className="space-y-3 md:col-span-2">
            {items.map((i) => (
              <div key={i.productId} className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">{i.name}</p>
                  <p className="text-sm text-gray-500">${i.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button aria-label="Decrease" className="btn-secondary h-8 w-8 p-0" onClick={() => dispatch(decrement({ productId: i.productId }))}>-</button>
                  <span className="w-8 text-center">{i.quantity}</span>
                  <button aria-label="Increase" className="btn-secondary h-8 w-8 p-0" onClick={() => dispatch(increment({ productId: i.productId }))}>+</button>
                  <button className="btn-ghost" onClick={() => dispatch(removeItem({ productId: i.productId }))}>Remove</button>
                </div>
              </div>
            ))}
          </section>

          <aside className="space-y-4">
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold">Shipping address</h2>
              <div className="grid grid-cols-2 gap-2">
                <input className="col-span-2 rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Street" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
                <input className="rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                <input className="rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="State" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
                <input className="rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Zip" value={address.zipCode} onChange={(e) => setAddress({ ...address, zipCode: e.target.value })} />
                <input className="col-span-2 rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Phone" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
              </div>
            </div>
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold">Order summary</h2>
              <div className="space-y-1 text-sm text-gray-700">
                <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>${shipping.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
                <div className="flex justify-between text-base font-semibold"><span>Total</span><span>${total.toFixed(2)}</span></div>
              </div>
              <button disabled={isLoading} onClick={onCheckout} className="btn-primary mt-3 w-full">{isLoading ? 'Placing...' : 'Place order'}</button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}


