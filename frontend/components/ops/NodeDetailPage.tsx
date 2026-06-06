'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getGridPulseApi } from '@/lib/gridpulse/api';
import type { NodeState } from '@/lib/types/gridpulse';
import { AssetBadge } from '@/components/ops/AssetBadge';
import { ArrowLeft } from 'lucide-react';

export function NodeDetailPage() {
  const { nodeId } = useParams<{ nodeId: string }>();
  const api = useMemo(() => getGridPulseApi(), []);
  const [node, setNode] = useState<NodeState | null>(null);

  useEffect(() => {
    if (!nodeId) return;
    let cancelled = false;
    const load = async () => {
      const n = await api.getNode(nodeId);
      if (!cancelled) setNode(n);
    };
    load();
    const id = setInterval(load, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [api, nodeId]);

  if (!node) {
    return <p className="text-text-soft mono-num">Loading node telemetry…</p>;
  }

  const { node: id, metrics, energyLedger, health, availableKwhEq } = node;
  const chain = id.powerSource.fallbackChain;

  return (
    <div className="space-y-6 max-w-4xl">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-text-soft hover:text-text">
        <ArrowLeft className="w-4 h-4" /> Command Deck
      </Link>

      <header className="panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mono-num text-lg font-bold">{id.nodeId}</p>
            <p className="text-text-soft text-sm mt-1 mono-num">{id.operatorId}</p>
            <p className="text-text-soft text-sm mt-2">{id.geo.cluster} cluster</p>
          </div>
          <AssetBadge assetClass={id.assetClass} />
        </div>

        <div className="mt-6">
          <p className="text-xs text-text-soft uppercase tracking-wider mb-2">Power source chain</p>
          <div className="flex flex-wrap items-center gap-2 mono-num text-sm">
            {chain.map((src) => (
              <span
                key={src}
                className={`px-2 py-1 rounded border ${
                  src === id.powerSource.currentSource
                    ? 'border-agentic bg-agentic/20 text-agentic font-bold'
                    : 'border-line text-text-soft'
                }`}
              >
                {src === id.powerSource.currentSource ? `▸ ${src}` : src}
              </span>
            ))}
          </div>
        </div>
      </header>

      {id.assetClass === 'LITHIUM_SWAP' && metrics.lithium && (
        <LithiumPanel metrics={metrics.lithium} />
      )}
      {id.assetClass === 'HYDROGEN_HUB' && metrics.hydrogen && (
        <HydrogenPanel metrics={metrics.hydrogen} />
      )}

      <footer className="panel p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <FooterStat label="Available kWh-eq" value={String(availableKwhEq)} />
        <FooterStat label="Delivered kWh-eq" value={String(energyLedger.deliveredKwhEq)} />
        <FooterStat label="Clean fraction" value={`${energyLedger.cleanFractionPct}%`} />
        <FooterStat label="Uptime" value={`${health.uptimePct}%`} />
        <FooterStat label="Firmware" value={health.firmwareVer} />
        <FooterStat label="Last fault" value={health.lastFault ?? '—'} />
      </footer>
    </div>
  );
}

function FooterStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-text-soft">{label}</p>
      <p className="mono-num font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function LithiumPanel({ metrics }: { metrics: NonNullable<NodeState['metrics']['lithium']> }) {
  return (
    <div className="panel p-6 space-y-4">
      <h2 className="font-bold text-lithium">Lithium swap bays</h2>
      <div className="grid grid-cols-4 gap-3">
        <BayStat label="Charged" value={metrics.baysCharged} color="text-clean" />
        <BayStat label="Charging" value={metrics.baysCharging} color="text-lithium" />
        <BayStat label="Faulted" value={metrics.baysFaulted} color="text-critical" />
        <BayStat label="Total" value={metrics.baysTotal} color="text-text" />
      </div>
      <table className="w-full text-xs">
        <thead className="text-text-soft border-b border-line">
          <tr>
            <th className="text-left py-2">Pack</th>
            <th className="text-right py-2">SOC</th>
            <th className="text-right py-2">SOH</th>
            <th className="text-right py-2">°C</th>
            <th className="text-right py-2">V</th>
            <th className="text-right py-2">Ready</th>
          </tr>
        </thead>
        <tbody className="mono-num">
          {metrics.packs.map((p) => (
            <tr key={p.packId} className="border-b border-line/40">
              <td className="py-2">{p.packId}</td>
              <td className="text-right py-2">{p.soc}%</td>
              <td className="text-right py-2">{p.sohPct}%</td>
              <td className="text-right py-2">{p.cellTempC}</td>
              <td className="text-right py-2">{p.packVoltage}</td>
              <td className="text-right py-2">{p.estReadyInMin}m</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HydrogenPanel({ metrics }: { metrics: NonNullable<NodeState['metrics']['hydrogen']> }) {
  const leakWarn = metrics.leakPpm > 10;
  return (
    <div className="panel p-6">
      <h2 className="font-bold text-hydrogen mb-4">Hydrogen canister hub</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mono-num">
        <Gauge label="Tank PSI" value={metrics.tankPressurePsi} unit="psi" />
        <Gauge label="Flow rate" value={metrics.flowRateGramPerMin} unit="g/min" />
        <Gauge label="Purity" value={metrics.purityPct} unit="%" />
        <Gauge label="Tank °C" value={metrics.tankTempC} unit="°C" />
        <Gauge label="Leak" value={metrics.leakPpm} unit="ppm" warn={leakWarn} />
        <Gauge label="Compressor" value={metrics.compressorDutyCyclePct} unit="%" />
        <Gauge label="Canisters full" value={metrics.canistersFull} unit={`/${metrics.canistersTotal}`} />
      </div>
    </div>
  );
}

function BayStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-ink rounded p-3 border border-line">
      <p className="text-xs text-text-soft">{label}</p>
      <p className={`text-xl font-black mono-num ${color}`}>{value}</p>
    </div>
  );
}

function Gauge({
  label,
  value,
  unit,
  warn,
}: {
  label: string;
  value: number;
  unit: string;
  warn?: boolean;
}) {
  return (
    <div className={`rounded p-3 border ${warn ? 'border-critical bg-critical/10' : 'border-line bg-ink'}`}>
      <p className="text-xs text-text-soft">{label}</p>
      <p className={`text-lg font-bold mono-num ${warn ? 'text-critical' : ''}`}>
        {value}
        <span className="text-text-soft text-sm ml-1">{unit}</span>
      </p>
    </div>
  );
}
