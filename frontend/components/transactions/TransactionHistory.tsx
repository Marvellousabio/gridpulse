import { Badge } from '../shared/Badge';
import { Table } from '../shared/Table';
import { ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: any[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'settlement':
        return <ArrowDownLeft className="text-blue-600" size={18} />;
      case 'payment':
        return <ArrowUpRight className="text-red-600" size={18} />;
      case 'refund':
        return <RefreshCw className="text-green-600" size={18} />;
      default:
        return null;
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'Transaction ID',
      render: (value: string) => <span className="font-medium text-purple-600">{value}</span>,
    },
    {
      key: 'date',
      label: 'Date & Time',
      render: (value: string, row: any) => `${value} ${row.time}`,
    },
    {
      key: 'type',
      label: 'Type',
      render: (value: string, row: any) => (
        <div className="flex items-center gap-2">
          {getTransactionIcon(value)}
          <span className="capitalize">{value}</span>
        </div>
      ),
    },
    {
      key: 'partner',
      label: 'Partner',
      render: (value: string) => <span className="text-gray-700">{value}</span>,
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: number, row: any) => (
        <span className="font-medium text-gray-900">
          {row.currency} {value.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <Badge
          variant={
            value === 'completed'
              ? 'success'
              : value === 'pending'
              ? 'warning'
              : value === 'processing'
              ? 'info'
              : 'danger'
          }
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
        <p className="text-sm text-gray-600 mt-1">Recent transactions and settlements</p>
      </div>
      <Table columns={columns} data={transactions} />
    </div>
  );
}
