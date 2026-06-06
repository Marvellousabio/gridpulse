'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PartnersList } from '@/components/partners/PartnersList';
import { PartnerAnalytics } from '@/components/partners/PartnerAnalytics';
import { generatePartners } from '@/lib/mockData';
import { Users } from 'lucide-react';

export default function PartnersPage() {
  const partners = generatePartners();

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Partners</h1>
          <p className="text-gray-600 mt-2">Manage partner relationships and track performance</p>
        </div>
        <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
          Add Partner
        </button>
      </div>

      <PartnerAnalytics partners={partners} />

      <div className="mt-8">
        <PartnersList partners={partners} />
      </div>
    </DashboardLayout>
  );
}
