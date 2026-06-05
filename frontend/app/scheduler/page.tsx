'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EventList } from '@/components/scheduler/EventList';
import { CalendarView } from '@/components/scheduler/CalendarView';
import { generateScheduledEvents } from '@/lib/mockData';
import { Calendar } from 'lucide-react';

export default function SchedulerPage() {
  const events = generateScheduledEvents();
  const upcomingEvents = events.filter((e) => new Date(e.date) >= new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const stats = [
    { label: 'Total Events', value: events.length },
    { label: 'Upcoming', value: upcomingEvents.length },
    { label: 'High Priority', value: events.filter((e) => e.priority === 'high').length },
    { label: 'This Week', value: upcomingEvents.filter((e) => new Date(e.date).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000).length },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scheduler</h1>
          <p className="text-gray-600 mt-2">Plan and manage scheduled maintenance and events</p>
        </div>
        <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
          Schedule Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <EventList events={upcomingEvents} />
        </div>
        <div>
          <CalendarView events={events} />
        </div>
      </div>
    </DashboardLayout>
  );
}
