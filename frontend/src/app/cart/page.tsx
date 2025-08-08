"use client";
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { increment, decrement, removeItem, clearCart, setAddress, setPaymentMethod } from '@/store/features/cartSlice';
import { useCreateOrderMutation } from '@/store/api/orderApi';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { message } from 'antd';

export default function CartPage() {
  const items = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [address, setAddressState] = useState({ street: '', city: '', state: '', zipCode: '', phone: '' });
  const [payment, setPayment] = useState<'credit_card' | 'bank_transfer'>('credit_card');
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
    dispatch(setAddress(address));
    dispatch(setPaymentMethod(payment));
    await createOrder({
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      shippingAddress: address,
      paymentInfo: { method: 'credit_card', status: 'pending' },
    });
    dispatch(clearCart());
    msg.success('Order placed!');
    router.push('/checkout/success');
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
                <input className="col-span-2 rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Street" value={address.street} onChange={(e) => setAddressState({ ...address, street: e.target.value })} />
                <input className="rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="City" value={address.city} onChange={(e) => setAddressState({ ...address, city: e.target.value })} />
                <input className="rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="State" value={address.state} onChange={(e) => setAddressState({ ...address, state: e.target.value })} />
                <input className="rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Zip" value={address.zipCode} onChange={(e) => setAddressState({ ...address, zipCode: e.target.value })} />
                <input className="col-span-2 rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Phone" value={address.phone} onChange={(e) => setAddressState({ ...address, phone: e.target.value })} />
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
              <div className="mt-3">
                <label className="mb-2 block text-sm font-medium">Payment method</label>
                <div className="mb-3 flex gap-3 text-sm">
                  <label className="flex items-center gap-2"><input type="radio" checked={payment==='credit_card'} onChange={()=>setPayment('credit_card')} />Credit Card</label>
                  <label className="flex items-center gap-2"><input type="radio" checked={payment==='bank_transfer'} onChange={()=>setPayment('bank_transfer')} />Bank Transfer</label>
                </div>
                <button disabled={isLoading} onClick={onCheckout} className="btn-primary w-full">{isLoading ? 'Placing...' : 'Place order'}</button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}


