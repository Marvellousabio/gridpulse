import { Badge } from '../shared/Badge';
import { Star, TrendingUp } from 'lucide-react';

interface PartnerCardProps {
  partner: any;
}

export function PartnerCard({ partner }: PartnerCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{partner.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{partner.category}</p>
        </div>
        <Badge variant={partner.status === 'active' ? 'success' : 'warning'}>
          {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
        </Badge>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Rating</span>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < Math.floor(partner.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-600">Balance</p>
            <p className="text-sm font-medium text-gray-900">NGN {(partner.balance / 1000).toFixed(0)}K</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Revenue</p>
            <p className="text-sm font-medium text-gray-900">NGN {(partner.revenue / 1000000).toFixed(1)}M</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-600">Transactions</p>
            <p className="text-sm font-medium text-gray-900">{partner.transactions}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Joined</p>
            <p className="text-sm font-medium text-gray-900">{new Date(partner.joinDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <button className="mt-4 w-full px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium">
        View Details
      </button>
    </div>
  );
}
