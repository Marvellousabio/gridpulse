import type {
  CleanEnergyRecord,
  ClusterAvailability,
  NodeState,
  RebalanceState,
  SettlementIntent,
} from '@/lib/types/gridpulse';
import { mockApi } from '@/lib/gridpulse/mock';

export interface GridPulseApi {
  getClusterAvailability(): Promise<ClusterAvailability[]>;
  getNode(nodeId: string): Promise<NodeState>;
  listNodes(): Promise<NodeState[]>;
  triggerRebalance(clusterId: string): Promise<{ runId: string }>;
  getRebalance(runId: string): Promise<RebalanceState>;
  listSettlements(): Promise<SettlementIntent[]>;
  getCleanEnergy(params?: { from?: string; to?: string }): Promise<CleanEnergyRecord[]>;
  health(): Promise<{ ok: boolean; lastCheckpoint: string }>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export const isLiveApi = Boolean(API_BASE);

async function fetchJson<T>(base: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

function createLiveApi(base: string): GridPulseApi {
  return {
    getClusterAvailability: () => fetchJson(base, '/v1/clusters/availability'),
    getNode: (nodeId) => fetchJson(base, `/v1/nodes/${nodeId}/state`),
    listNodes: () => fetchJson(base, '/v1/nodes'),
    triggerRebalance: (clusterId) =>
      fetchJson(base, '/v1/orchestrate/rebalance', {
        method: 'POST',
        body: JSON.stringify({ clusterId }),
      }),
    getRebalance: (runId) => fetchJson(base, `/v1/orchestrate/rebalance/${runId}`),
    listSettlements: () => fetchJson(base, '/v1/settlements'),
    getCleanEnergy: (params) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      return fetchJson(base, `/v1/ledger/clean-energy${q ? `?${q}` : ''}`);
    },
    health: () => fetchJson(base, '/v1/health'),
  };
}

export function getGridPulseApi(): GridPulseApi {
  if (API_BASE) {
    return createLiveApi(API_BASE.replace(/\/$/, ''));
  }
  return mockApi;
}
