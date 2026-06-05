import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from 'lucide-react';

interface TransactionStatsProps {
  transactions: any[];
}

export function TransactionStats({ transactions }: TransactionStatsProps) {
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const completedAmount = transactions
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  const pendingAmount = transactions
    .filter((t) => t.status === 'pending' || t.status === 'processing')
    .reduce((sum, t) => sum + t.amount, 0);

  const chartData = [
    { name: 'Completed', value: completedAmount, fill: '#10B981' },
    { name: 'Pending', value: pendingAmount, fill: '#F59E0B' },
  ];

  const typeData = transactions.reduce(
    (acc, t) => {
      const existing = acc.find((item) => item.name === t.type);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: t.type.charAt(0).toUpperCase() + t.type.slice(1), value: 1 });
      }
      return acc;
    },
    [] as Array<{ name: string; value: number }>,
  );

  const colors = ['#8B5CF6', '#3B82F6', '#10B981'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Total Amount</h3>
        <div className="text-3xl font-bold text-gray-900">
          NGN {(totalAmount / 1000000).toFixed(2)}M
        </div>
        <p className="text-xs text-gray-500 mt-2">{transactions.length} transactions</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Completed</h3>
        <div className="text-3xl font-bold text-green-600">
          NGN {(completedAmount / 1000000).toFixed(2)}M
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {transactions.filter((t) => t.status === 'completed').length} transactions
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Pending</h3>
        <div className="text-3xl font-bold text-yellow-600">
          NGN {(pendingAmount / 1000000).toFixed(2)}M
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {transactions.filter((t) => t.status !== 'completed').length} transactions
        </p>
      </div>

      <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label outerRadius={80} fill="#8884d8" dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Types</h3>
          <div className="space-y-3">
            {typeData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[idx % colors.length] }}
                  />
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
