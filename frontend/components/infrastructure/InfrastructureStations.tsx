import { BarChart3, AlertTriangle, Zap } from 'lucide-react';
import { Badge } from '../shared/Badge';

interface InfrastructureStationsProps {
  stations: any[];
}

export function InfrastructureStations({ stations }: InfrastructureStationsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Power Stations</h2>
          <p className="text-sm text-gray-600 mt-1">{stations.length} stations across the network</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg">
          <Zap size={20} className="text-purple-600" />
          <span className="text-sm font-medium text-gray-900">Active: 6/7</span>
        </div>
      </div>

      <div className="space-y-4">
        {stations.map((station) => (
          <div key={station.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{station.name}</h3>
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                <span>Capacity: {station.capacity} MW</span>
                <span>Load: {station.load} MW ({station.efficiency}%)</span>
                <span>Uptime: {station.uptime}%</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={station.status === 'active' ? 'success' : station.status === 'maintenance' ? 'warning' : 'danger'}>
                {station.status.charAt(0).toUpperCase() + station.status.slice(1)}
              </Badge>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{Math.round((station.load / station.capacity) * 100)}%</div>
                <div className="text-xs text-gray-500">utilization</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
