import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface DistributionChartsProps {
  loadData: any[];
  partnerData: any[];
}

export function DistributionCharts({ loadData, partnerData }: DistributionChartsProps) {
  const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Load Distribution by Station</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={loadData} cx="50%" cy="50%" labelLine={false} label outerRadius={100} fill="#8884d8" dataKey="percentage">
              {loadData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Partner Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={partnerData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="partner" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="volume" fill="#8B5CF6" name="Volume (NGN M)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
