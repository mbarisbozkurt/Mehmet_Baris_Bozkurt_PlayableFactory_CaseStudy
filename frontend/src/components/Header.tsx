"use client";
import Link from 'next/link';
import { ShoppingCartOutlined, DownOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { logout, setCredentials } from '@/store/features/authSlice';
import { Avatar, Dropdown, type MenuProps } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const Header = () => {
  const user = useAppSelector((s) => s.auth.user);
  const cartCount = useAppSelector((s) => s.cart.items.length);
  const dispatch = useAppDispatch();
  const router = useRouter();
  // Rehydrate auth from localStorage on first mount (for hard reloads)
  useEffect(() => {
    if (!user) {
      try {
        const t = localStorage.getItem('token');
        const u = localStorage.getItem('user');
        if (t && u) dispatch(setCredentials({ user: JSON.parse(u), token: t }));
      } catch {}
    }
  }, []);

  const userMenuItems: MenuProps['items'] = user?.role === 'admin'
    ? [
        { key: 'admin-products', label: <Link href="/admin/products" className="no-underline">Products</Link> },
        { key: 'admin-users', label: <Link href="/admin/users" className="no-underline">Users</Link> },
        { key: 'admin-orders', label: <Link href="/admin/orders" className="no-underline">Orders</Link> },
        { type: 'divider' },
        { key: 'logout', label: 'Logout' },
      ]
    : [
        { key: 'profile', label: <Link href="/account" className="no-underline">Profile</Link> },
        { key: 'logout', label: 'Logout' },
      ];

  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : '';

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link href="/" className="text-xl font-semibold tracking-tight no-underline">
          PF Shop
        </Link>

        <nav className="flex items-center gap-5 text-[15px]">
          <Link href="/" className="text-gray-700 hover:text-black no-underline">Home</Link>
          <Link href="/products" className="text-gray-700 hover:text-black no-underline">Products</Link>
          {user?.role === 'admin' && (
            <Link href="/admin/dashboard" className="text-gray-700 hover:text-black no-underline">Dashboard</Link>
          )}
          <Link href="/cart" className="flex items-center gap-2 text-gray-700 hover:text-black no-underline">
            <span className="relative">
              <ShoppingCartOutlined />
              <span
                className="absolute -right-2 -top-2 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-medium text-white"
                style={{ display: cartCount > 0 ? 'inline-flex' : 'none' }}
                suppressHydrationWarning
              >
                {cartCount}
              </span>
            </span>
            <span>Cart</span>
          </Link>
          {user ? (
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: ({ key }) => {
                  if (key === 'logout') dispatch(logout());
                  if (key === 'profile') router.push('/account');
                  if (key === 'admin-products') router.push('/admin/products');
                  if (key === 'admin-users') router.push('/admin/users');
                  if (key === 'admin-orders') router.push('/admin/orders');
                },
              }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <button className="no-underline text-gray-700 hover:text-black">
                <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-2.5 py-1 text-sm">
                  <Avatar size={20} style={{ backgroundColor: '#6366f1', verticalAlign: 'middle' }}>{initials || user.firstName[0]}</Avatar>
                  <span className="hidden sm:inline">Hi, {user.firstName}</span>
                  <DownOutlined className="text-xs" />
                </span>
              </button>
            </Dropdown>
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


