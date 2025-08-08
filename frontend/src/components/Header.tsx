"use client";
import Link from 'next/link';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useAppSelector } from '@/store/store';

export const Header = () => {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link href="/" className="text-xl font-semibold tracking-tight no-underline">
          PF Shop
        </Link>

        <nav className="flex items-center gap-5 text-[15px]">
          <Link href="/" className="text-gray-700 hover:text-black no-underline">Home</Link>
          <Link href="/products" className="text-gray-700 hover:text-black no-underline">Products</Link>
          <Link href="/cart" className="flex items-center gap-1 text-gray-700 hover:text-black no-underline">
            <ShoppingCartOutlined />
            <span>Cart</span>
          </Link>
          {user ? (
            <>
              <span className="hidden text-gray-500 md:inline">Hi, {user.firstName}</span>
              <Link href="/account" className="text-gray-700 hover:text-black no-underline">Account</Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-700 hover:text-black no-underline">Login</Link>
              <Link href="/register" className="text-gray-700 hover:text-black no-underline">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};


