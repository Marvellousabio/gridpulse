'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { OnChainLedgerEntry } from '@/lib/types';
import { Link2, Wifi, WifiOff } from 'lucide-react';

const POLL_MS = 6000;

export function OnChainLedger() {
  const [entries, setEntries] = useState<OnChainLedgerEntry[]>([]);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const next = await apiClient.getOnChainLedger();
        if (!cancelled) {
          setEntries(next);
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

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">On-Chain Settlement Ledger</h3>
          <p className="text-sm text-gray-500 mt-1">Auditable kWh-equivalent trades across operators</p>
        </div>
        <span
          className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border ${
            live ? 'text-green-700 border-green-200 bg-green-50' : 'text-amber-700 border-amber-200 bg-amber-50'
          }`}
        >
          {live ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {live ? 'Live' : 'Waiting for agent'}
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">
          Trigger the demo agent to record cross-asset settlements on-chain.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tx Hash</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Route</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">kWh Eq.</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-xs text-purple-700 max-w-[140px] truncate">
                    <span className="inline-flex items-center gap-1">
                      <Link2 className="w-3 h-3 flex-shrink-0" />
                      {entry.tx_hash}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {entry.operator_from} → {entry.operator_to}
                  </td>
                  <td className="py-3 px-4 font-medium">{entry.kwh_equivalent}</td>
                  <td className="py-3 px-4 font-semibold">₦{entry.amount_ngn.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
