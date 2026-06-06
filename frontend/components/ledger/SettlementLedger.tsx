'use client';

import { useEffect, useState } from 'react';
import { generateSettlementData } from '@/lib/mockData';
import { apiClient } from '@/lib/api';
import type { SettlementEntry } from '@/lib/types';
import { CheckCircle, Clock, Wifi, WifiOff } from 'lucide-react';

const POLL_MS = 6000;

export function SettlementLedger() {
  const [settlements, setSettlements] = useState<SettlementEntry[]>(generateSettlementData());
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const next = await apiClient.getSettlements();
        if (!cancelled) {
          setSettlements(next);
          setLive(true);
        }
      } catch {
        if (!cancelled) setLive(false);
      }
    };

    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'processing':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">
            <Clock className="w-3 h-3" />
            Processing
          </span>
        );
      default:
        return null;
    }
  };

  const formatAmount = (settlement: SettlementEntry) => {
    if (settlement.provider.includes('GridPulse') || settlement.reference.startsWith('TXN-AGENT')) {
      return `₦${settlement.amount.toLocaleString()}`;
    }
    return `$${settlement.amount.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Cross-Operator Settlement Ledger</h3>
          <p className="text-sm text-gray-500 mt-1">B2B fleet billing & SLA settlements</p>
        </div>
        <span
          className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border ${
            live ? 'text-green-700 border-green-200 bg-green-50' : 'text-amber-700 border-amber-200 bg-amber-50'
          }`}
        >
          {live ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {live ? 'Live' : 'Cached'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Provider</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Reference</th>
            </tr>
          </thead>
          <tbody>
            {settlements.map((settlement) => (
              <tr key={settlement.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 text-gray-600">{settlement.date}</td>
                <td className="py-3 px-4 text-gray-900 font-medium">{settlement.provider}</td>
                <td className="py-3 px-4 text-gray-900 font-semibold">{formatAmount(settlement)}</td>
                <td className="py-3 px-4">{getStatusBadge(settlement.status)}</td>
                <td className="py-3 px-4 text-gray-500 font-mono text-xs">{settlement.reference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
