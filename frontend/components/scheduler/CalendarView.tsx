import { Calendar } from 'lucide-react';

interface CalendarViewProps {
  events: any[];
}

export function CalendarView({ events }: CalendarViewProps) {
  const currentDate = new Date(2026, 2, 1);
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = Array.from({ length: firstDayOfMonth }, () => null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const eventsByDate = events.reduce(
    (acc, event) => {
      const date = new Date(event.date).getDate();
      if (!acc[date]) acc[date] = [];
      acc[date].push(event);
      return acc;
    },
    {} as Record<number, any[]>,
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">March 2026</h2>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => (
          <div
            key={idx}
            className={`min-h-24 p-2 rounded border ${
              day
                ? eventsByDate[day]
                  ? 'bg-purple-50 border-purple-200'
                  : 'border-gray-200 hover:bg-gray-50'
                : 'bg-gray-50 border-transparent'
            }`}
          >
            {day && (
              <>
                <p className="text-sm font-medium text-gray-900 mb-1">{day}</p>
                {eventsByDate[day]?.slice(0, 2).map((event, i) => (
                  <div key={i} className="text-xs bg-purple-200 text-purple-900 px-2 py-1 rounded mb-1 truncate">
                    {event.title.split(' ')[0]}
                  </div>
                ))}
                {eventsByDate[day]?.length > 2 && (
                  <div className="text-xs text-gray-600">+{eventsByDate[day].length - 2} more</div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
