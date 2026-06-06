/**
 * API Integration Template
 * 
 * This file demonstrates how to connect the frontend to your backend API.
 * Copy this to `frontend/lib/api.ts` and update the endpoints.
 * 
 * CURRENT STATE: All components use mock data from mockData.ts
 * GOAL: Replace with real API calls below
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper function for API calls with error handling
async function apiCall<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}

/**
 * API Client for GridPulse Backend
 * 
 * All methods should return data in the same format as mockData.ts
 * so components can work without changes.
 */
export const apiClient = {
  // ============== METRICS & KPI ==============
  /**
   * Get KPI metrics
   * @returns KPI data with revenue, stations, requests, uptime
   */
  getKPIMetrics: async () => {
    // TODO: Replace with actual endpoint
    return apiCall<{
      totalRevenue: number;
      revenueChange: number;
      activeStations: number;
      stationChange: number;
      apiRequests: number;
      requestChange: number;
      systemUptime: number;
      uptimeChange: number;
    }>('/api/metrics/kpi');
  },

  // ============== ENERGY & DISTRIBUTION ==============
  /**
   * Get energy demand forecast data
   * @returns Array of forecast data points
   */
  getEnergyForecast: async () => {
    // TODO: Replace with actual endpoint
    return apiCall<{
      data: Array<{
        time: string;
        forecast: number;
        actual: number;
      }>;
    }>('/api/energy/forecast');
  },

  /**
   * Get area distribution data
   * @returns Array of distribution by region
   */
  getDistributionData: async () => {
    // TODO: Replace with actual endpoint
    return apiCall<{
      data: Array<{
        name: string;
        value: number;
      }>;
    }>('/api/distribution');
  },

  // ============== INFRASTRUCTURE ==============
  /**
   * Get infrastructure stations
   * @returns Array of station data with coordinates and status
   */
  getStations: async () => {
    // TODO: Replace with actual endpoint
    return apiCall<{
      stations: Array<{
        id: number;
        name: string;
        lat: number;
        lng: number;
        status: 'active' | 'maintenance' | 'inactive';
        load: number;
      }>;
    }>('/api/infrastructure/stations');
  },

  // ============== OPERATIONS & LOGS ==============
  /**
   * Get terminal operation logs
   * @returns Array of system operation logs
   */
  getTerminalLogs: async () => {
    // TODO: Replace with actual endpoint
    return apiCall<{
      logs: Array<{
        timestamp: string;
        message: string;
        type: 'success' | 'warning' | 'info' | 'error';
      }>;
    }>('/api/logs/terminal');
  },

  // ============== SETTLEMENTS ==============
  /**
   * Get settlement ledger transactions
   * @returns Array of settlement transactions
   */
  getSettlements: async () => {
    // TODO: Replace with actual endpoint
    return apiCall<{
      settlements: Array<{
        id: number;
        provider: string;
        amount: number;
        date: string;
        status: 'completed' | 'pending' | 'processing';
        reference: string;
      }>;
    }>('/api/settlements');
  },

  // ============== PERFORMANCE ==============
  /**
   * Get top performing providers
   * @returns Array of top performers with scores
   */
  getTopPerformers: async () => {
    // TODO: Replace with actual endpoint
    return apiCall<{
      performers: Array<{
        id: number;
        name: string;
        uptime: number;
        requests: number;
        score: number;
        rank: number;
      }>;
    }>('/api/performers/top');
  },

  // ============== MONITORING ==============
  /**
   * Get system monitoring metrics
   * @returns Current grid monitoring parameters
   */
  getMonitoringMetrics: async () => {
    // TODO: Replace with actual endpoint
    return apiCall<{
      frequency: number;
      voltage: number;
      reactivepower: number;
      transmissionloss: number;
      demandresponse: number;
    }>('/api/monitoring/metrics');
  },
};

/**
 * INTEGRATION CHECKLIST
 * 
 * 1. [ ] Create this file at `frontend/lib/api.ts`
 * 2. [ ] Add NEXT_PUBLIC_API_URL to `frontend/.env.local`
 * 3. [ ] Update endpoint URLs to match your backend
 * 4. [ ] Update component imports from mockData to apiClient
 * 5. [ ] Add useEffect hooks to fetch data
 * 6. [ ] Add loading and error states
 * 7. [ ] Test each component with real data
 * 8. [ ] Add error boundaries for fault tolerance
 * 
 * EXAMPLE: Updating a component
 * 
 * Before (with mock data):
 * ```
 * import { getKPIMetrics } from '@/lib/mockData';
 * 
 * export function KPISection() {
 *   const metrics = getKPIMetrics();
 *   return <div>{metrics.totalRevenue}</div>;
 * }
 * ```
 * 
 * After (with API):
 * ```
 * import { apiClient } from '@/lib/api';
 * import { useState, useEffect } from 'react';
 * 
 * export function KPISection() {
 *   const [metrics, setMetrics] = useState(null);
 *   const [loading, setLoading] = useState(true);
 * 
 *   useEffect(() => {
 *     apiClient.getKPIMetrics()
 *       .then(setMetrics)
 *       .catch(error => console.error('Failed to load metrics:', error))
 *       .finally(() => setLoading(false));
 *   }, []);
 * 
 *   if (loading) return <div>Loading...</div>;
 *   if (!metrics) return <div>Error loading metrics</div>;
 * 
 *   return <div>{metrics.totalRevenue}</div>;
 * }
 * ```
 */
