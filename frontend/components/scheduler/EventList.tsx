import { Badge } from '../shared/Badge';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

interface EventListProps {
  events: any[];
}

export function EventList({ events }: EventListProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return 'bg-blue-100 text-blue-600';
      case 'upgrade':
        return 'bg-purple-100 text-purple-600';
      case 'testing':
        return 'bg-green-100 text-green-600';
      case 'audit':
        return 'bg-red-100 text-red-600';
      case 'meeting':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Scheduled Events</h2>
        <p className="text-sm text-gray-600 mt-1">Upcoming maintenance, updates, and events</p>
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                <div className={`mt-1 px-3 py-2 rounded text-sm font-medium ${getTypeIcon(event.type)}`}>
                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                </div>
              </div>
              <Badge
                variant={
                  event.priority === 'high'
                    ? 'danger'
                    : event.priority === 'medium'
                    ? 'warning'
                    : 'info'
                }
              >
                {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)}
              </Badge>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>
                  {event.time} ({event.duration}h)
                </span>
              </div>
              <Badge variant={event.status === 'scheduled' ? 'info' : 'success'}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
