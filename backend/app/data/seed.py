"""Seed data aligned with frontend mockData.ts shapes."""

KPI_DATA = {
    "totalRevenue": 2847500,
    "revenueGrowth": 12.5,
    "previousRevenue": 2524600,
    "activeStations": 2847,
    "stationGrowth": 8.3,
    "previousStations": 2625,
    "apiRequests": 1247893,
    "requestGrowth": 23.7,
    "previousRequests": 1009000,
    "systemUptime": 99.87,
    "uptimeGrowth": 0.12,
    "previousUptime": 99.75,
}

ENERGY_FORECAST = [
    {"month": "Jan", "demand": 28, "actual": 26.5},
    {"month": "Feb", "demand": 30, "actual": 28.2},
    {"month": "Mar", "demand": 32, "actual": 31.8},
    {"month": "Apr", "demand": 35, "actual": 34.5},
    {"month": "May", "demand": 38, "actual": 37.2},
    {"month": "Jun", "demand": 42, "actual": 41.8},
    {"month": "Jul", "demand": 45, "actual": 44.3},
    {"month": "Aug", "demand": 46, "actual": 45.7},
    {"month": "Sep", "demand": 44, "actual": 43.5},
    {"month": "Oct", "demand": 40, "actual": 39.8},
    {"month": "Nov", "demand": 35, "actual": 34.2},
    {"month": "Dec", "demand": 32, "actual": 31.5},
]

DISTRIBUTION = [
    {"name": "Mainland", "value": 35, "fill": "#8B5CF6"},
    {"name": "Lagos Island", "value": 28, "fill": "#3B82F6"},
    {"name": "Ikoyi", "value": 19, "fill": "#10B981"},
    {"name": "Surulere", "value": 18, "fill": "#F59E0B"},
]

MAP_STATIONS = [
    {"id": 1, "name": "Yaba Lithium Swap (ST-01)", "lat": 6.5244, "lng": 3.3792, "status": "active", "load": 87, "station_type": "Lithium_Swap"},
    {"id": 2, "name": "Lekki H2 Canister Hub (ST-02)", "lat": 6.4292, "lng": 3.5744, "status": "active", "load": 65, "station_type": "H2_Canister"},
    {"id": 3, "name": "Surulere Hub", "lat": 6.4969, "lng": 3.3648, "status": "maintenance", "load": 45, "station_type": "Lithium_Swap"},
    {"id": 4, "name": "Ikeja District", "lat": 6.5901, "lng": 3.3373, "status": "active", "load": 78, "station_type": "Lithium_Swap"},
    {"id": 5, "name": "Victoria Island", "lat": 6.4274, "lng": 3.4257, "status": "active", "load": 92, "station_type": "H2_Canister"},
    {"id": 6, "name": "Badagry Sub", "lat": 6.4167, "lng": 2.8917, "status": "inactive", "load": 0, "station_type": "Lithium_Swap"},
    {"id": 7, "name": "Epe Terminal", "lat": 6.5833, "lng": 3.9667, "status": "active", "load": 55, "station_type": "H2_Canister"},
]

TERMINAL_LOGS = [
    {"id": 1, "timestamp": "2026-03-01 14:32:18", "message": "GridPulse Balancer Agent online — monitoring 7 Lagos nodes", "type": "success"},
    {"id": 2, "timestamp": "2026-03-01 14:28:45", "message": "Telemetry stream connected via AWS IoT Core gateway", "type": "success"},
    {"id": 3, "timestamp": "2026-03-01 14:24:22", "message": "ST-01 Yaba: Lithium swap cabinet on backup solar (42% SOC)", "type": "warning"},
    {"id": 4, "timestamp": "2026-03-01 14:19:08", "message": "ST-02 Lekki: H2 canister surplus detected (8 units @ 1200 PSI)", "type": "info"},
    {"id": 5, "timestamp": "2026-03-01 14:14:33", "message": "Cross-asset SLA settlement pipeline ready", "type": "success"},
]

SETTLEMENTS = [
    {"id": "1", "date": "2026-02-28", "amount": 245000, "status": "completed", "provider": "PowerCorp Solutions", "reference": "TXN-2026-0892"},
    {"id": "2", "date": "2026-02-27", "amount": 189500, "status": "completed", "provider": "Grid Tech Africa", "reference": "TXN-2026-0891"},
    {"id": "3", "date": "2026-02-26", "amount": 156750, "status": "pending", "provider": "Renewable Energy Ltd", "reference": "TXN-2026-0890"},
    {"id": "4", "date": "2026-02-25", "amount": 312000, "status": "completed", "provider": "Energy Distribution Co", "reference": "TXN-2026-0889"},
    {"id": "5", "date": "2026-02-24", "amount": 98250, "status": "completed", "provider": "Smart Grid Systems", "reference": "TXN-2026-0888"},
    {"id": "6", "date": "2026-02-23", "amount": 221875, "status": "processing", "provider": "Sustainable Power Inc", "reference": "TXN-2026-0887"},
]

TOP_PERFORMERS = [
    {"rank": 1, "provider": "PowerCorp Solutions", "score": 9.8, "uptime": "99.94%", "requests": "284,520"},
    {"rank": 2, "provider": "Grid Tech Africa", "score": 9.6, "uptime": "99.87%", "requests": "178,340"},
    {"rank": 3, "provider": "Renewable Energy Ltd", "score": 9.4, "uptime": "99.72%", "requests": "156,890"},
    {"rank": 4, "provider": "Energy Distribution Co", "score": 9.2, "uptime": "99.65%", "requests": "142,560"},
    {"rank": 5, "provider": "Smart Grid Systems", "score": 9.1, "uptime": "99.58%", "requests": "128,340"},
]

MONITORING_METRICS = [
    {"id": 1, "metric": "Grid Frequency", "value": 49.98, "unit": "Hz", "status": "normal", "threshold": "49.5-50.5"},
    {"id": 2, "metric": "System Voltage", "value": 233.2, "unit": "V", "status": "normal", "threshold": "220-240"},
    {"id": 3, "metric": "Reactive Power", "value": 1247, "unit": "MVAR", "status": "warning", "threshold": "< 1500"},
    {"id": 4, "metric": "Transmission Loss", "value": 8.4, "unit": "%", "status": "normal", "threshold": "< 10"},
    {"id": 5, "metric": "Demand Response", "value": 156, "unit": "MW", "status": "normal", "threshold": "> 100"},
]

INFRASTRUCTURE_DETAILS = {
    "stations": [
        {"id": 1, "name": "Yaba Lithium Swap (ST-01)", "lat": 6.5244, "lng": 3.3792, "status": "active", "capacity": 500, "load": 435, "efficiency": 87, "uptime": 99.94, "lastMaintenance": "2026-02-15", "station_type": "Lithium_Swap"},
        {"id": 2, "name": "Lekki H2 Canister Hub (ST-02)", "lat": 6.4292, "lng": 3.5744, "status": "active", "capacity": 350, "load": 162, "efficiency": 65, "uptime": 99.65, "lastMaintenance": "2026-02-18", "station_type": "H2_Canister"},
        {"id": 3, "name": "Surulere Hub", "lat": 6.4969, "lng": 3.3648, "status": "maintenance", "capacity": 400, "load": 180, "efficiency": 45, "uptime": 98.5, "lastMaintenance": "2026-03-01", "station_type": "Lithium_Swap"},
        {"id": 4, "name": "Ikeja District", "lat": 6.5901, "lng": 3.3373, "status": "active", "capacity": 300, "load": 234, "efficiency": 78, "uptime": 99.72, "lastMaintenance": "2026-02-20", "station_type": "Lithium_Swap"},
        {"id": 5, "name": "Victoria Island H2", "lat": 6.4274, "lng": 3.4257, "status": "active", "capacity": 350, "load": 322, "efficiency": 92, "uptime": 99.87, "lastMaintenance": "2026-02-10", "station_type": "H2_Canister"},
        {"id": 6, "name": "Badagry Sub", "lat": 6.4167, "lng": 2.8917, "status": "inactive", "capacity": 200, "load": 0, "efficiency": 0, "uptime": 95.2, "lastMaintenance": "2026-01-30", "station_type": "Lithium_Swap"},
        {"id": 7, "name": "Epe Terminal", "lat": 6.5833, "lng": 3.9667, "status": "active", "capacity": 280, "load": 154, "efficiency": 55, "uptime": 99.58, "lastMaintenance": "2026-02-22", "station_type": "H2_Canister"},
    ],
    "assets": [
        {"id": "A001", "type": "Lithium Swap Cabinet", "location": "Yaba ST-01", "status": "operational", "health": 95},
        {"id": "A002", "type": "H2 Canister Pod", "location": "Lekki ST-02", "status": "operational", "health": 98},
        {"id": "A003", "type": "Solar Backup Array", "location": "Yaba ST-01", "status": "warning", "health": 42},
        {"id": "A004", "type": "Pressure Regulator", "location": "Lekki ST-02", "status": "operational", "health": 92},
        {"id": "A005", "type": "Generator Unit", "location": "Surulere Hub", "status": "maintenance", "health": 45},
    ],
}

TRANSACTIONS = [
    {"id": "TXN001", "date": "2026-03-01", "time": "14:32", "type": "settlement", "amount": 245000, "partner": "PowerCorp Solutions", "status": "completed", "reference": "TXN-2026-0892", "currency": "NGN"},
    {"id": "TXN002", "date": "2026-03-01", "time": "12:15", "type": "payment", "amount": 156750, "partner": "Grid Tech Africa", "status": "pending", "reference": "TXN-2026-0891", "currency": "NGN"},
    {"id": "TXN003", "date": "2026-02-28", "time": "18:45", "type": "refund", "amount": 50000, "partner": "Renewable Energy Ltd", "status": "completed", "reference": "TXN-2026-0890", "currency": "NGN"},
    {"id": "TXN004", "date": "2026-02-28", "time": "10:20", "type": "settlement", "amount": 312000, "partner": "Energy Distribution Co", "status": "completed", "reference": "TXN-2026-0889", "currency": "NGN"},
    {"id": "TXN005", "date": "2026-02-27", "time": "15:08", "type": "payment", "amount": 98250, "partner": "Smart Grid Systems", "status": "completed", "reference": "TXN-2026-0888", "currency": "NGN"},
    {"id": "TXN006", "date": "2026-02-27", "time": "09:33", "type": "settlement", "amount": 221875, "partner": "Sustainable Power Inc", "status": "processing", "reference": "TXN-2026-0887", "currency": "NGN"},
    {"id": "TXN007", "date": "2026-02-26", "time": "16:42", "type": "payment", "amount": 178900, "partner": "NextGen Energy", "status": "completed", "reference": "TXN-2026-0886", "currency": "NGN"},
    {"id": "TXN008", "date": "2026-02-26", "time": "11:19", "type": "refund", "amount": 25000, "partner": "Eco Power Systems", "status": "completed", "reference": "TXN-2026-0885", "currency": "NGN"},
]

PARTNERS = [
    {"id": "P001", "name": "PowerCorp Solutions", "status": "active", "category": "Distribution", "joinDate": "2025-01-15", "balance": 450000, "revenue": 2847500, "transactions": 284, "rating": 4.8},
    {"id": "P002", "name": "Grid Tech Africa", "status": "active", "category": "Supply", "joinDate": "2025-02-20", "balance": 320000, "revenue": 1956300, "transactions": 178, "rating": 4.6},
    {"id": "P003", "name": "Renewable Energy Ltd", "status": "active", "category": "Generation", "joinDate": "2025-03-10", "balance": 180000, "revenue": 1523400, "transactions": 156, "rating": 4.5},
    {"id": "P004", "name": "Energy Distribution Co", "status": "active", "category": "Distribution", "joinDate": "2025-01-05", "balance": 220000, "revenue": 1832000, "transactions": 142, "rating": 4.7},
    {"id": "P005", "name": "Smart Grid Systems", "status": "inactive", "category": "Technology", "joinDate": "2025-04-12", "balance": 15000, "revenue": 856300, "transactions": 128, "rating": 4.2},
    {"id": "P006", "name": "Sustainable Power Inc", "status": "active", "category": "Generation", "joinDate": "2025-05-08", "balance": 340000, "revenue": 1240500, "transactions": 98, "rating": 4.4},
    {"id": "P007", "name": "NextGen Energy", "status": "active", "category": "Technology", "joinDate": "2025-06-15", "balance": 290000, "revenue": 945300, "transactions": 87, "rating": 4.3},
]

SCHEDULED_EVENTS = [
    {"id": "E001", "title": "Preventive Maintenance - Yaba ST-01", "date": "2026-03-05", "time": "02:00", "duration": 4, "type": "maintenance", "priority": "high", "status": "scheduled", "description": "Lithium cabinet + solar backup inspection"},
    {"id": "E002", "title": "H2 Pressure Calibration - Lekki ST-02", "date": "2026-03-08", "time": "23:00", "duration": 2, "type": "upgrade", "priority": "medium", "status": "scheduled", "description": "Canister pod pressure regulator calibration"},
    {"id": "E003", "title": "Capacity Test - Victoria Island Station", "date": "2026-03-10", "time": "14:00", "duration": 3, "type": "testing", "priority": "medium", "status": "scheduled", "description": "Load testing and capacity assessment"},
    {"id": "E004", "title": "Security Audit", "date": "2026-03-12", "time": "09:00", "duration": 8, "type": "audit", "priority": "high", "status": "scheduled", "description": "Complete system security review"},
    {"id": "E005", "title": "Partner Meeting - PowerCorp Solutions", "date": "2026-03-03", "time": "15:00", "duration": 1.5, "type": "meeting", "priority": "medium", "status": "scheduled", "description": "Quarterly review and planning"},
    {"id": "E006", "title": "Agent Failover Drill", "date": "2026-03-06", "time": "11:00", "duration": 2, "type": "testing", "priority": "high", "status": "scheduled", "description": "LangGraph balancer failover simulation"},
]

ANALYTICS = {
    "revenue": [
        {"month": "Jan 2026", "value": 2400, "forecast": 2210},
        {"month": "Feb 2026", "value": 2210, "forecast": 2290},
        {"month": "Mar 2026", "value": 2950, "forecast": 2000},
        {"month": "Apr 2026", "value": 2290, "forecast": 2181},
        {"month": "May 2026", "value": 2000, "forecast": 2500},
        {"month": "Jun 2026", "value": 2181, "forecast": 2100},
    ],
    "gridPerformance": [
        {"hour": "00:00", "efficiency": 78, "stability": 92},
        {"hour": "04:00", "efficiency": 82, "stability": 94},
        {"hour": "08:00", "efficiency": 85, "stability": 91},
        {"hour": "12:00", "efficiency": 88, "stability": 89},
        {"hour": "16:00", "efficiency": 86, "stability": 92},
        {"hour": "20:00", "efficiency": 83, "stability": 90},
    ],
    "loadDistribution": [
        {"station": "Yaba ST-01", "percentage": 35},
        {"station": "Lekki ST-02", "percentage": 28},
        {"station": "Ikeja", "percentage": 19},
        {"station": "Victoria Island", "percentage": 13},
        {"station": "Others", "percentage": 5},
    ],
    "partnerMetrics": [
        {"partner": "PowerCorp", "transactions": 284, "volume": 8.4, "growth": 12.5},
        {"partner": "Grid Tech", "transactions": 178, "volume": 5.2, "growth": 8.3},
        {"partner": "Renewable", "transactions": 156, "volume": 4.6, "growth": 15.2},
        {"partner": "Energy Dist", "transactions": 142, "volume": 4.2, "growth": 6.8},
    ],
}

SETTINGS = {
    "general": {
        "organizationName": "GridPulse Energy Management",
        "timezone": "Africa/Lagos",
        "currency": "NGN",
        "language": "English",
        "dateFormat": "DD/MM/YYYY",
        "theme": "light",
    },
    "notifications": {
        "emailAlerts": True,
        "smsAlerts": True,
        "pushNotifications": True,
        "maintenanceNotifications": True,
        "transactionNotifications": True,
        "systemNotifications": True,
    },
    "security": {
        "twoFactorAuth": True,
        "ipWhitelist": True,
        "sessionTimeout": 30,
        "passwordExpiryDays": 90,
        "lastPasswordChange": "2026-02-15",
    },
    "integrations": [
        {"id": "INT001", "name": "AWS IoT Core", "status": "connected", "lastSync": "2026-03-01 14:32"},
        {"id": "INT002", "name": "Cencori AI Gateway", "status": "connected", "lastSync": "2026-03-01 14:30"},
        {"id": "INT003", "name": "LangGraph Engine", "status": "connected", "lastSync": "2026-03-01 14:25"},
        {"id": "INT004", "name": "On-Chain Settlement Ledger", "status": "connected", "lastSync": "2026-03-01 14:20"},
    ],
}

FAQS = [
    {"id": 1, "category": "Getting Started", "question": "How do I access the GridPulse dashboard?", "answer": "You can access the GridPulse dashboard by logging in with your credentials at https://gridpulse.app. For first-time access, contact your administrator."},
    {"id": 2, "category": "Getting Started", "question": "What browser is recommended for GridPulse?", "answer": "We recommend using Chrome, Firefox, Safari, or Edge (latest versions). GridPulse works best on modern browsers with JavaScript enabled."},
    {"id": 3, "category": "Infrastructure", "question": "How do I add a new power station?", "answer": "To add a new station, go to Infrastructure > Stations > Add New. Fill in the station details and upload the configuration file. Your request will be reviewed by administrators."},
    {"id": 4, "category": "Infrastructure", "question": "What do the station status indicators mean?", "answer": "Active (Green): Station is operational. Maintenance (Yellow): Scheduled or ongoing maintenance. Inactive (Red): Station is offline."},
    {"id": 5, "category": "Transactions", "question": "How do I view my transaction history?", "answer": "Navigate to Transactions > History to view all your transactions. You can filter by date, status, partner, and amount. You can also export the data."},
    {"id": 6, "category": "Transactions", "question": "How long does settlement take?", "answer": "Most settlements are completed within 24-48 hours. You will receive a notification when the transaction is processed. For urgent settlements, contact support."},
    {"id": 7, "category": "Partners", "question": "How do I add a new partner?", "answer": "Go to Partners > Add Partner. Fill in the partner information and submit. Partners will be verified before activation. This typically takes 2-3 business days."},
    {"id": 8, "category": "Analytics", "question": "How often is the data updated?", "answer": "Real-time metrics are updated every minute. Historical reports are generated daily at midnight. Custom reports can be generated on demand."},
    {"id": 9, "category": "Support", "question": "How do I contact support?", "answer": "You can reach support via email (support@gridpulse.app), phone (+234-1-234-5678), or through the live chat available in the Help section."},
    {"id": 10, "category": "Support", "question": "What is your SLA for critical issues?", "answer": "Critical issues are addressed within 1 hour. High priority: 4 hours. Medium priority: 24 hours. Low priority: 72 hours. Check our SLA page for full details."},
]

# Polymorphic IoT baseline — updated live by telemetry simulator + agent
TELEMETRY_BASELINE = [
    {
        "station_id": "ST-01",
        "name": "Yaba Lithium Swap",
        "type": "Lithium_Swap",
        "location": "Yaba",
        "lat": 6.5244,
        "lng": 3.3792,
        "grid_active": False,
        "solar_soc_pct": 42.0,
        "available_batteries": 2,
        "hydrogen_psi": None,
        "available_canisters": None,
    },
    {
        "station_id": "ST-02",
        "name": "Lekki H2 Canister Hub",
        "type": "H2_Canister",
        "location": "Lekki",
        "lat": 6.4292,
        "lng": 3.5744,
        "grid_active": True,
        "solar_soc_pct": None,
        "available_batteries": None,
        "hydrogen_psi": 1200.0,
        "available_canisters": 8,
    },
    {
        "station_id": "ST-03",
        "name": "Ikeja Lithium Swap",
        "type": "Lithium_Swap",
        "location": "Ikeja",
        "lat": 6.5901,
        "lng": 3.3373,
        "grid_active": True,
        "solar_soc_pct": 78.0,
        "available_batteries": 6,
        "hydrogen_psi": None,
        "available_canisters": None,
    },
]
