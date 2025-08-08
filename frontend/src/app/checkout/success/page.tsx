import Link from 'next/link';

export default function OrderSuccessPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold">Thank you for your order!</h1>
      <p className="mt-2 text-gray-600">Your payment was processed and your order has been placed.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/account" className="btn-primary no-underline">View orders</Link>
        <Link href="/products" className="btn-secondary no-underline">Continue shopping</Link>
      </div>
    </main>
  );
}


