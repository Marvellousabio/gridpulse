import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PartnerAnalyticsProps {
  partners: any[];
}

export function PartnerAnalytics({ partners }: PartnerAnalyticsProps) {
  const chartData = partners.slice(0, 5).map((p) => ({
    name: p.name.split(' ')[0],
    revenue: p.revenue / 1000000,
    transactions: p.transactions / 10,
  }));

  const stats = [
    { label: 'Total Partners', value: partners.length },
    { label: 'Active', value: partners.filter((p) => p.status === 'active').length },
    { label: 'Avg Rating', value: (partners.reduce((sum, p) => sum + p.rating, 0) / partners.length).toFixed(1) },
    { label: 'Total Revenue', value: `NGN ${(partners.reduce((sum, p) => sum + p.revenue, 0) / 1000000).toFixed(1)}M` },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Partners by Revenue</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#8B5CF6" name="Revenue (NGN Millions)" />
            <Bar dataKey="transactions" fill="#3B82F6" name="Transactions (÷10)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
