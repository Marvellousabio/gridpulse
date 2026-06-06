import { Badge } from '../shared/Badge';
import { Link2, AlertCircle } from 'lucide-react';

interface IntegrationProps {
  integrations: any[];
}

export function IntegrationsList({ integrations }: IntegrationProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Integrations</h3>
      <div className="space-y-4">
        {integrations.map((integration) => (
          <div key={integration.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">{integration.name}</h4>
              <p className="text-sm text-gray-600 mt-1">Last synced: {integration.lastSync}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={integration.status === 'connected' ? 'success' : 'warning'}>
                {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
              </Badge>
              <button className="px-4 py-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition-colors text-sm font-medium">
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
