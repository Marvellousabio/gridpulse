'use client';

import { useEffect, useMemo, useState } from 'react';
import { getGridPulseApi } from '@/lib/gridpulse/api';
import type { SettlementIntent, SettlementStatus } from '@/lib/types/gridpulse';
import { Lock, Unlock } from 'lucide-react';

const STATUS_STYLE: Record<SettlementStatus, string> = {
  PENDING_PROOF: 'bg-lithium/15 text-lithium border-lithium/40',
  PROOF_VERIFIED: 'bg-hydrogen/15 text-hydrogen border-hydrogen/40',
  CLEARED: 'bg-clean/15 text-clean border-clean/40',
  DISPUTED: 'bg-critical/15 text-critical border-critical/40',
};

export function SettlementPage() {
  const api = useMemo(() => getGridPulseApi(), []);
  const [intents, setIntents] = useState<SettlementIntent[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const data = await api.listSettlements();
      if (!cancelled) setIntents(data);
    };
    load();
    const id = setInterval(load, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [api]);

  const cleared = intents.filter((i) => i.status === 'CLEARED');
  const pending = intents.filter((i) => i.status === 'PENDING_PROOF');
  const disputed = intents.filter((i) => i.status === 'DISPUTED');
  const clearedKwh = cleared.reduce((s, i) => s + i.kwhEq, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Settlement Ledger</h1>
        <p className="text-text-soft text-sm font-serif italic mt-1">
          Proof-gated M2M clearing — no CLEARED without hardware proof
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Total label="Cleared kWh-eq" value={clearedKwh.toFixed(1)} />
        <Total label="Pending proof" value={String(pending.length)} />
        <Total label="Disputed" value={String(disputed.length)} />
      </div>

      <div className="panel overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-text-soft text-left">
            <tr>
              <th className="p-3">Proof gate</th>
              <th className="p-3">Payer → Payee</th>
              <th className="p-3 mono-num">kWh-eq</th>
              <th className="p-3">Status</th>
              <th className="p-3 mono-num">proofRef</th>
            </tr>
          </thead>
          <tbody>
            {intents.map((i) => (
              <tr key={i.intentId} className="border-b border-line/50 hover:bg-ink-3">
                <td className="p-3">
                  {i.status === 'CLEARED' && i.proofRef ? (
                    <Unlock className="w-4 h-4 text-clean" />
                  ) : (
                    <Lock className="w-4 h-4 text-lithium" />
                  )}
                </td>
                <td className="p-3 mono-num text-xs">
                  {i.payer} → {i.payee}
                </td>
                <td className="p-3 mono-num">{i.kwhEq}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded border mono-num ${STATUS_STYLE[i.status]}`}>
                    {i.status}
                  </span>
                </td>
                <td className="p-3 mono-num text-xs text-text-soft max-w-[200px] truncate">
                  {i.proofRef ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Total({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-4">
      <p className="text-xs text-text-soft uppercase">{label}</p>
      <p className="text-xl font-black mono-num mt-1">{value}</p>
    </div>
  );
}
