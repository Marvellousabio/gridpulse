// Mock data generators for GridPulse Dashboard

export const generateKPIData = () => ({
  totalRevenue: 2847500,
  revenueGrowth: 12.5,
  previousRevenue: 2524600,
  activeStations: 2847,
  stationGrowth: 8.3,
  previousStations: 2625,
  apiRequests: 1247893,
  requestGrowth: 23.7,
  previousRequests: 1009000,
  systemUptime: 99.87,
  uptimeGrowth: 0.12,
  previousUptime: 99.75,
});

export const generateEnergyForecastData = () => [
  { month: 'Jan', demand: 28, actual: 26.5 },
  { month: 'Feb', demand: 30, actual: 28.2 },
  { month: 'Mar', demand: 32, actual: 31.8 },
  { month: 'Apr', demand: 35, actual: 34.5 },
  { month: 'May', demand: 38, actual: 37.2 },
  { month: 'Jun', demand: 42, actual: 41.8 },
  { month: 'Jul', demand: 45, actual: 44.3 },
  { month: 'Aug', demand: 46, actual: 45.7 },
  { month: 'Sep', demand: 44, actual: 43.5 },
  { month: 'Oct', demand: 40, actual: 39.8 },
  { month: 'Nov', demand: 35, actual: 34.2 },
  { month: 'Dec', demand: 32, actual: 31.5 },
];

export const generateDistributionData = () => [
  { name: 'Mainland', value: 35, fill: '#8B5CF6' },
  { name: 'Lagos Island', value: 28, fill: '#3B82F6' },
  { name: 'Ikoyi', value: 19, fill: '#10B981' },
  { name: 'Surulere', value: 18, fill: '#F59E0B' },
];

export const generateMapStations = () => [
  { id: 1, name: 'Central Station', lat: 6.5244, lng: 3.3792, status: 'active', load: 87 },
  { id: 2, name: 'Victoria Island', lat: 6.4274, lng: 3.4257, status: 'active', load: 92 },
  { id: 3, name: 'Surulere Hub', lat: 6.4969, lng: 3.3648, status: 'maintenance', load: 45 },
  { id: 4, name: 'Ikeja District', lat: 6.5901, lng: 3.3373, status: 'active', load: 78 },
  { id: 5, name: 'Lekki Node', lat: 6.4292, lng: 3.5744, status: 'active', load: 65 },
  { id: 6, name: 'Badagry Sub', lat: 6.4167, lng: 2.8917, status: 'inactive', load: 0 },
  { id: 7, name: 'Epe Terminal', lat: 6.5833, lng: 3.9667, status: 'active', load: 55 },
];

export const generateTerminalLogs = () => [
  { id: 1, timestamp: '2026-03-01 14:32:18', message: 'Grid synchronization complete across 2,847 nodes', type: 'success' },
  { id: 2, timestamp: '2026-03-01 14:28:45', message: 'Load balancing optimized: 12% efficiency gain', type: 'success' },
  { id: 3, timestamp: '2026-03-01 14:24:22', message: 'Predictive maintenance scheduled for Station 3 (Surulere)', type: 'warning' },
  { id: 4, timestamp: '2026-03-01 14:19:08', message: 'Renewable energy integration: 34% of total grid load', type: 'info' },
  { id: 5, timestamp: '2026-03-01 14:14:33', message: 'API gateway processed 1.2M requests in last hour', type: 'success' },
  { id: 6, timestamp: '2026-03-01 14:09:15', message: 'Security audit passed: 0 critical vulnerabilities detected', type: 'success' },
  { id: 7, timestamp: '2026-03-01 14:03:42', message: 'Demand forecast updated: Peak load expected 18:30-19:45', type: 'info' },
  { id: 8, timestamp: '2026-03-01 13:58:19', message: 'Grid stability index: 9.8/10 (Excellent)', type: 'success' },
];

export const generateSettlementData = () => [
  { id: '1', date: '2026-02-28', amount: 245000, status: 'completed', provider: 'PowerCorp Solutions', reference: 'TXN-2026-0892' },
  { id: '2', date: '2026-02-27', amount: 189500, status: 'completed', provider: 'Grid Tech Africa', reference: 'TXN-2026-0891' },
  { id: '3', date: '2026-02-26', amount: 156750, status: 'pending', provider: 'Renewable Energy Ltd', reference: 'TXN-2026-0890' },
  { id: '4', date: '2026-02-25', amount: 312000, status: 'completed', provider: 'Energy Distribution Co', reference: 'TXN-2026-0889' },
  { id: '5', date: '2026-02-24', amount: 98250, status: 'completed', provider: 'Smart Grid Systems', reference: 'TXN-2026-0888' },
  { id: '6', date: '2026-02-23', amount: 221875, status: 'processing', provider: 'Sustainable Power Inc', reference: 'TXN-2026-0887' },
];

export const generateMonitoringMetrics = () => [
  { id: 1, metric: 'Grid Frequency', value: 49.98, unit: 'Hz', status: 'normal', threshold: '49.5-50.5' },
  { id: 2, metric: 'System Voltage', value: 233.2, unit: 'V', status: 'normal', threshold: '220-240' },
  { id: 3, metric: 'Reactive Power', value: 1247, unit: 'MVAR', status: 'warning', threshold: '< 1500' },
  { id: 4, metric: 'Transmission Loss', value: 8.4, unit: '%', status: 'normal', threshold: '< 10' },
  { id: 5, metric: 'Demand Response', value: 156, unit: 'MW', status: 'normal', threshold: '> 100' },
];

export const generateTopPerformers = () => [
  { rank: 1, provider: 'PowerCorp Solutions', score: 9.8, uptime: '99.94%', requests: '284,520' },
  { rank: 2, provider: 'Grid Tech Africa', score: 9.6, uptime: '99.87%', requests: '178,340' },
  { rank: 3, provider: 'Renewable Energy Ltd', score: 9.4, uptime: '99.72%', requests: '156,890' },
  { rank: 4, provider: 'Energy Distribution Co', score: 9.2, uptime: '99.65%', requests: '142,560' },
  { rank: 5, provider: 'Smart Grid Systems', score: 9.1, uptime: '99.58%', requests: '128,340' },
];
