'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RevenueChart } from '@/components/analytics/RevenueChart';
import { GridPerformance } from '@/components/analytics/GridPerformance';
import { DistributionCharts } from '@/components/analytics/DistributionCharts';
import { generateAnalyticsData } from '@/lib/mockData';
import { TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  const analytics = generateAnalyticsData();

  const stats = [
    { label: 'Total Revenue', value: 'NGN 16.7M', change: '+12.5%' },
    { label: 'Avg Efficiency', value: '83.8%', change: '+2.1%' },
    { label: 'Grid Stability', value: '91.3%', change: '+1.2%' },
    { label: 'Partner Count', value: '7', change: '+0%' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">Comprehensive insights and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">{stat.label}</p>
            <div className="flex items-end justify-between mt-2">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <span className="text-sm font-medium text-green-600">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        <RevenueChart data={analytics.revenue} />
        <GridPerformance data={analytics.gridPerformance} />
        <DistributionCharts loadData={analytics.loadDistribution} partnerData={analytics.partnerMetrics} />
      </div>
    </DashboardLayout>
  );
}
