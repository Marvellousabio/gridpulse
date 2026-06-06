'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getGridPulseApi } from '@/lib/gridpulse/api';
import type { RebalanceState } from '@/lib/types/gridpulse';
import { CLUSTERS } from '@/lib/types/gridpulse';
import { PhasePipeline } from '@/components/ops/PhasePipeline';
import { AssetBadge } from '@/components/ops/AssetBadge';
import { motion } from 'framer-motion';
import { CheckCircle, ShieldAlert, Zap } from 'lucide-react';

export function OrchestrationPage() {
  const api = useMemo(() => getGridPulseApi(), []);
  const [clusterId, setClusterId] = useState<string>('Ikeja');
  const [runId, setRunId] = useState<string | null>(null);
  const [state, setState] = useState<RebalanceState | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const poll = useCallback(
    async (id: string) => {
      try {
        const s = await api.getRebalance(id);
        setState(s);
        return s;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Rebalance poll failed');
        setRunning(false);
        return null;
      }
    },
    [api],
  );

  useEffect(() => {
    if (!runId) return;
    let cancelled = false;
    const tick = async () => {
      const s = await poll(runId);
      if (!cancelled && s?.graphPhase === 'DONE') setRunning(false);
    };
    tick();
    const id = setInterval(tick, 200);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [runId, poll]);

  const trigger = async () => {
    setRunning(true);
    setState(null);
    setError(null);
    try {
      const { runId: id } = await api.triggerRebalance(clusterId);
      setRunId(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start rebalance');
      setRunning(false);
    }
  };

  const phase = state?.graphPhase ?? 'ASSESS';
  const rerouted = phase === 'REROUTE' || phase === 'SETTLE' || phase === 'DONE';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Orchestration Theater</h1>
          <p className="text-text-soft text-sm font-serif italic mt-1">
            Autonomous agent loop — grid failure to cross-chemistry resolution
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={clusterId}
            onChange={(e) => setClusterId(e.target.value)}
            className="bg-ink-2 border border-line rounded px-3 py-2 text-sm mono-num"
            disabled={running}
          >
            {CLUSTERS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={trigger}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 rounded bg-critical/20 border border-critical text-critical font-bold text-sm hover:bg-critical/30 disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            Simulate Grid Failure
          </button>
        </div>
      </div>

      {error && (
        <div className="panel p-4 border-critical/50 bg-critical/10 text-critical text-sm">
          {error} — check <code className="mono-num">NEXT_PUBLIC_API_BASE</code> points at your Render URL.
        </div>
      )}

      {state && (
        <>
          {state.decision.humanApprovalRequired ? (
            <div className="panel p-4 border-amber-500/50 bg-amber-500/10 flex items-center gap-2 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
              Escalated — exceeds policy threshold · human approval required
            </div>
          ) : phase === 'DONE' ? (
            <div className="panel p-4 border-clean/50 bg-clean/10 flex items-center gap-2 text-clean font-bold">
              <CheckCircle className="w-5 h-5" />
              RESOLVED AUTONOMOUSLY · no human intervention
            </div>
          ) : null}

          <PhasePipeline current={phase} checkpoint={state.audit.checkpoint} />

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="panel p-4 space-y-3">
              <h3 className="text-sm font-bold text-critical uppercase tracking-wider">Fleet at risk</h3>
              {state.context.fleetAtRisk.map((f) => (
                <motion.div
                  key={f.fleetId}
                  layout
                  className={`p-3 rounded border mono-num text-sm ${
                    rerouted
                      ? 'border-clean bg-clean/10 text-clean'
                      : 'border-critical bg-critical/10 text-critical'
                  }`}
                >
                  <p className="font-bold">{f.fleetId}</p>
                  <p>{f.vehicles} vehicles · {f.avgRangeKmRemaining} km avg</p>
                  <p className="text-xs mt-1">{rerouted ? 'REROUTED' : 'STRANDED'} · {f.chemistry}</p>
                </motion.div>
              ))}
            </div>

            <div className="lg:col-span-1 panel p-4 space-y-3">
              <h3 className="text-sm font-bold text-agentic uppercase tracking-wider">Candidate nodes</h3>
              {state.context.candidateNodes.map((n) => {
                const isTarget = state.decision.reroutes.some((r) => r.toNode === n.nodeId);
                return (
                  <div
                    key={n.nodeId}
                    className={`p-3 rounded border ${isTarget && rerouted ? 'border-hydrogen bg-hydrogen/10' : 'border-line'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="mono-num text-xs font-bold">{n.nodeId}</p>
                      <AssetBadge assetClass={n.assetClass} />
                    </div>
                    <p className="mono-num text-xs text-text-soft mt-2">
                      {n.availableKwhEq} kWh-eq · ETA {n.etaMin}m · load {n.loadPct}%
                    </p>
                    {isTarget && rerouted && state.decision.reroutes[0]?.crossChemistry && (
                      <p className="mt-2 text-xs font-bold text-hydrogen border border-hydrogen/40 rounded px-2 py-1 inline-block">
                        LITHIUM → H₂ HUB · kWh-eq
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="panel p-4">
              <h3 className="text-sm font-bold text-text-soft uppercase tracking-wider mb-3">Forecast</h3>
              <div className="space-y-2 mono-num text-sm">
                <p>Depletion horizon: {state.forecast.depletionHorizonMin} min</p>
                <p>Demand spike: {state.forecast.demandSpikeFactor}x</p>
                <p className="text-text-soft text-xs">{state.forecast.model}</p>
              </div>
            </div>
          </div>

          <div className="panel p-4 bg-ink font-mono text-xs space-y-1 max-h-48 overflow-y-auto">
            <p className="text-agentic font-bold mb-2">Reasoning trace · {state.audit.agent}</p>
            {state.audit.reasoningTrace.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-text-soft border-l-2 border-agentic pl-2 py-0.5"
              >
                {line}
              </motion.p>
            ))}
          </div>
        </>
      )}

      {!state && (
        <div className="panel p-12 text-center text-text-soft">
          <p className="font-serif italic">Trigger a grid failure to stage the autonomous rebalance sequence.</p>
          <p className="mono-num text-xs mt-2">Target: &lt; 5s to committed REROUTE</p>
        </div>
      )}
    </div>
  );
}
