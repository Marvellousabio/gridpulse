'use client';

import { useEffect, useState } from 'react';
import { getGridPulseApi, isLiveApi } from '@/lib/gridpulse/api';
import type { GridPulseHealth } from '@/lib/types/gridpulse';
import { Brain, Radio, Wallet } from 'lucide-react';

export function SystemStatusBar() {
  const [health, setHealth] = useState<GridPulseHealth | null>(null);

  useEffect(() => {
    if (!isLiveApi) return;
    let cancelled = false;
    const load = async () => {
      try {
        const h = await getGridPulseApi().health();
        if (!cancelled) setHealth(h);
      } catch {
        if (!cancelled) setHealth(null);
      }
    };
    load();
    const id = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!isLiveApi) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-[10px] mono-num">
      <span className="flex items-center gap-1 px-2 py-0.5 rounded border border-clean/40 bg-clean/10 text-clean">
        <Radio className="w-3 h-3" />
        LIVE
      </span>
      {health?.cencoriEnabled && (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded border border-agentic/40 bg-agentic/10 text-agentic">
          <Brain className="w-3 h-3" />
          Cencori AI
        </span>
      )}
      {(health?.elizaM2mAgents ?? 0) > 0 && (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded border border-hydrogen/40 bg-hydrogen/10 text-hydrogen">
          <Wallet className="w-3 h-3" />
          eliza M2M ×{health?.elizaM2mAgents}
        </span>
      )}
    </div>
  );
}
