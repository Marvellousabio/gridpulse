'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TransactionHistory } from '@/components/transactions/TransactionHistory';
import { TransactionStats } from '@/components/transactions/TransactionStats';
import { generateTransactionHistory } from '@/lib/mockData';
import { Filters } from '@/components/shared/Filters';
import { useState } from 'react';

export default function TransactionsPage() {
  const allTransactions = generateTransactionHistory();
  const [filteredTransactions, setFilteredTransactions] = useState(allTransactions);

  const handleFiltersChange = (filters: Record<string, string[]>) => {
    let filtered = allTransactions;

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((t) => filters.status.includes(t.status));
    }

    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter((t) => filters.type.includes(t.type));
    }

    setFilteredTransactions(filtered);
  };

  const filterOptions = {
    status: [
      { id: 'completed', label: 'Completed' },
      { id: 'pending', label: 'Pending' },
      { id: 'processing', label: 'Processing' },
    ],
    type: [
      { id: 'settlement', label: 'Settlement' },
      { id: 'payment', label: 'Payment' },
      { id: 'refund', label: 'Refund' },
    ],
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-600 mt-2">Manage and track all transactions and settlements</p>
      </div>

      <TransactionStats transactions={allTransactions} />

      <div className="mt-8">
        <Filters options={filterOptions} onFiltersChange={handleFiltersChange} />
      </div>

      <div className="mt-8">
        <TransactionHistory transactions={filteredTransactions} />
      </div>
    </DashboardLayout>
  );
}
