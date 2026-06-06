# GridPulse Frontend - Project Overview

## 📁 Project Structure

```
gridpulse-frontend/
├── frontend/                           # ← YOUR WORKING FOLDER (Next.js Frontend)
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with metadata
│   │   ├── page.tsx                   # Main dashboard page
│   │   └── globals.css                # Global styles with design tokens
│   ├── components/
│   │   ├── layout/                    # Layout & Navigation
│   │   │   ├── DashboardLayout.tsx    # Main wrapper
│   │   │   ├── Sidebar.tsx            # Left navigation
│   │   │   └── TopHeader.tsx          # Top navigation bar
│   │   ├── kpi/                       # KPI Cards
│   │   │   ├── KPICard.tsx            # Single card
│   │   │   └── KPISection.tsx         # Grid of 4 cards
│   │   ├── charts/                    # Charts & Visualizations
│   │   │   ├── EnergyForecastChart.tsx
│   │   │   └── DistributionChart.tsx
│   │   ├── infrastructure/            # Infrastructure & Operations
│   │   │   ├── InfrastructureMap.tsx  # Interactive map
│   │   │   └── AIAgentTerminal.tsx    # Terminal logs
│   │   ├── ledger/                    # Transactions
│   │   │   └── SettlementLedger.tsx
│   │   ├── monitoring/                # System Metrics
│   │   │   ├── MonitoringMetrics.tsx
│   │   │   └── TopPerformers.tsx
│   │   └── ui/                        # shadcn components
│   │       └── button.tsx
│   ├── lib/
│   │   ├── mockData.ts                # Mock data (replace with API)
│   │   ├── api.example.ts             # API integration template
│   │   └── utils.ts                   # Utility functions
│   ├── public/                        # Static assets
│   ├── package.json                   # Dependencies
│   ├── tsconfig.json                  # TypeScript config
│   └── next.config.mjs                # Next.js config
│
├── README.md                          # Quick start guide
├── BACKEND_INTEGRATION.md             # Backend integration guide
├── COMPONENTS.md                      # Component architecture
└── PROJECT_STRUCTURE.md               # This file

```

## 🚀 Quick Start

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open browser
http://localhost:3000
```

## 📚 Documentation Files

### README.md
- Quick start instructions
- Technology stack overview
- Project structure
- Basic development commands

### BACKEND_INTEGRATION.md
- Step-by-step backend integration guide
- API endpoint specifications
- Environment variable setup
- Code examples for each component
- **START HERE** when ready to connect backend

### COMPONENTS.md
- Detailed component architecture
- Data structure for each component
- Props documentation
- How to modify components
- Common tasks guide

### api.example.ts
- Ready-to-use API client template
- All backend endpoints documented
- Integration checklist
- Before/after code examples

## 🎨 Design System

**Colors:**
- Primary Purple: `#7c3aed`
- Secondary Blue: `#3b82f6`
- Accent Green: `#10b981`
- Neutral Grays: `#f8fafc` to `#1e293b`

**Typography:**
- Headings: Bold, 24px-36px
- Body: Regular, 14px-16px
- Line height: 1.4-1.6

**Layout:**
- Sidebar: 280px (fixed left)
- Header: 64px (fixed top)
- Grid gaps: 32px (desktop), 16px (mobile)
- Card padding: 24px

## 🔄 Frontend-Backend Integration

**Current State:** Frontend-only with mock data

**When Backend is Ready:**
1. Create `frontend/.env.local` with `NEXT_PUBLIC_API_URL`
2. Replace mock data imports with `apiClient` from `lib/api.ts`
3. Add `useEffect` hooks to fetch data
4. Update components with loading/error states
5. Deploy with backend URL

See **BACKEND_INTEGRATION.md** for detailed steps.

## 📊 Dashboard Components

### Top Section
- **KPI Cards**: Revenue, Stations, Requests, Uptime
- Real-time metrics with growth indicators

### Middle Section
- **Energy Forecast Chart**: Demand prediction vs actual
- **Area Distribution Chart**: Load by region

### Lower Section
- **Infrastructure Map**: Live station visualization
- **AI Agent Terminal**: Operation logs

### Bottom Section
- **Settlement Ledger**: Transaction history
- **Top Performers**: Provider rankings
- **Monitoring Metrics**: Grid parameters

## 🛠️ Technology Stack

- **Next.js 16**: Full-stack React framework
- **React 19**: UI library
- **TailwindCSS v4**: Styling framework
- **TypeScript**: Type safety
- **Recharts**: Data visualization
- **Framer Motion**: Animations
- **Lucide Icons**: Icon library
- **shadcn/ui**: Component library

## 📋 Current Features

✅ Beautiful dashboard layout with sidebar  
✅ Responsive design (mobile, tablet, desktop)  
✅ 4 KPI metric cards with trends  
✅ Energy demand forecast chart  
✅ Area distribution chart  
✅ Interactive infrastructure map  
✅ AI agent terminal logs  
✅ Settlement transaction ledger  
✅ Top performers ranking  
✅ System monitoring metrics  
✅ Smooth animations  
✅ Professional color scheme  
✅ Semantic HTML + Accessibility  

## ⚙️ Configuration

### Environment Variables

**Development (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Production:**
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

### Build & Deploy

```bash
# Build for production
cd frontend
pnpm build

# Start production server
pnpm start

# Deploy to Vercel
# Push to GitHub and connect repository in Vercel dashboard
```

## 🔍 Mock Data Location

All mock data is in `frontend/lib/mockData.ts`:
- KPI metrics
- Energy forecast data
- Infrastructure stations
- Terminal operation logs
- Settlement transactions
- Performance metrics

**To use real data:**
1. Create API client in `frontend/lib/api.ts`
2. Replace `import { getKPIMetrics } from mockData` 
3. With `import { apiClient } from api`
4. Call `apiClient.getKPIMetrics()` instead

## 📖 Common Tasks

### Add a New Metric to Dashboard
1. Add data to `mockData.getKPIMetrics()`
2. Add `<KPICard>` component to `KPISection.tsx`
3. Pass data via props

### Update Colors
1. Edit color tokens in `frontend/app/globals.css`
2. Use Tailwind utility classes in components
3. No need to update individual components

### Modify Chart Data
1. Update `mockData.getEnergyForecast()` or similar
2. Component automatically re-renders
3. Check Recharts docs for chart customization

### Add API Integration
1. Copy `frontend/lib/api.example.ts` to `frontend/lib/api.ts`
2. Update endpoint URLs
3. Replace mock data imports with API calls
4. Add loading and error states

## 🎯 Next Steps

1. **Review** the dashboard at `http://localhost:3000`
2. **Explore** components in `frontend/components/`
3. **Read** BACKEND_INTEGRATION.md when backend is ready
4. **Replace** mock data with real API calls
5. **Deploy** to production

## 📞 Support

- **Component Questions**: See COMPONENTS.md
- **Backend Integration**: See BACKEND_INTEGRATION.md  
- **Styling Changes**: Check Tailwind docs (tailwindcss.com)
- **Recharts**: recharts.org
- **Next.js**: nextjs.org

---

**Project Status**: ✅ Frontend Complete & Ready for Backend Integration

**All work is in the `/frontend` folder.**

**Frontend is fully functional with mock data that can be easily replaced with real API calls.**
