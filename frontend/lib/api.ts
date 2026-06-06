import type {
  MapStation,
  OnChainLedgerEntry,
  SettlementEntry,
  TerminalLog,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const REQUEST_TIMEOUT_MS = 10_000;

async function apiCall<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API ${response.status}: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timeout);
  }
}

export const apiClient = {
  getTerminalLogs: () =>
    apiCall<{ logs: TerminalLog[] }>('/api/logs/terminal').then((r) => r.logs),

  getLiveInfrastructure: () =>
    apiCall<{ stations: MapStation[] }>('/api/infrastructure/live').then((r) => r.stations),

  getSettlements: () =>
    apiCall<{ settlements: SettlementEntry[] }>('/api/settlements').then((r) => r.settlements),

  getOnChainLedger: () =>
    apiCall<{ entries: OnChainLedgerEntry[] }>('/api/ledger/onchain').then((r) => r.entries),

  triggerDemo: () =>
    apiCall<{ ok: boolean; message: string; cycle_id: string }>('/api/demo/trigger', {
      method: 'POST',
    }),
};

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
