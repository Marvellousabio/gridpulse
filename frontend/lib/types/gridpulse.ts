export type AssetClass = 'LITHIUM_SWAP' | 'HYDROGEN_HUB';
export type PowerSource = 'GRID' | 'SOLAR_PV' | 'DIESEL_GENSET';

export interface NodeIdentity {
  nodeId: string;
  operatorId: string;
  assetClass: AssetClass;
  geo: { lat: number; lng: number; cluster: string };
  powerSource: {
    currentSource: PowerSource;
    gridAvailable: boolean;
    fallbackChain: PowerSource[];
  };
}

export interface LithiumPack {
  packId: string;
  soc: number;
  sohPct: number;
  cellTempC: number;
  packVoltage: number;
  cycleCount: number;
  estReadyInMin: number;
}

export interface LithiumMetrics {
  baysTotal: number;
  baysCharged: number;
  baysCharging: number;
  baysFaulted: number;
  packs: LithiumPack[];
}

export interface HydrogenMetrics {
  canistersTotal: number;
  canistersFull: number;
  tankPressurePsi: number;
  flowRateGramPerMin: number;
  purityPct: number;
  tankTempC: number;
  leakPpm: number;
  compressorDutyCyclePct: number;
}

export interface NodeState {
  schemaVersion: 'gridpulse.telemetry.v1';
  node: NodeIdentity;
  metrics: { lithium?: LithiumMetrics; hydrogen?: HydrogenMetrics };
  energyLedger: { deliveredKwhEq: number; cleanFractionPct: number; settlementPending: number };
  availableKwhEq: number;
  health: { uptimePct: number; lastFault: string | null; firmwareVer: string };
  updatedAt: string;
}

export interface ClusterAvailability {
  clusterId: string;
  gridAvailable: boolean;
  nodes: number;
  availableKwhEq: number;
  byChemistry: { LITHIUM_SWAP: number; HYDROGEN_HUB: number };
}

export type GraphPhase = 'ASSESS' | 'FORECAST' | 'ALLOCATE' | 'REROUTE' | 'SETTLE' | 'DONE';

export interface RebalanceState {
  runId: string;
  trigger: { type: 'GRID_FAILURE'; clusterId: string; detectedAt: string; confidence: number };
  graphPhase: GraphPhase;
  context: {
    fleetAtRisk: {
      fleetId: string;
      vehicles: number;
      avgRangeKmRemaining: number;
      chemistry: 'LITHIUM' | 'HYDROGEN';
    }[];
    candidateNodes: {
      nodeId: string;
      assetClass: AssetClass;
      availableKwhEq: number;
      etaMin: number;
      loadPct: number;
    }[];
  };
  forecast: { depletionHorizonMin: number; demandSpikeFactor: number; model: string };
  decision: {
    reroutes: { fleetId: string; toNode: string; units: number; crossChemistry: boolean }[];
    loadShifts: { nodeId: string; powerSource: PowerSource }[];
    humanApprovalRequired: boolean;
  };
  settlement: { intents: SettlementIntent[] };
  audit: { agent: string; reasoningTrace: string[]; checkpoint: string };
}

export type SettlementStatus = 'PENDING_PROOF' | 'PROOF_VERIFIED' | 'CLEARED' | 'DISPUTED';

export interface GridPulseHealth {
  ok: boolean;
  lastCheckpoint: string;
  cencoriEnabled?: boolean;
  elizaM2mAgents?: number;
  service?: string;
}

export interface SettlementIntent {
  intentId?: string;
  payer: string;
  payee: string;
  kwhEq: number;
  status: SettlementStatus;
  proofRef?: string;
  clearedAt?: string;
  verifiedAt?: string;
  payerAgentId?: string;
  payeeAgentId?: string;
  payerWallet?: string;
  payeeWallet?: string;
  amountNgn?: number;
  txHash?: string;
  protocol?: string;
  settlementRail?: string;
}

export interface CleanEnergyRecord {
  recordId: string;
  nodeId: string;
  kwhEq: number;
  cleanFractionPct: number;
  source: PowerSource;
  settledAt: string;
  proofRef: string;
}

export const CLUSTERS = ['Ikeja', 'Yaba', 'Lekki', 'Surulere', 'Apapa', 'Ikorodu'] as const;
export type ClusterId = (typeof CLUSTERS)[number];

export const GRAPH_PHASES: GraphPhase[] = ['ASSESS', 'FORECAST', 'ALLOCATE', 'REROUTE', 'SETTLE', 'DONE'];
