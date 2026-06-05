'use client';

import { generateMonitoringMetrics } from '@/lib/mockData';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

export function MonitoringMetrics() {
  const metrics = generateMonitoringMetrics();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">System Monitoring</h3>
        <p className="text-sm text-gray-500 mt-1">Real-time metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-700">{metric.metric}</p>
                <p className="text-xs text-gray-500 mt-1">Threshold: {metric.threshold}</p>
              </div>
              {getStatusIcon(metric.status)}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
              <span className="text-sm text-gray-500 font-medium">{metric.unit}</span>
            </div>

            {/* Status bar */}
            <div className="mt-3 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  metric.status === 'normal'
                    ? 'bg-green-500 w-3/4'
                    : metric.status === 'warning'
                      ? 'bg-yellow-500 w-2/3'
                      : 'bg-red-500 w-1/3'
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
