import { Badge } from '../shared/Badge';
import { AlertCircle } from 'lucide-react';

interface AssetProps {
  assets: any[];
}

export function AssetManagement({ assets }: AssetProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Asset Management</h2>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
          Add Asset
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Asset ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Health</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{asset.id}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{asset.type}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{asset.location}</td>
                <td className="px-6 py-4">
                  <Badge variant={asset.status === 'operational' ? 'success' : 'warning'}>
                    {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${asset.health >= 80 ? 'bg-green-600' : asset.health >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
                        style={{ width: `${asset.health}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{asset.health}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button className="text-purple-600 hover:text-purple-700 font-medium">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
