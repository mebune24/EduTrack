import { useState } from 'react';
import { Plus, Trash2, Calendar, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import type { SchoolEvent, EventCategory } from '../../types';

const CATEGORY_CONFIG: Record<EventCategory, { label: string; color: string; dot: string }> = {
  academic: { label: 'Academic', color: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-500' },
  cultural: { label: 'Cultural', color: 'bg-purple-100 text-purple-800 border-purple-200', dot: 'bg-purple-500' },
  sports: { label: 'Sports', color: 'bg-green-100 text-green-800 border-green-200', dot: 'bg-green-500' },
  holiday: { label: 'Holiday', color: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  meeting: { label: 'Meeting', color: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-500' },
};

const SEED_EVENTS: SchoolEvent[] = [
  { id: '1', title: 'Term 2 Exams Begin', description: 'End-of-term written exams start today for all classes.', category: 'academic', startDate: '2026-07-14', endDate: '2026-07-18', allDay: true, location: 'All Classrooms', createdBy: 'admin' },
  { id: '2', title: 'Independence Day Holiday', description: 'School closed in observance of Independence Day.', category: 'holiday', startDate: '2026-07-20', endDate: '2026-07-20', allDay: true, location: '', createdBy: 'admin' },
  { id: '3', title: 'Inter-House Sports Day', description: 'Annual sports competition. All students must participate.', category: 'sports', startDate: '2026-07-24', endDate: '2026-07-24', allDay: true, location: 'Sports Complex', createdBy: 'admin' },
  { id: '4', title: 'PTA Meeting', description: 'Termly Parent-Teacher Association meeting.', category: 'meeting', startDate: '2026-07-27', endDate: '2026-07-27', allDay: false, location: 'Assembly Hall', createdBy: 'admin' },
  { id: '5', title: 'Cultural Festival', description: 'Annual cultural day — students showcase traditional attire and dances.', category: 'cultural', startDate: '2026-08-01', endDate: '2026-08-01', allDay: true, location: 'School Ground', createdBy: 'admin' },
  { id: '6', title: 'Prize Giving Day', description: 'Best students receive awards for academic excellence.', category: 'academic', startDate: '2026-08-05', endDate: '2026-08-05', allDay: true, location: 'Assembly Hall', createdBy: 'admin' },
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function EventsCalendar() {
  const [events, setEvents] = useState<SchoolEvent[]>(SEED_EVENTS);
  const [today] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [showModal, setShowModal] = useState(false);
  const [draft, setDraft] = useState<Omit<SchoolEvent, 'id' | 'createdBy'>>({
    title: '', description: '', category: 'academic',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    allDay: true, location: '',
  });

  // Build calendar grid
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const gridCells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  const eventsOnDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.startDate <= dateStr && e.endDate >= dateStr);
  };

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const handleSave = () => {
    setEvents(prev => [...prev, { id: Date.now().toString(), ...draft, createdBy: 'admin' }]);
    setShowModal(false);
  };

  const upcomingEvents = events
    .filter(e => e.endDate >= today.toISOString().split('T')[0])
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 6);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Events & Calendar</h1>
          <p className="text-slate-600">School-wide announcements and events.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600"
            ><ChevronLeft className="w-5 h-5" /></button>
            <h2 className="font-bold text-slate-800">{MONTHS[month]} {year}</h2>
            <button
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600"
            ><ChevronRight className="w-5 h-5" /></button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {WEEKDAYS_SHORT.map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {gridCells.map((day, i) => {
              const dayEvents = day ? eventsOnDay(day) : [];
              return (
                <div
                  key={i}
                  className={`min-h-[72px] p-1.5 border-b border-r border-slate-100 ${!day ? 'bg-slate-50' : ''
                    }`}
                >
                  {day && (
                    <>
                      <span className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-sm font-medium mb-1 ${isToday(day)
                        ? 'bg-primary text-white'
                        : 'text-slate-700'
                        }`}>{day}</span>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 2).map(ev => (
                          <div key={ev.id} className={`text-xs px-1 py-0.5 rounded truncate border ${CATEGORY_CONFIG[ev.category].color}`}>
                            {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-slate-400 px-1">+{dayEvents.length - 2} more</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Upcoming Events
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {upcomingEvents.map(ev => (
                <div key={ev.id} className="p-4 flex items-start gap-3 group">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${CATEGORY_CONFIG[ev.category].dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate">{ev.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{ev.startDate}</p>
                    {ev.location && (
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {ev.location}
                      </p>
                    )}
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full border ${CATEGORY_CONFIG[ev.category].color}`}>
                      {CATEGORY_CONFIG[ev.category].label}
                    </span>
                  </div>
                  <button
                    onClick={() => setEvents(prev => prev.filter(e => e.id !== ev.id))}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                  ><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <div className="p-6 text-center text-slate-500 text-sm">No upcoming events.</div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="font-bold text-slate-700 text-sm mb-3">Categories</h3>
            <div className="space-y-2">
              {(Object.entries(CATEGORY_CONFIG) as [EventCategory, typeof CATEGORY_CONFIG[EventCategory]][]).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                  <span className="text-sm text-slate-600">{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">New School Event</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
                <input
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                  placeholder="e.g. Prize Giving Day"
                  value={draft.title}
                  onChange={e => setDraft({ ...draft, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                    value={draft.category}
                    onChange={e => setDraft({ ...draft, category: e.target.value as EventCategory })}
                  >
                    {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <input
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="e.g. Assembly Hall"
                    value={draft.location}
                    onChange={e => setDraft({ ...draft, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={draft.startDate} onChange={e => setDraft({ ...draft, startDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={draft.endDate} onChange={e => setDraft({ ...draft, endDate: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-primary focus:border-primary"
                  placeholder="Brief event description…"
                  value={draft.description}
                  onChange={e => setDraft({ ...draft, description: e.target.value })}
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
              <button onClick={handleSave} disabled={!draft.title} className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50">Add Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
