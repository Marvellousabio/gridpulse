import { AlertTriangle, Zap } from 'lucide-react';
import { Badge } from '../shared/Badge';

interface GridHealthProps {
  metrics: any[];
}

export function GridHealth({ metrics }: GridHealthProps) {
  const overallHealth = Math.round(metrics.reduce((sum, m) => sum + (m.status === 'normal' ? 100 : m.status === 'warning' ? 60 : 20), 0) / metrics.length);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Grid Health Status</h3>
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">{overallHealth}%</div>
                <div className="text-sm text-gray-600">Overall</div>
              </div>
            </div>
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="56" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="8"
                strokeDasharray={`${(overallHealth / 100) * 351.84} 351.84`}
              />
            </svg>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Stations Active</span>
            <span className="font-medium text-gray-900">6 / 7</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Uptime Average</span>
            <span className="font-medium text-gray-900">99.3%</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">Maintenance scheduled</p>
              <p className="text-xs text-yellow-700">Surulere Hub - March 5, 2026</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Zap size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Load optimization</p>
              <p className="text-xs text-blue-700">Peak hours: 18:30-19:45</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
