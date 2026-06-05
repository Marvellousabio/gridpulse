'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SettingsForm } from '@/components/settings/SettingsForm';
import { IntegrationsList } from '@/components/settings/IntegrationsList';
import { generateSettingsData } from '@/lib/mockData';
import { Sliders } from 'lucide-react';

export default function SettingsPage() {
  const settings = generateSettingsData();

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and system preferences</p>
      </div>

      <div className="space-y-8">
        <SettingsForm settings={settings} />
        <IntegrationsList integrations={settings.integrations} />
      </div>
    </DashboardLayout>
  );
}
