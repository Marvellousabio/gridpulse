'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InfrastructureStations } from '@/components/infrastructure/InfrastructureStations';
import { AssetManagement } from '@/components/infrastructure/AssetManagement';
import { GridHealth } from '@/components/infrastructure/GridHealth';
import { generateInfrastructureDetails } from '@/lib/mockData';
import { StatsCard } from '@/components/shared/StatsCard';
import { Server, Zap, AlertTriangle } from 'lucide-react';

export default function InfrastructurePage() {
  const data = generateInfrastructureDetails();

  const stats = [
    { label: 'Total Stations', value: data.stations.length, status: 'normal' as const },
    { label: 'Active Stations', value: data.stations.filter(s => s.status === 'active').length, status: 'success' as const },
    { label: 'Assets Monitored', value: data.assets.length, status: 'normal' as const },
    { label: 'System Health', value: '99.3%', status: 'normal' as const },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Infrastructure</h1>
        <p className="text-gray-600 mt-2">Monitor and manage your grid infrastructure</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <StatsCard
            key={idx}
            label={stat.label}
            value={stat.value}
            status={stat.status === 'success' ? 'normal' : stat.status}
            icon={idx === 0 ? <Server size={32} /> : <Zap size={32} />}
          />
        ))}
      </div>

      <div className="space-y-8">
        <GridHealth metrics={data.stations} />
        <InfrastructureStations stations={data.stations} />
        <AssetManagement assets={data.assets} />
      </div>
    </DashboardLayout>
  );
}
