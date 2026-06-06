import { PartnerCard } from './PartnerCard';

interface PartnersListProps {
  partners: any[];
}

export function PartnersList({ partners }: PartnersListProps) {
  const activePartners = partners.filter((p) => p.status === 'active');
  const inactivePartners = partners.filter((p) => p.status === 'inactive');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Partners ({activePartners.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activePartners.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      </div>

      {inactivePartners.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Inactive Partners ({inactivePartners.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inactivePartners.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
