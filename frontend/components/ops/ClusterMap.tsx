'use client';

import { useRouter } from 'next/navigation';
import type { NodeState } from '@/lib/types/gridpulse';
import { CLUSTER_COORDS } from '@/lib/gridpulse/mock';

interface ClusterMapProps {
  nodes: NodeState[];
  clusters: { clusterId: string; gridAvailable: boolean }[];
}

export function ClusterMap({ nodes, clusters }: ClusterMapProps) {
  const router = useRouter();
  const gridByCluster = Object.fromEntries(clusters.map((c) => [c.clusterId, c.gridAvailable]));

  return (
    <div className="panel p-4">
      <svg viewBox="0 0 280 180" className="w-full h-auto">
        <rect x="0" y="0" width="280" height="180" fill="#0A0E14" rx="8" />
        <path
          d="M 40 30 L 240 20 L 260 160 L 30 170 Z"
          fill="none"
          stroke="#243042"
          strokeWidth="1"
          opacity="0.6"
        />
        {nodes.map((node) => {
          const cluster = node.node.geo.cluster as keyof typeof CLUSTER_COORDS;
          const base = CLUSTER_COORDS[cluster] ?? { x: 140, y: 90 };
          const jitter = (node.node.nodeId.charCodeAt(node.node.nodeId.length - 1) % 5) * 6;
          const cx = base.x + (node.node.assetClass === 'HYDROGEN_HUB' ? 12 : -8) + jitter;
          const cy = base.y + (node.node.assetClass === 'HYDROGEN_HUB' ? -6 : 6);
          const r = Math.max(6, Math.min(14, node.availableKwhEq / 10));
          const color = node.node.assetClass === 'LITHIUM_SWAP' ? '#F4A52B' : '#28CBD6';
          const gridDown = gridByCluster[cluster] === false;

          return (
            <g
              key={node.node.nodeId}
              className="cursor-pointer"
              onClick={() => router.push(`/nodes/${node.node.nodeId}`)}
            >
              {gridDown && (
                <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="#E5564B" strokeWidth="2" opacity="0.8" />
              )}
              <circle cx={cx} cy={cy} r={r} fill={color} opacity="0.85" />
              <title>{node.node.nodeId}</title>
            </g>
          );
        })}
        {Object.entries(CLUSTER_COORDS).map(([name, { x, y }]) => (
          <text key={name} x={x} y={y + 28} textAnchor="middle" fill="#9FB0C4" fontSize="8" fontFamily="Archivo">
            {name}
          </text>
        ))}
      </svg>
      <div className="flex gap-4 mt-3 text-xs text-text-soft">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-lithium" /> Li-Ion
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-hydrogen" /> Hydrogen
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full border-2 border-critical" /> Grid down
        </span>
      </div>
    </div>
  );
}
