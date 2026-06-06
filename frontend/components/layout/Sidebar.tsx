'use client';

import { LayoutDashboard, Package, ShoppingCart, Users, Calendar, BarChart3, Settings, HelpCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const mainNav: NavItem[] = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', href: '/' },
    { icon: <Package className="w-5 h-5" />, label: 'Infrastructure', href: '/infrastructure' },
    { icon: <ShoppingCart className="w-5 h-5" />, label: 'Transactions', href: '/transactions' },
    { icon: <Users className="w-5 h-5" />, label: 'Partners', href: '/partners' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Scheduler', href: '/scheduler' },
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics', href: '/analytics' },
  ];

  const bottomNav: NavItem[] = [
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', href: '/settings' },
    { icon: <HelpCircle className="w-5 h-5" />, label: 'Help', href: '/help' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-800 h-full overflow-y-auto">
      <div className="p-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity" onClick={onClose}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <div>
            <p className="text-lg font-bold text-white">GridPulse</p>
            <p className="text-xs text-gray-400">Command Center</p>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <nav className="px-4 py-6 space-y-2">
        {mainNav.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              href={item.href}
              onClick={onClose}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.href)
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800/50'
              }`}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          </motion.div>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 border-t border-slate-800 bg-gradient-to-t from-slate-950 to-transparent">
        {bottomNav.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            onClick={onClose}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive(item.href)
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800/50'
            }`}
          >
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
