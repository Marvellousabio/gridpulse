# GridPulse Frontend - Backend Integration Guide

This document outlines how to connect the GridPulse Command Center frontend to your backend API.

## Project Structure

```
/frontend                    # Next.js frontend application
├── app/                     # Next.js app directory
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── layout/            # Layout components (Sidebar, TopHeader, DashboardLayout)
│   ├── kpi/              # KPI cards and sections
│   ├── charts/           # Data visualization charts
│   ├── infrastructure/   # Map and terminal components
│   ├── ledger/          # Settlement ledger table
│   └── monitoring/      # Monitoring metrics components
├── lib/                  # Utilities
│   └── mockData.ts      # Mock data (REPLACE WITH API CALLS)
├── public/              # Static assets
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript config
```

## Current Frontend State

The frontend is fully functional with **mock data**. All components are built to accept props and display data dynamically.

### Key Files with Mock Data

1. **`lib/mockData.ts`** - Contains all mock data generators:
   - KPI metrics (revenue, stations, requests, uptime)
   - Energy forecast data
   - Infrastructure stations and map data
   - Terminal logs
   - Settlement transactions
   - Performance metrics

2. **`app/page.tsx`** - Main dashboard that imports mock data

## Backend Integration Steps

### Step 1: Create API Service Layer

Create a new file `frontend/lib/api.ts` to handle backend communication:

```typescript
// frontend/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const apiClient = {
  // KPI Metrics
  getKPIMetrics: async () => {
    const res = await fetch(`${API_BASE_URL}/api/metrics/kpi`);
    return res.json();
  },

  // Energy Forecast
  getEnergyForecast: async () => {
    const res = await fetch(`${API_BASE_URL}/api/energy/forecast`);
    return res.json();
  },

  // Distribution Data
  getDistributionData: async () => {
    const res = await fetch(`${API_BASE_URL}/api/distribution`);
    return res.json();
  },

  // Infrastructure Stations
  getStations: async () => {
    const res = await fetch(`${API_BASE_URL}/api/infrastructure/stations`);
    return res.json();
  },

  // Terminal Logs
  getTerminalLogs: async () => {
    const res = await fetch(`${API_BASE_URL}/api/logs/terminal`);
    return res.json();
  },

  // Settlement Ledger
  getSettlements: async () => {
    const res = await fetch(`${API_BASE_URL}/api/settlements`);
    return res.json();
  },

  // Top Performers
  getTopPerformers: async () => {
    const res = await fetch(`${API_BASE_URL}/api/performers/top`);
    return res.json();
  },

  // Monitoring Metrics
  getMonitoringMetrics: async () => {
    const res = await fetch(`${API_BASE_URL}/api/monitoring/metrics`);
    return res.json();
  },
};
```

### Step 2: Set Environment Variables

Create `.env.local` in the `frontend` folder:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000
# OR for production
# NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

### Step 3: Update Components to Use API

Replace mock data with API calls. Example for the main page:

```typescript
// frontend/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

export default function Page() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const metrics = await apiClient.getKPIMetrics();
        const forecast = await apiClient.getEnergyForecast();
        // ... fetch other data
        setData({ metrics, forecast });
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    // ... render with data
  );
}
```

### Step 4: Update Individual Components

Example - Update KPISection to fetch data:

```typescript
// frontend/components/kpi/KPISection.tsx
'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { KPICard } from './KPICard';

export function KPISection() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    apiClient.getKPIMetrics().then(setMetrics);
  }, []);

  if (!metrics) return <div>Loading metrics...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KPICard
        title="Total Revenue"
        value={`$${metrics.totalRevenue.toLocaleString()}`}
        change={metrics.revenueChange}
        icon="DollarSign"
      />
      {/* ... other cards */}
    </div>
  );
}
```

## API Endpoint Requirements

Your backend should provide these endpoints:

### Metrics & KPI
- **GET** `/api/metrics/kpi` - Returns KPI metrics
  ```json
  {
    "totalRevenue": 2850000,
    "revenueChange": 2.5,
    "activeStations": 2847,
    "stationChange": 1.2,
    "apiRequests": 1200000,
    "requestChange": 3.8,
    "systemUptime": 99.87,
    "uptimeChange": 0.3
  }
  ```

### Energy & Distribution
- **GET** `/api/energy/forecast` - Energy demand forecast data
  ```json
  {
    "data": [
      { "time": "00:00", "forecast": 2100, "actual": 2050 },
      ...
    ]
  }
  ```

- **GET** `/api/distribution` - Distribution chart data
  ```json
  {
    "data": [
      { "name": "North", "value": 35 },
      { "name": "South", "value": 28 },
      ...
    ]
  }
  ```

### Infrastructure
- **GET** `/api/infrastructure/stations` - Station data with coordinates
  ```json
  {
    "stations": [
      { "id": 1, "name": "Lagos North", "lat": 6.5244, "lng": 3.3792, "status": "active", "load": 85 },
      ...
    ]
  }
  ```

### Operations
- **GET** `/api/logs/terminal` - Terminal operation logs
  ```json
  {
    "logs": [
      { "timestamp": "2026-03-01T12:00:00Z", "message": "Grid frequency optimized", "type": "success" },
      ...
    ]
  }
  ```

- **GET** `/api/settlements` - Settlement ledger
  ```json
  {
    "settlements": [
      { "id": 1, "provider": "Provider Name", "amount": 150000, "date": "2026-03-01", "status": "completed" },
      ...
    ]
  }
  ```

- **GET** `/api/performers/top` - Top performing providers
  ```json
  {
    "performers": [
      { "id": 1, "name": "Provider A", "uptime": 99.9, "requests": 450000, "score": 9.8 },
      ...
    ]
  }
  ```

- **GET** `/api/monitoring/metrics` - System monitoring data
  ```json
  {
    "frequency": 50.02,
    "voltage": 230.5,
    "reactivepower": 125,
    "transmissionloss": 2.3,
    "demandresponse": 98
  }
  ```

## Development Workflow

1. **Start Frontend:**
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```

2. **Connect to Backend:**
   - Update `NEXT_PUBLIC_API_URL` in `.env.local`
   - Replace mock data calls with API calls
   - Test endpoints

3. **Error Handling:**
   Add proper error handling and loading states in components

## Useful Frontend Libraries Already Installed

- **React** - UI library
- **Next.js 16** - Full-stack framework
- **TailwindCSS** - Styling
- **shadcn/ui** - Component library
- **Recharts** - Data visualization
- **Framer Motion** - Animations
- **Lucide Icons** - Icon library

## Mock Data Location

All mock data is currently in `frontend/lib/mockData.ts`. This file can be:
- **Kept for development** - Use for local testing without backend
- **Removed when backend is ready** - Replace all imports with API calls
- **Used for fallback** - Implement as error handling

## Notes

- Frontend is fully functional and styled
- All components accept data as props
- No hardcoded values in components
- Mock data can be swapped 1:1 with API responses
- All data flows through the main `page.tsx` component
- Environment variables are used for API URL configuration

---

For questions about integrating specific components, refer to the component files in `frontend/components/`.
