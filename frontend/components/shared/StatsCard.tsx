import { ReactNode } from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: { value: number; direction: 'up' | 'down' };
  status?: 'normal' | 'warning' | 'danger';
}

export function StatsCard({ label, value, unit, icon, trend, status }: StatsCardProps) {
  const statusClasses = {
    normal: 'border-l-4 border-l-purple-600',
    warning: 'border-l-4 border-l-yellow-600',
    danger: 'border-l-4 border-l-red-600',
  };

  const trendColor = trend?.direction === 'up' ? 'text-green-600' : 'text-red-600';

  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${statusClasses[status || 'normal']}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {value}
            {unit && <span className="text-lg text-gray-500 ml-1">{unit}</span>}
          </p>
          {trend && (
            <p className={`mt-2 text-sm font-medium ${trendColor}`}>
              {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && <div className="text-purple-600 opacity-20">{icon}</div>}
      </div>
    </div>
  );
}
