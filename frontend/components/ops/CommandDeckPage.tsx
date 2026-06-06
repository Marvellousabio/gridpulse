'use client';

import { useEffect, useMemo, useState } from 'react';
import { getGridPulseApi } from '@/lib/gridpulse/api';
import type { ClusterAvailability, NodeState } from '@/lib/types/gridpulse';
import { ClusterMap } from '@/components/ops/ClusterMap';
import { CountUp } from '@/components/ops/CountUp';

export function CommandDeckPage() {
  const api = useMemo(() => getGridPulseApi(), []);
  const [clusters, setClusters] = useState<ClusterAvailability[]>([]);
  const [nodes, setNodes] = useState<NodeState[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [c, n] = await Promise.all([api.getClusterAvailability(), api.listNodes()]);
      if (!cancelled) {
        setClusters(c);
        setNodes(n);
      }
    };
    load();
    const id = setInterval(load, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [api]);

  const totalKwh = clusters.reduce((s, c) => s + c.availableKwhEq, 0);
  const totalLi = clusters.reduce((s, c) => s + c.byChemistry.LITHIUM_SWAP, 0);
  const totalH2 = clusters.reduce((s, c) => s + c.byChemistry.HYDROGEN_HUB, 0);
  const online = nodes.length;
  const liPct = totalKwh > 0 ? (totalLi / totalKwh) * 100 : 50;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Command Deck</h1>
        <p className="text-text-soft text-sm font-serif italic mt-1">
          One control plane · two chemistries · Lagos network
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="kWh-eq available" value={totalKwh} />
        <Stat label="Nodes online" value={online} decimals={0} />
        <Stat label="Clean fraction" value={68} suffix="%" />
        <Stat label="Pending settlements" value={2} decimals={0} />
      </div>

      <div className="panel p-3">
        <p className="text-xs text-text-soft mb-2 uppercase tracking-wider font-bold">Chemistry split</p>
        <div className="flex h-3 rounded overflow-hidden">
          <div className="bg-lithium" style={{ width: `${liPct}%` }} />
          <div className="bg-hydrogen flex-1" />
        </div>
        <div className="flex justify-between mt-2 text-xs mono-num text-text-soft">
          <span className="text-lithium">Li {Math.round(totalLi)} kWh-eq</span>
          <span className="text-hydrogen">H₂ {Math.round(totalH2)} kWh-eq</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ClusterMap nodes={nodes} clusters={clusters} />
        <div className="panel overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-line text-text-soft text-left">
              <tr>
                <th className="p-3 font-bold">Cluster</th>
                <th className="p-3 font-bold">Grid</th>
                <th className="p-3 font-bold mono-num">Nodes</th>
                <th className="p-3 font-bold mono-num">kWh-eq</th>
              </tr>
            </thead>
            <tbody>
              {clusters.map((c) => (
                <tr key={c.clusterId} className="border-b border-line/50 hover:bg-ink-3">
                  <td className="p-3 font-semibold">{c.clusterId}</td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded mono-num ${
                        c.gridAvailable
                          ? 'bg-clean/15 text-clean border border-clean/30'
                          : 'bg-critical/15 text-critical border border-critical/30'
                      }`}
                    >
                      {c.gridAvailable ? 'GRID OK' : 'GRID DOWN'}
                    </span>
                  </td>
                  <td className="p-3 mono-num">{c.nodes}</td>
                  <td className="p-3 mono-num">{c.availableKwhEq}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix = '',
  decimals = 1,
}: {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
}) {
  return (
    <div className="panel p-4">
      <p className="text-xs text-text-soft uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black mt-1">
        <CountUp value={value} decimals={decimals} suffix={suffix} />
      </p>
    </div>
  );
}
