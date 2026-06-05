import { Mail, Phone, MessageSquare, Clock } from 'lucide-react';

export function SupportContact() {
  const contacts = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help via email',
      value: 'support@gridpulse.app',
      action: 'Send Email',
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Talk to our team',
      value: '+234-1-234-5678',
      action: 'Call Now',
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Instant messaging',
      value: 'Available 24/7',
      action: 'Start Chat',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      description: 'When we are available',
      value: 'Mon-Fri 8:00 AM - 6:00 PM',
      action: 'Schedule',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Support</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contacts.map((contact, idx) => {
          const Icon = contact.icon;
          return (
            <div key={idx} className="flex flex-col items-start p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Icon size={24} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{contact.title}</h3>
                  <p className="text-sm text-gray-600">{contact.description}</p>
                </div>
              </div>
              <p className="text-lg font-medium text-gray-900 mb-3">{contact.value}</p>
              <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                {contact.action} →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
