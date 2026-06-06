'use client';

import { memo } from 'react';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface KPICardProps {
  label: string;
  value: string;
  growth: number;
  icon: React.ReactNode;
  index: number;
}

export const KPICard = memo(function KPICard({ label, value, growth, icon, index }: KPICardProps) {
  const isPositive = growth >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mb-3">{value}</p>
          <div className="flex items-center gap-1">
            <TrendingUp className={`w-4 h-4 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{growth.toFixed(1)}%
            </span>
            <span className="text-xs text-gray-500 ml-1">vs last month</span>
          </div>
        </div>
        <div className="text-purple-500 opacity-80">{icon}</div>
      </div>
    </motion.div>
  );
});
