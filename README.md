# GridPulse Command Center

A premium enterprise AI infrastructure dashboard for next-generation power grid management.

## Quick Start

```bash
cd frontend
pnpm install
pnpm dev
```

Visit `http://localhost:3000` to view the dashboard.

## Project Structure

```
/frontend                    # Next.js frontend application (YOUR WORK FOLDER)
├── app/                     # Next.js app router
│   ├── page.tsx            # Main dashboard
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── layout/            # Dashboard layout, sidebar, header
│   ├── kpi/              # KPI metric cards
│   ├── charts/           # Energy forecast & distribution charts
│   ├── infrastructure/   # Map and AI terminal
│   ├── ledger/          # Settlement transaction table
│   └── monitoring/      # System monitoring metrics
├── lib/                  # Utilities and mock data
│   └── mockData.ts      # Mock data (replace with API calls)
├── public/              # Static assets
└── package.json         # Dependencies
```

## Features

- **Dashboard Overview** - Real-time grid metrics and KPIs
- **Energy Forecasting** - Demand forecast visualization
- **Infrastructure Map** - Lagos grid network visualization with live station status
- **AI Agent Terminal** - Real-time system operations log
- **Settlement Ledger** - Transaction history and payments
- **Performance Analytics** - Top provider rankings
- **System Monitoring** - Real-time grid parameters

## Technology Stack

- **Next.js 16** - React framework
- **TailwindCSS** - Styling
- **Recharts** - Data visualization
- **Framer Motion** - Animations
- **shadcn/ui** - Component library
- **Lucide Icons** - Icons
- **TypeScript** - Type safety

## Backend Integration

See **[BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)** for detailed instructions on connecting your backend API.

### Quick API Setup

1. Create `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

2. Update components to use `apiClient` from `frontend/lib/api.ts`

3. Replace mock data with API endpoints

## Development

### Start Development Server
```bash
cd frontend
pnpm dev
```

### Build for Production
```bash
cd frontend
pnpm build
pnpm start
```

### Type Checking
```bash
cd frontend
pnpm tsc --noEmit
```

## Component Documentation

### KPI Cards
Display key metrics with trend indicators. Located in `components/kpi/`

### Charts
- **EnergyForecastChart** - Line chart for energy demand predictions
- **DistributionChart** - Bar chart for regional distribution

### Infrastructure
- **InfrastructureMap** - Interactive map with station markers
- **AIAgentTerminal** - Scrollable terminal log with color-coded messages

### Monitoring
- **MonitoringMetrics** - Grid parameters display
- **TopPerformers** - Provider performance cards
- **SettlementLedger** - Transaction history table

## Styling

Global styles use TailwindCSS v4 with semantic design tokens defined in `app/globals.css`. Color theme:
- Primary: Purple (`#7c3aed`)
- Secondary: Blue (`#3b82f6`)
- Accent: Green (`#10b981`)
- Neutral: Gray scale

## Mock Data

Current implementation uses mock data from `lib/mockData.ts`. This can be:
- **Kept for development** without backend
- **Removed** when backend is ready
- **Used as fallback** for error handling

## Notes

- All work is in the `/frontend` folder
- This is a frontend-only implementation
- Backend integration points are clearly marked with comments
- Mock data can be swapped 1:1 with API responses
- No server-side rendering logic yet

---

For backend integration questions, see [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)
