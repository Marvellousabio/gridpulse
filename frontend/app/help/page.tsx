'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FAQSection } from '@/components/help/FAQSection';
import { SupportContact } from '@/components/help/SupportContact';
import { generateFAQs } from '@/lib/mockData';
import { HelpCircle } from 'lucide-react';

export default function HelpPage() {
  const faqs = generateFAQs();

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-600 mt-2">Find answers and get in touch with our support team</p>
      </div>

      <div className="space-y-8">
        <SupportContact />

        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <p className="text-gray-600 mt-2">Find answers to common questions about GridPulse</p>
          </div>
          <FAQSection faqs={faqs} />
        </div>

        <div className="bg-purple-50 rounded-lg shadow-sm p-8 border border-purple-200">
          <div className="flex items-start gap-4">
            <HelpCircle size={32} className="text-purple-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Didn&apos;t find what you need?</h3>
              <p className="text-gray-700 mt-2">
                Contact our support team and we&apos;ll get back to you as soon as possible. Our team is available 24/7 to help with any questions or issues you may have.
              </p>
              <button className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
