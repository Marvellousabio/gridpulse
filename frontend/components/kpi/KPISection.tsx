'use client';

import { KPICard } from './KPICard';
import { DollarSign, Radio, Zap, Activity } from 'lucide-react';
import { generateKPIData } from '@/lib/mockData';

export function KPISection() {
  const data = generateKPIData();

  const kpis = [
    {
      label: 'Total Revenue',
      value: `$${(data.totalRevenue / 1000000).toFixed(2)}M`,
      growth: data.revenueGrowth,
      icon: <DollarSign className="w-8 h-8" />,
    },
    {
      label: 'Active Stations',
      value: data.activeStations.toLocaleString(),
      growth: data.stationGrowth,
      icon: <Radio className="w-8 h-8" />,
    },
    {
      label: 'API Requests',
      value: `${(data.apiRequests / 1000000).toFixed(1)}M`,
      growth: data.requestGrowth,
      icon: <Zap className="w-8 h-8" />,
    },
    {
      label: 'System Uptime',
      value: `${data.systemUptime}%`,
      growth: data.uptimeGrowth,
      icon: <Activity className="w-8 h-8" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} index={index} />
      ))}
    </div>
  );
}
