'use client';

import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to E-Commerce Platform</h1>
      <Button type="primary">Get Started</Button>
    </main>
  );
}