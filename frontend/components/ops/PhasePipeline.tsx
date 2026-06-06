'use client';

import type { GraphPhase } from '@/lib/types/gridpulse';
import { GRAPH_PHASES } from '@/lib/types/gridpulse';
import { motion } from 'framer-motion';
import { Database } from 'lucide-react';

interface PhasePipelineProps {
  current: GraphPhase;
  checkpoint?: string;
}

export function PhasePipeline({ current, checkpoint }: PhasePipelineProps) {
  const activeIdx = GRAPH_PHASES.indexOf(current);

  return (
    <div className="panel p-6">
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-0">
        {GRAPH_PHASES.filter((p) => p !== 'DONE').map((phase, idx) => {
          const lit = idx <= activeIdx;
          const isCurrent = phase === current;
          return (
            <div key={phase} className="flex items-center">
              <motion.div
                animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.6, repeat: isCurrent ? Infinity : 0 }}
                className={`px-3 py-2 rounded border text-xs font-bold mono-num ${
                  lit
                    ? 'bg-agentic/20 border-agentic text-agentic'
                    : 'bg-ink border-line text-text-soft'
                }`}
              >
                {phase}
              </motion.div>
              {idx < GRAPH_PHASES.length - 2 && (
                <div className={`w-6 h-0.5 mx-1 ${lit ? 'bg-agentic' : 'bg-line'}`} />
              )}
            </div>
          );
        })}
      </div>
      {checkpoint && activeIdx > 0 && (
        <p className="mt-4 text-center text-xs text-text-soft flex items-center justify-center gap-1 mono-num">
          <Database className="w-3 h-3 text-aws" />
          CHECKPOINT → DynamoDB · {checkpoint}
        </p>
      )}
    </div>
  );
}
