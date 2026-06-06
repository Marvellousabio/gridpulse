export type LogType = 'success' | 'warning' | 'info' | 'error';
export type StationStatus = 'active' | 'maintenance' | 'inactive';

export interface TerminalLog {
  id: number;
  timestamp: string;
  message: string;
  type: LogType;
}

export interface MapStation {
  id: number;
  name: string;
  lat: number;
  lng: number;
  status: StationStatus;
  load: number;
  station_type?: string;
  telemetry?: TelemetryStation;
}

export interface TelemetryStation {
  station_id: string;
  name: string;
  type: 'Lithium_Swap' | 'H2_Canister';
  location: string;
  lat: number;
  lng: number;
  grid_active: boolean;
  solar_soc_pct?: number;
  available_batteries?: number;
  hydrogen_psi?: number;
  available_canisters?: number;
  timestamp?: string;
}

export interface SettlementEntry {
  id: string;
  date: string;
  amount: number;
  status: 'completed' | 'pending' | 'processing';
  provider: string;
  reference: string;
}

export interface OnChainLedgerEntry {
  id: string;
  tx_hash: string;
  timestamp: string;
  operator_from: string;
  operator_to: string;
  kwh_equivalent: number;
  amount_ngn: number;
  status: 'confirmed' | 'pending';
  description: string;
}
