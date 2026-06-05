import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GridPerformanceProps {
  data: any[];
}

export function GridPerformance({ data }: GridPerformanceProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Grid Performance</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="efficiency" stroke="#10B981" name="Efficiency %" />
          <Line type="monotone" dataKey="stability" stroke="#8B5CF6" name="Stability %" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
