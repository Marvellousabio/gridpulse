'use client';

import { motion } from 'framer-motion';
import { generateMapStations } from '@/lib/mockData';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

export function InfrastructureMap() {
  const stations = generateMapStations();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'inactive':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'maintenance':
        return <Clock className="w-4 h-4" />;
      case 'inactive':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Infrastructure Map</h3>
        <p className="text-sm text-gray-500 mt-1">Lagos Grid Network Status</p>
      </div>

      <div className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg overflow-hidden border border-blue-100">
        {/* Simplified map background */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 300">
          <circle cx="150" cy="100" r="80" fill="none" stroke="#3B82F6" strokeWidth="2" />
          <circle cx="200" cy="150" r="120" fill="none" stroke="#3B82F6" strokeWidth="1" />
          <path d="M 100 150 Q 200 100 300 200" fill="none" stroke="#3B82F6" strokeWidth="1" />
        </svg>

        {/* Station nodes */}
        <div className="absolute inset-0">
          {stations.map((station, index) => (
            <motion.div
              key={station.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="absolute group"
              style={{
                left: `${30 + (station.lng / 4)}%`,
                top: `${40 + (station.lat / 3)}%`,
              }}
            >
              {/* Pulse effect for active stations */}
              {station.status === 'active' && (
                <div className="absolute inset-0 animate-pulse">
                  <div className="w-6 h-6 bg-green-400 rounded-full opacity-75" />
                </div>
              )}

              {/* Station marker */}
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-transform group-hover:scale-125 ${
                  station.status === 'active'
                    ? 'bg-green-400 border-green-500'
                    : station.status === 'maintenance'
                      ? 'bg-yellow-400 border-yellow-500'
                      : 'bg-red-400 border-red-500'
                }`}
              />

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap">
                  <p className="font-semibold">{station.name}</p>
                  <p className="text-gray-300">Load: {station.load}%</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Station status list */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        {stations.map((station) => (
          <div
            key={station.id}
            className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(station.status)}`}
          >
            <div className="flex items-center gap-2">
              {getStatusIcon(station.status)}
              <span className="text-sm font-medium">{station.name}</span>
            </div>
            <span className="text-sm font-semibold">{station.load}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
