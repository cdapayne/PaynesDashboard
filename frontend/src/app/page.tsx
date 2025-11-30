'use client';

import { Header, DashboardGrid } from '@/components/layout';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
            Dashboard
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Drag widgets to rearrange your dashboard layout
          </p>
        </div>
        <DashboardGrid />
      </main>
    </div>
  );
}
