# GridPulse Frontend - Component Architecture

This document describes the structure and data flow of all components in the GridPulse dashboard.

## Component Organization

```
frontend/components/
├── layout/              # Layout & Navigation
│   ├── DashboardLayout.tsx    # Main wrapper with sidebar + header + content
│   ├── Sidebar.tsx            # Left navigation sidebar
│   └── TopHeader.tsx          # Top header with search, notifications, user
├── kpi/                 # Key Performance Indicators
│   ├── KPICard.tsx            # Single metric card
│   └── KPISection.tsx         # Grid of 4 KPI cards
├── charts/              # Data Visualizations
│   ├── EnergyForecastChart.tsx # Line chart - Energy demand forecast
│   └── DistributionChart.tsx    # Bar chart - Area distribution
├── infrastructure/      # Infrastructure & Operations
│   ├── InfrastructureMap.tsx    # Interactive map with stations
│   └── AIAgentTerminal.tsx      # Terminal-style operation logs
├── ledger/              # Transactions
│   └── SettlementLedger.tsx     # Transaction history table
└── monitoring/          # System Metrics
    ├── MonitoringMetrics.tsx    # Grid parameters display
    └── TopPerformers.tsx        # Provider rankings with stars
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    app/page.tsx                          │
│        Main Dashboard (Client Component)                 │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   Fetches from   Uses in JSX    Passes props
   mockData.ts    rendering      to children
        │              │              │
        ▼              ▼              ▼
   ┌─────────┐  ┌──────────┐  ┌─────────────┐
   │KPIData  │  │EnergyData│  │AllComponents│
   │Terminal │  │Stations  │  │As Children  │
   │Ledger   │  │etc       │  │             │
   └─────────┘  └──────────┘  └─────────────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
              Components Render
              with Data Props
```

## Component Details

### Layout Components

#### DashboardLayout.tsx
- **Purpose**: Main layout wrapper
- **Props**: `children: React.ReactNode`
- **Structure**: Sidebar (left) + TopHeader (top) + main content area
- **Styling**: Grid layout with fixed sidebar

#### Sidebar.tsx
- **Purpose**: Left navigation menu
- **Links**: Dashboard, Infrastructure, Transactions, Partners, Scheduler, Analytics, Settings, Help
- **Logo**: GridPulse branding

#### TopHeader.tsx
- **Purpose**: Top navigation bar
- **Features**: Search bar, system status, notifications, user profile
- **Responsive**: Collapses on mobile

### KPI Components

#### KPICard.tsx
- **Purpose**: Single metric display card
- **Props**:
  ```typescript
  {
    title: string;           // "Total Revenue"
    value: string | number;  // "$2.85M"
    change: number;          // 12.5 (percentage)
    icon: string;            // Icon name from Lucide
  }
  ```
- **Display**: Icon + Title + Value + Growth indicator

#### KPISection.tsx
- **Purpose**: Grid of 4 KPI cards
- **Data Source**: mockData.getKPIMetrics()
- **Components**: 4x KPICard components
- **Layout**: Responsive grid (1 col mobile, 4 cols desktop)

### Chart Components

#### EnergyForecastChart.tsx
- **Purpose**: Energy demand visualization
- **Chart Type**: Line chart (Recharts)
- **Data Format**:
  ```json
  {
    "time": "00:00",
    "forecast": 2100,
    "actual": 2050
  }
  ```
- **Legend**: Blue (Forecast), Orange (Actual)
- **Interaction**: Hover for tooltips

#### DistributionChart.tsx
- **Purpose**: Area load distribution
- **Chart Type**: Bar chart (Recharts)
- **Data Format**:
  ```json
  {
    "name": "North",
    "value": 35
  }
  ```
- **Colors**: Purple bars for major regions

### Infrastructure Components

#### InfrastructureMap.tsx
- **Purpose**: Interactive grid network map
- **Features**:
  - SVG canvas-based visualization
  - Animated station nodes with pulse effects
  - Status-based coloring (active=green, maintenance=yellow, inactive=gray)
  - Hover tooltips showing station details
- **Data Format**:
  ```typescript
  {
    id: number;
    name: string;
    lat: number;
    lng: number;
    status: 'active' | 'maintenance' | 'inactive';
    load: number; // 0-100
  }
  ```
- **Interaction**: Hover for details, list below shows all stations

#### AIAgentTerminal.tsx
- **Purpose**: Real-time operation logs display
- **Style**: Terminal-like black background with colored text
- **Message Types**: success (green), warning (yellow), info (blue), error (red)
- **Animation**: Scrolling terminal effect, blinking cursor
- **Data Format**:
  ```typescript
  {
    timestamp: string;
    message: string;
    type: 'success' | 'warning' | 'info' | 'error';
  }
  ```

### Transaction Components

#### SettlementLedger.tsx
- **Purpose**: Transaction history table
- **Display**: Provider, Amount, Date, Status, Reference
- **Status Badges**: Completed (green), Pending (yellow), Processing (blue)
- **Features**: Scrollable, sortable columns
- **Data Format**:
  ```typescript
  {
    id: number;
    provider: string;
    amount: number;
    date: string;
    status: 'completed' | 'pending' | 'processing';
    reference: string;
  }
  ```

### Monitoring Components

#### MonitoringMetrics.tsx
- **Purpose**: Real-time grid parameters
- **Metrics**: Frequency, Voltage, Reactive Power, Transmission Loss, Demand Response
- **Display**: Labeled values with threshold indicators
- **Data Format**:
  ```typescript
  {
    frequency: number;        // Hz
    voltage: number;          // V
    reactivepower: number;    // VAR
    transmissionloss: number; // %
    demandresponse: number;   // %
  }
  ```

#### TopPerformers.tsx
- **Purpose**: Provider performance rankings
- **Display**: Provider name, uptime, request count, score (/10)
- **Stars**: ⭐ badge for top 3 performers
- **Ranking**: Displayed with rank number (1st, 2nd, 3rd)
- **Data Format**:
  ```typescript
  {
    id: number;
    name: string;
    uptime: number;    // %
    requests: number;  // Count
    score: number;     // 0-10
    rank: number;      // 1, 2, 3, etc
  }
  ```

## State Management

Currently using:
- **React useState**: For component-level data in client components
- **Mock Data**: All fetched from `lib/mockData.ts`
- **Props Drilling**: Data passed down through component tree

### Future: API Integration

When connecting to backend:
1. Fetch in main `page.tsx` component
2. Pass data to child components as props
3. Use `useEffect` hooks for data fetching
4. Add loading and error states

## Styling System

- **Tailwind CSS v4**: All styling is utility-based
- **Color Tokens**: Defined in `app/globals.css`
  - Primary: Purple (`#7c3aed`)
  - Secondary: Blue (`#3b82f6`)
  - Accent: Green (`#10b981`)
  - Neutral: Gray scale
- **Component Variants**: Using Tailwind classes, no CSS modules
- **Responsive**: Mobile-first design with `md:` and `lg:` breakpoints

## Dependencies

- **react**: UI library
- **next**: Framework
- **recharts**: Data visualization
- **framer-motion**: Animations
- **lucide-react**: Icon library
- **tailwindcss**: Styling

## Common Tasks

### Adding a New KPI Card
1. Add data to `mockData.getKPIMetrics()`
2. Add `<KPICard>` to `KPISection.tsx`
3. Pass data via props

### Adding a New Chart
1. Create component in `components/charts/`
2. Use Recharts for visualization
3. Import and add to main page
4. Update mockData with chart data

### Updating Infrastructure Map
1. Modify station coordinates in `mockData.getStations()`
2. Update status or load values
3. Component will re-render with new data

### Adding Error Handling
Wrap component in try-catch and show error state:
```typescript
try {
  const data = await apiClient.getData();
  setData(data);
} catch (error) {
  setError(error.message);
}

if (error) return <div className="text-red-500">{error}</div>;
```

## Performance Considerations

- Components are memoized where appropriate
- Charts have limited data points to prevent lag
- Map uses SVG for fast rendering
- Terminal logs limit displayed entries
- Images are optimized PNGs

---

For backend integration, see **[BACKEND_INTEGRATION.md](../BACKEND_INTEGRATION.md)**
