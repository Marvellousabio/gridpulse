'use client';

import { useEffect, useMemo, useState } from 'react';
import { getGridPulseApi } from '@/lib/gridpulse/api';
import type { CleanEnergyRecord } from '@/lib/types/gridpulse';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Download } from 'lucide-react';

export function CarbonPage() {
  const api = useMemo(() => getGridPulseApi(), []);
  const [records, setRecords] = useState<CleanEnergyRecord[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const data = await api.getCleanEnergy();
      if (!cancelled) setRecords(data);
    };
    load();
    const id = setInterval(load, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [api]);

  const avgClean =
    records.length > 0
      ? records.reduce((s, r) => s + r.cleanFractionPct, 0) / records.length
      : 0;

  const donut = [
    { name: 'Clean', value: avgClean, fill: '#3DBE78' },
    { name: 'Grid-mix', value: 100 - avgClean, fill: '#243042' },
  ];

  const exportAttestation = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), records }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gridpulse-mrv-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Carbon / MRV</h1>
          <p className="text-text-soft text-sm font-serif italic mt-1">
            Immutable clean-energy attestations for investor-grade MRV
          </p>
        </div>
        <button
          type="button"
          onClick={exportAttestation}
          className="flex items-center gap-2 px-4 py-2 rounded border border-clean text-clean text-sm font-bold hover:bg-clean/10"
        >
          <Download className="w-4 h-4" />
          Export Attestation
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="panel p-4 h-64">
          <p className="text-xs text-text-soft uppercase mb-2">Network clean fraction</p>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={donut} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {donut.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#10151F', border: '1px solid #243042', fontFamily: 'JetBrains Mono' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-center mono-num text-clean font-bold">{avgClean.toFixed(0)}% clean avg</p>
        </div>

        <div className="lg:col-span-2 panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line text-text-soft text-left">
              <tr>
                <th className="p-3 mono-num">Record</th>
                <th className="p-3">Node</th>
                <th className="p-3 mono-num">kWh-eq</th>
                <th className="p-3 mono-num">Clean %</th>
                <th className="p-3">Source</th>
                <th className="p-3 mono-num">proofRef</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.recordId} className="border-b border-line/50 hover:bg-ink-3">
                  <td className="p-3 mono-num text-xs">{r.recordId}</td>
                  <td className="p-3 mono-num text-xs">{r.nodeId}</td>
                  <td className="p-3 mono-num">{r.kwhEq}</td>
                  <td className="p-3 mono-num text-clean">{r.cleanFractionPct}%</td>
                  <td className="p-3 mono-num text-xs">{r.source}</td>
                  <td className="p-3 mono-num text-xs text-text-soft max-w-[160px] truncate">{r.proofRef}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
