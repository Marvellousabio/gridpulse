'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Atom, Coins, LayoutDashboard, Leaf, Menu, Radio, X } from 'lucide-react';
import { LiveClock } from '@/components/ops/LiveClock';
import { SystemStatusBar } from '@/components/ops/SystemStatusBar';
import { isLiveApi } from '@/lib/gridpulse/api';
import { useState } from 'react';

const nav = [
  { href: '/', label: 'Command Deck', icon: LayoutDashboard },
  { href: '/orchestration', label: 'Orchestration', icon: Activity },
  { href: '/settlement', label: 'Settlement', icon: Coins },
  { href: '/carbon', label: 'Carbon', icon: Leaf },
];

export function OpsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <aside className="w-56 border-r border-line bg-ink-2 flex flex-col shrink-0 h-full">
      <div className="p-5 border-b border-line flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <div className="w-9 h-9 rounded bg-agentic/20 border border-agentic/50 flex items-center justify-center">
            <Radio className="w-5 h-5 text-agentic" />
          </div>
          <div>
            <p className="font-black text-sm tracking-tight text-text">GridPulse</p>
            <p className="text-[10px] text-text-soft uppercase tracking-widest">Ops Console</p>
          </div>
        </Link>
        <button type="button" className="md:hidden text-text-soft" onClick={() => setMobileOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-semibold transition-colors ${
                active
                  ? 'bg-ink-3 text-text border border-line'
                  : 'text-text-soft hover:text-text hover:bg-ink-3/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-line text-[10px] text-text-soft">
        <p className="flex items-center gap-1">
          <Atom className="w-3 h-3 text-aws" />
          {isLiveApi ? 'LIVE API' : 'MOCK MODE'}
        </p>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-ink text-text ops-console">
      <div
        className={`fixed inset-y-0 left-0 z-50 md:static md:translate-x-0 transition-transform ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {sidebar}
      </div>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-line bg-ink-2 px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button type="button" className="md:hidden text-text-soft" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="h-1 w-24 md:w-32 rounded-full scanline opacity-60 hidden sm:block" />
            <div className="flex gap-2">
              {['PS-1', 'PS-6', 'PS-9'].map((ps) => (
                <span
                  key={ps}
                  className="text-[10px] font-bold px-2 py-0.5 rounded border border-line text-text-soft mono-num"
                >
                  {ps}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <SystemStatusBar />
            <LiveClock />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
