'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

interface FAQProps {
  faqs: FAQItem[];
}

export function FAQSection({ faqs }: FAQProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <div key={category} className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{category}</h2>
          <div className="space-y-3">
            {faqs
              .filter((faq) => faq.category === category)
              .map((faq) => (
                <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                    className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-left font-medium text-gray-900">{faq.question}</h3>
                    <ChevronDown
                      size={20}
                      className={`flex-shrink-0 text-gray-400 transition-transform ${expandedId === faq.id ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {expandedId === faq.id && (
                    <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
