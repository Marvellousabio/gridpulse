'use client';

import { LayoutDashboard, Package, ShoppingCart, Users, Calendar, MessageSquare, Settings, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavItem {
  icon: React.ReactNode;
  label: string;
}

export function Sidebar() {
  const mainNav: NavItem[] = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { icon: <Package className="w-5 h-5" />, label: 'Infrastructure' },
    { icon: <ShoppingCart className="w-5 h-5" />, label: 'Transactions' },
    { icon: <Users className="w-5 h-5" />, label: 'Partners' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Scheduler' },
    { icon: <MessageSquare className="w-5 h-5" />, label: 'Analytics' },
  ];

  const bottomNav: NavItem[] = [
    { icon: <Settings className="w-5 h-5" />, label: 'Settings' },
    { icon: <HelpCircle className="w-5 h-5" />, label: 'Help' },
  ];

  return (
    <div className="w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-800 fixed left-0 top-0 h-full overflow-y-auto">
      {/* Logo */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <div>
            <p className="text-lg font-bold text-white">GridPulse</p>
            <p className="text-xs text-gray-400">Command Center</p>
          </div>
        </div>
      </motion.div>

      {/* Main Navigation */}
      <nav className="px-4 py-6 space-y-2">
        {mainNav.map((item, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              index === 0
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800/50'
            }`}
          >
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </motion.button>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 border-t border-slate-800 bg-gradient-to-t from-slate-950 to-transparent">
        {bottomNav.map((item, index) => (
          <button
            key={index}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-slate-800/50 transition-all"
          >
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
