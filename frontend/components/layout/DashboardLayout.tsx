'use client';

import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-72">
        <TopHeader />
        <main className="flex-1 overflow-auto pt-24 pb-8 px-8">{children}</main>
      </div>
    </div>
  );
}
