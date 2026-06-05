'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPISection } from '@/components/kpi/KPISection';
import { EnergyForecastChart } from '@/components/charts/EnergyForecastChart';
import { DistributionChart } from '@/components/charts/DistributionChart';
import { InfrastructureMap } from '@/components/infrastructure/InfrastructureMap';
import { AIAgentTerminal } from '@/components/infrastructure/AIAgentTerminal';
import { SettlementLedger } from '@/components/ledger/SettlementLedger';
import { MonitoringMetrics } from '@/components/monitoring/MonitoringMetrics';
import { TopPerformers } from '@/components/monitoring/TopPerformers';

export default function Page() {
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome Back, Commander</h1>
        <p className="text-gray-600 mt-2">Monday, March 01, 2026 • Real-time Grid Operations</p>
      </div>

      {/* KPI Cards */}
      <KPISection />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <EnergyForecastChart />
        <DistributionChart />
      </div>

      {/* Infrastructure and Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <InfrastructureMap />
        <AIAgentTerminal />
      </div>

      {/* Settlement and Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <SettlementLedger />
        </div>
        <div>
          <TopPerformers />
        </div>
      </div>

      {/* System Metrics */}
      <MonitoringMetrics />
    </DashboardLayout>
  );
}
