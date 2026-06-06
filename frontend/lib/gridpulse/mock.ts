import type {
  CleanEnergyRecord,
  ClusterAvailability,
  ClusterId,
  GraphPhase,
  NodeState,
  PowerSource,
  RebalanceState,
  SettlementIntent,
} from '@/lib/types/gridpulse';
import { CLUSTERS, GRAPH_PHASES } from '@/lib/types/gridpulse';
import type { GridPulseApi } from '@/lib/gridpulse/api';

const CLUSTER_COORDS: Record<ClusterId, { x: number; y: number }> = {
  Ikeja: { x: 118, y: 42 },
  Yaba: { x: 152, y: 88 },
  Lekki: { x: 198, y: 118 },
  Surulere: { x: 128, y: 128 },
  Apapa: { x: 88, y: 148 },
  Ikorodu: { x: 168, y: 28 },
};

export { CLUSTER_COORDS };

function isoNow() {
  return new Date().toISOString();
}

function makeLithiumNode(
  nodeId: string,
  cluster: ClusterId,
  operatorId: string,
  lat: number,
  lng: number,
  gridAvailable: boolean,
  availableKwhEq: number,
): NodeState {
  const currentSource: PowerSource = gridAvailable ? 'GRID' : 'SOLAR_PV';
  return {
    schemaVersion: 'gridpulse.telemetry.v1',
    node: {
      nodeId,
      operatorId,
      assetClass: 'LITHIUM_SWAP',
      geo: { lat, lng, cluster },
      powerSource: {
        currentSource,
        gridAvailable,
        fallbackChain: ['GRID', 'SOLAR_PV', 'DIESEL_GENSET'],
      },
    },
    metrics: {
      lithium: {
        baysTotal: 12,
        baysCharged: gridAvailable ? 7 : 2,
        baysCharging: gridAvailable ? 3 : 1,
        baysFaulted: gridAvailable ? 0 : 1,
        packs: [
          { packId: `${nodeId}-P01`, soc: 94, sohPct: 97, cellTempC: 31, packVoltage: 72.4, cycleCount: 412, estReadyInMin: 0 },
          { packId: `${nodeId}-P02`, soc: 88, sohPct: 96, cellTempC: 33, packVoltage: 71.8, cycleCount: 388, estReadyInMin: 4 },
          { packId: `${nodeId}-P03`, soc: gridAvailable ? 76 : 18, sohPct: 95, cellTempC: 36, packVoltage: 70.2, cycleCount: 501, estReadyInMin: gridAvailable ? 12 : 45 },
        ],
      },
    },
    energyLedger: { deliveredKwhEq: 1240, cleanFractionPct: gridAvailable ? 62 : 88, settlementPending: gridAvailable ? 120 : 340 },
    availableKwhEq,
    health: { uptimePct: 99.4, lastFault: gridAvailable ? null : 'GRID_OUTAGE', firmwareVer: 'fw-li-2.4.1' },
    updatedAt: isoNow(),
  };
}

function makeHydrogenNode(
  nodeId: string,
  cluster: ClusterId,
  operatorId: string,
  lat: number,
  lng: number,
  availableKwhEq: number,
): NodeState {
  return {
    schemaVersion: 'gridpulse.telemetry.v1',
    node: {
      nodeId,
      operatorId,
      assetClass: 'HYDROGEN_HUB',
      geo: { lat, lng, cluster },
      powerSource: {
        currentSource: 'GRID',
        gridAvailable: true,
        fallbackChain: ['GRID', 'DIESEL_GENSET'],
      },
    },
    metrics: {
      hydrogen: {
        canistersTotal: 16,
        canistersFull: Math.round(availableKwhEq / 8),
        tankPressurePsi: 1180,
        flowRateGramPerMin: 42,
        purityPct: 99.2,
        tankTempC: 28,
        leakPpm: 4,
        compressorDutyCyclePct: 38,
      },
    },
    energyLedger: { deliveredKwhEq: 890, cleanFractionPct: 71, settlementPending: 85 },
    availableKwhEq,
    health: { uptimePct: 99.7, lastFault: null, firmwareVer: 'fw-h2-1.8.0' },
    updatedAt: isoNow(),
  };
}

const SEED_NODES: NodeState[] = [
  makeLithiumNode('GP-LAG-IKJ-014', 'Ikeja', 'OP-FRANCHISE-021', 6.6018, 3.3515, true, 48),
  makeHydrogenNode('GP-LAG-IKJ-022', 'Ikeja', 'OP-FRANCHISE-021', 6.5962, 3.3428, 96),
  makeLithiumNode('GP-LAG-YAB-003', 'Yaba', 'OP-FRANCHISE-008', 6.5244, 3.3792, false, 14),
  makeLithiumNode('GP-LAG-YAB-011', 'Yaba', 'OP-FRANCHISE-008', 6.5189, 3.3712, false, 11),
  makeHydrogenNode('GP-LAG-LEK-007', 'Lekki', 'OP-FRANCHISE-033', 6.4292, 3.5744, 112),
  makeLithiumNode('GP-LAG-LEK-019', 'Lekki', 'OP-FRANCHISE-033', 6.4355, 3.5612, true, 52),
  makeHydrogenNode('GP-LAG-SUR-005', 'Surulere', 'OP-FRANCHISE-012', 6.4969, 3.3648, 64),
  makeLithiumNode('GP-LAG-SUR-016', 'Surulere', 'OP-FRANCHISE-012', 6.5012, 3.3521, true, 38),
  makeLithiumNode('GP-LAG-APA-002', 'Apapa', 'OP-FRANCHISE-004', 6.4487, 3.3599, true, 44),
  makeHydrogenNode('GP-LAG-APA-009', 'Apapa', 'OP-FRANCHISE-004', 6.4412, 3.3688, 58),
  makeLithiumNode('GP-LAG-IKO-001', 'Ikorodu', 'OP-FRANCHISE-002', 6.5833, 3.5069, true, 36),
  makeHydrogenNode('GP-LAG-IKO-018', 'Ikorodu', 'OP-FRANCHISE-002', 6.5712, 3.5211, 72),
];

let nodes: NodeState[] = SEED_NODES.map((n) => ({ ...n, updatedAt: isoNow() }));
let settlements: SettlementIntent[] = [];
let cleanRecords: CleanEnergyRecord[] = [];
let failedCluster: ClusterId | null = null;

interface RunMeta {
  clusterId: ClusterId;
  startedAt: number;
  final: RebalanceState;
  applied: boolean;
}

const runs = new Map<string, RunMeta>();

const PHASE_MS = 700;

function buildClusters(): ClusterAvailability[] {
  return CLUSTERS.map((clusterId) => {
    const clusterNodes = nodes.filter((n) => n.node.geo.cluster === clusterId);
    const gridAvailable =
      failedCluster === clusterId
        ? false
        : clusterNodes.every((n) => n.node.powerSource.gridAvailable);
    const byChemistry = { LITHIUM_SWAP: 0, HYDROGEN_HUB: 0 };
    let availableKwhEq = 0;
    for (const n of clusterNodes) {
      availableKwhEq += n.availableKwhEq;
      byChemistry[n.node.assetClass] += n.availableKwhEq;
    }
    return {
      clusterId,
      gridAvailable,
      nodes: clusterNodes.length,
      availableKwhEq: Math.round(availableKwhEq),
      byChemistry: {
        LITHIUM_SWAP: Math.round(byChemistry.LITHIUM_SWAP),
        HYDROGEN_HUB: Math.round(byChemistry.HYDROGEN_HUB),
      },
    };
  });
}

function phaseAt(elapsed: number): GraphPhase {
  const idx = Math.min(Math.floor(elapsed / PHASE_MS), GRAPH_PHASES.length - 1);
  return GRAPH_PHASES[idx];
}

function buildFinalRebalance(clusterId: ClusterId, runId: string): RebalanceState {
  const lithiumNode = nodes.find(
    (n) => n.node.geo.cluster === clusterId && n.node.assetClass === 'LITHIUM_SWAP',
  )!;
  const hydrogenNode = nodes.find(
    (n) => n.node.geo.cluster === clusterId && n.node.assetClass === 'HYDROGEN_HUB',
  )!;

  const kwhEq = 25.2;
  const proofRef = `0xproof${runId.replace(/-/g, '').slice(0, 40)}`;

  const intent: SettlementIntent = {
    intentId: `INT-${runId.slice(0, 8)}`,
    payer: lithiumNode.node.operatorId,
    payee: hydrogenNode.node.operatorId,
    kwhEq,
    status: 'CLEARED',
    proofRef,
    clearedAt: isoNow(),
  };

  return {
    runId,
    trigger: {
      type: 'GRID_FAILURE',
      clusterId,
      detectedAt: isoNow(),
      confidence: 0.97,
    },
    graphPhase: 'DONE',
    context: {
      fleetAtRisk: [
        {
          fleetId: 'FLEET-OKADA-DUAL-44',
          vehicles: 14,
          avgRangeKmRemaining: 8,
          chemistry: 'LITHIUM',
        },
      ],
      candidateNodes: [
        {
          nodeId: lithiumNode.node.nodeId,
          assetClass: 'LITHIUM_SWAP',
          availableKwhEq: lithiumNode.availableKwhEq,
          etaMin: 4,
          loadPct: 92,
        },
        {
          nodeId: hydrogenNode.node.nodeId,
          assetClass: 'HYDROGEN_HUB',
          availableKwhEq: hydrogenNode.availableKwhEq,
          etaMin: 6,
          loadPct: 41,
        },
      ],
    },
    forecast: {
      depletionHorizonMin: 18,
      demandSpikeFactor: 1.34,
      model: 'gridpulse-forecast-v1',
    },
    decision: {
      reroutes: [
        {
          fleetId: 'FLEET-OKADA-DUAL-44',
          toNode: hydrogenNode.node.nodeId,
          units: 14,
          crossChemistry: true,
        },
      ],
      loadShifts: [{ nodeId: lithiumNode.node.nodeId, powerSource: 'SOLAR_PV' }],
      humanApprovalRequired: false,
    },
    settlement: { intents: [intent] },
    audit: {
      agent: 'gridpulse-balancer-langgraph',
      reasoningTrace: [
        `ASSESS: Grid failure detected in ${clusterId} cluster — lithium bays at critical SOC.`,
        'FORECAST: Depletion horizon 18 min; demand spike factor 1.34 on dual-power okada fleet.',
        'ALLOCATE: Chemistry-blind allocator selected H2 hub — 96 kWh-eq surplus vs 14 kWh-eq Li stress.',
        'REROUTE: 14 dual-power vehicles committed to GP hydrogen node; pure-BEV packs reserved.',
        'SETTLE: Cross-operator intent cleared against signed IoT hardware proof.',
      ],
      checkpoint: `DDB#REBAL#${runId.slice(0, 12)}`,
    },
  };
}

function applyRebalanceOutcome(final: RebalanceState) {
  const clusterId = final.trigger.clusterId as ClusterId;
  failedCluster = clusterId;

  nodes = nodes.map((n) => {
    if (n.node.geo.cluster !== clusterId) {
      return { ...n, updatedAt: isoNow() };
    }
    if (n.node.assetClass === 'LITHIUM_SWAP') {
      return {
        ...n,
        node: {
          ...n.node,
          powerSource: {
            ...n.node.powerSource,
            gridAvailable: false,
            currentSource: 'SOLAR_PV' as PowerSource,
          },
        },
        availableKwhEq: 14,
        updatedAt: isoNow(),
      };
    }
    return { ...n, availableKwhEq: Math.max(80, n.availableKwhEq - 25), updatedAt: isoNow() };
  });

  settlements = [final.settlement.intents[0], ...settlements];

  const h2Node = final.decision.reroutes[0]?.toNode ?? 'GP-LAG-IKJ-022';
  cleanRecords = [
    {
      recordId: `CER-${final.runId.slice(0, 8)}`,
      nodeId: h2Node,
      kwhEq: final.settlement.intents[0].kwhEq,
      cleanFractionPct: 88,
      source: 'SOLAR_PV',
      settledAt: isoNow(),
      proofRef: final.settlement.intents[0].proofRef!,
    },
    ...cleanRecords,
  ];
}

function rebalanceAt(run: RunMeta, elapsed: number): RebalanceState {
  const phase = phaseAt(elapsed);
  const final = run.final;
  const traceCount = Math.min(
    final.audit.reasoningTrace.length,
    Math.max(1, Math.floor(elapsed / PHASE_MS)),
  );

  const rerouted = phase === 'REROUTE' || phase === 'SETTLE' || phase === 'DONE';

  if (phase === 'DONE' && elapsed >= PHASE_MS * (GRAPH_PHASES.length - 1) && !run.applied) {
    run.applied = true;
    applyRebalanceOutcome(final);
  }

  return {
    ...final,
    graphPhase: phase,
    context: {
      ...final.context,
      fleetAtRisk: final.context.fleetAtRisk.map((f) => ({ ...f })),
    },
    settlement: {
      intents: final.settlement.intents.map((i) => {
        if (phase === 'DONE') {
          return { ...i, status: 'CLEARED' as const, proofRef: i.proofRef, clearedAt: i.clearedAt };
        }
        if (phase === 'SETTLE') {
          return { ...i, status: 'PROOF_VERIFIED' as const, proofRef: i.proofRef };
        }
        return { ...i, status: 'PENDING_PROOF' as const, proofRef: undefined, clearedAt: undefined };
      }),
    },
    audit: {
      ...final.audit,
      reasoningTrace: final.audit.reasoningTrace.slice(0, traceCount),
    },
    decision: {
      ...final.decision,
      reroutes: rerouted ? final.decision.reroutes : [],
    },
  };
}

export const mockApi: GridPulseApi = {
  async getClusterAvailability() {
    return buildClusters();
  },

  async listNodes() {
    return nodes.map((n) => ({ ...n, updatedAt: isoNow() }));
  },

  async getNode(nodeId: string) {
    const node = nodes.find((n) => n.node.nodeId === nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);
    return { ...node, updatedAt: isoNow() };
  },

  async triggerRebalance(clusterId: string) {
    const runId = crypto.randomUUID();
    const final = buildFinalRebalance(clusterId as ClusterId, runId);
    runs.set(runId, { clusterId: clusterId as ClusterId, startedAt: Date.now(), final, applied: false });
    failedCluster = clusterId as ClusterId;
    return { runId };
  },

  async getRebalance(runId: string) {
    const run = runs.get(runId);
    if (!run) throw new Error(`Run ${runId} not found`);
    const elapsed = Date.now() - run.startedAt;
    return rebalanceAt(run, elapsed);
  },

  async listSettlements() {
    if (settlements.length === 0) {
      return [
        {
          intentId: 'INT-SEED-001',
          payer: 'OP-FRANCHISE-008',
          payee: 'OP-FRANCHISE-033',
          kwhEq: 18.4,
          status: 'CLEARED',
          proofRef: '0xseedproof8f2a9c1d4e7b3a6f0c5d8e2a1b4c7d9',
          clearedAt: isoNow(),
        },
      ];
    }
    return settlements;
  },

  async getCleanEnergy() {
    if (cleanRecords.length === 0) {
      return [
        {
          recordId: 'CER-SEED-001',
          nodeId: 'GP-LAG-LEK-007',
          kwhEq: 12.5,
          cleanFractionPct: 74,
          source: 'GRID',
          settledAt: isoNow(),
          proofRef: '0xseedclean4a2f8c9d1e3b5a7c0d2e4f6a8b0c2d4',
        },
      ];
    }
    return cleanRecords;
  },

  async health() {
    return { ok: true, lastCheckpoint: isoNow() };
  },
};

export function resetMockDemo() {
  nodes = SEED_NODES.map((n) => ({ ...n, updatedAt: isoNow() }));
  settlements = [];
  cleanRecords = [];
  failedCluster = null;
  runs.clear();
}
