'use client';

import { Search, Bell, LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';

export function TopHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-72 right-0 h-20 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-8"
    >
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search infrastructure..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6 ml-8">
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm text-gray-600">All Systems Normal</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors group">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          <div className="absolute top-full right-0 mt-2 hidden group-hover:block bg-white rounded-lg shadow-lg p-3 min-w-64 border border-gray-200">
            <p className="text-sm font-semibold text-gray-900 mb-2">Notifications</p>
            <div className="space-y-2">
              <p className="text-xs text-gray-600">Grid stability warning in Region 3</p>
              <p className="text-xs text-gray-600">API rate limit approaching</p>
            </div>
          </div>
        </button>

        {/* User Menu */}
        <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">Alex Johnson</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
            AJ
          </div>
        </div>
      </div>
    </motion.header>
  );
}
