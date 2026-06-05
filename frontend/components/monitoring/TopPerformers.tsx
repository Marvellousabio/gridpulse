'use client';

import { generateTopPerformers } from '@/lib/mockData';
import { Star, TrendingUp } from 'lucide-react';

export function TopPerformers() {
  const performers = generateTopPerformers();

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
        <p className="text-sm text-gray-500 mt-1">Provider performance rankings</p>
      </div>

      <div className="space-y-4">
        {performers.map((performer) => (
          <div
            key={performer.rank}
            className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-300 transition-colors"
          >
            {/* Rank badge */}
            <div className="flex-shrink-0">
              {performer.rank === 1 ? (
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                </div>
              ) : performer.rank === 2 ? (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <Star className="w-6 h-6 text-gray-400" />
                </div>
              ) : performer.rank === 3 ? (
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Star className="w-6 h-6 text-orange-500" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                  {performer.rank}
                </div>
              )}
            </div>

            {/* Provider info */}
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{performer.provider}</p>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                <span>Uptime: {performer.uptime}</span>
                <span>Requests: {performer.requests}</span>
              </div>
            </div>

            {/* Score */}
            <div className="flex-shrink-0 text-right">
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-gray-900">{performer.score}</span>
                <span className="text-sm text-gray-500">/10</span>
              </div>
              <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>+0.2</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
