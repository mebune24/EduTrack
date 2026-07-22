import { useState } from 'react';
import { Clock, BookOpen } from 'lucide-react';
import type { Weekday, TimetableSlot } from '../../types';

const DAYS: Weekday[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Same seed data as admin view — would come from Firestore in production
const SEED_SLOTS: TimetableSlot[] = [
  { id: '1', day: 'Monday', startTime: '07:30', endTime: '09:00', subject: 'Mathematics', teacherName: 'Mr. Tchamba', room: 'R101' },
  { id: '2', day: 'Monday', startTime: '09:00', endTime: '10:30', subject: 'English Language', teacherName: 'Mrs. Abah', room: 'R102' },
  { id: '3', day: 'Monday', startTime: '10:30', endTime: '11:00', subject: 'Break', teacherName: '', room: '' },
  { id: '4', day: 'Monday', startTime: '11:00', endTime: '12:30', subject: 'Physics', teacherName: 'Mr. Ndeh', room: 'Lab 1' },
  { id: '5', day: 'Tuesday', startTime: '07:30', endTime: '09:00', subject: 'French', teacherName: 'Ms. Ngono', room: 'R103' },
  { id: '6', day: 'Tuesday', startTime: '09:00', endTime: '10:30', subject: 'Chemistry', teacherName: 'Mr. Fon', room: 'Lab 2' },
  { id: '7', day: 'Tuesday', startTime: '10:30', endTime: '11:00', subject: 'Break', teacherName: '', room: '' },
  { id: '8', day: 'Tuesday', startTime: '11:00', endTime: '12:30', subject: 'Biology', teacherName: 'Mrs. Kemba', room: 'R104' },
  { id: '9', day: 'Wednesday', startTime: '07:30', endTime: '09:00', subject: 'History', teacherName: 'Mr. Bih', room: 'R105' },
  { id: '10', day: 'Wednesday', startTime: '09:00', endTime: '10:30', subject: 'Geography', teacherName: 'Ms. Tabi', room: 'R106' },
  { id: '11', day: 'Thursday', startTime: '07:30', endTime: '09:00', subject: 'ICT', teacherName: 'Mr. Ngu', room: 'Lab 3' },
  { id: '12', day: 'Thursday', startTime: '09:00', endTime: '10:30', subject: 'Mathematics', teacherName: 'Mr. Tchamba', room: 'R101' },
  { id: '13', day: 'Friday', startTime: '07:30', endTime: '09:00', subject: 'Physical Education', teacherName: 'Mr. Mbarga', room: 'Field' },
  { id: '14', day: 'Friday', startTime: '09:00', endTime: '10:30', subject: 'English Language', teacherName: 'Mrs. Abah', room: 'R102' },
];

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: 'bg-blue-100 border-blue-300 text-blue-800',
  'English Language': 'bg-green-100 border-green-300 text-green-800',
  French: 'bg-purple-100 border-purple-300 text-purple-800',
  Physics: 'bg-orange-100 border-orange-300 text-orange-800',
  Chemistry: 'bg-red-100 border-red-300 text-red-800',
  Biology: 'bg-emerald-100 border-emerald-300 text-emerald-800',
  History: 'bg-amber-100 border-amber-300 text-amber-800',
  Geography: 'bg-teal-100 border-teal-300 text-teal-800',
  ICT: 'bg-indigo-100 border-indigo-300 text-indigo-800',
  'Physical Education': 'bg-pink-100 border-pink-300 text-pink-800',
  Break: 'bg-slate-100 border-slate-300 text-slate-500',
};

const TODAY = DAYS[new Date().getDay() - 1] ?? 'Monday';

export function TimetableView() {
  const [activeDay, setActiveDay] = useState<Weekday>(TODAY);

  const todaySlots = SEED_SLOTS.filter(s => s.day === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Next subject (first non-break after current time)
  const now = new Date().toTimeString().slice(0, 5);
  const nextSubject = SEED_SLOTS
    .filter(s => s.day === TODAY && s.startTime >= now && s.subject !== 'Break')
    .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Timetable</h1>
        <p className="text-slate-600">Form 1 — Stream A · Academic Year 2025/2026</p>
      </div>

      {/* Next up banner */}
      {nextSubject && activeDay === TODAY && (
        <div className="mb-6 bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-primary text-white rounded-xl shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-primary font-semibold uppercase tracking-wide">Next Up</p>
            <p className="font-bold text-slate-800">{nextSubject.subject}</p>
            <p className="text-sm text-slate-500">{nextSubject.startTime} – {nextSubject.endTime} · {nextSubject.teacherName} · {nextSubject.room}</p>
          </div>
        </div>
      )}

      {/* Day tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`flex-1 min-w-[80px] py-2 px-3 rounded-lg text-sm font-medium transition-all ${activeDay === day
                ? 'bg-white shadow text-primary'
                : 'text-slate-600 hover:text-slate-800'
              }`}
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.slice(0, 3)}</span>
          </button>
        ))}
      </div>

      {/* Slot list */}
      {todaySlots.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500">No classes scheduled for {activeDay}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {todaySlots.map(slot => {
            const colorClass = SUBJECT_COLORS[slot.subject] || 'bg-slate-100 border-slate-300 text-slate-700';
            const isBreak = slot.subject === 'Break';
            return (
              <div
                key={slot.id}
                className={`rounded-xl border-2 p-4 ${colorClass} ${isBreak ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center w-16 shrink-0">
                      <p className="text-xs font-semibold opacity-70">{slot.startTime}</p>
                      <div className="w-0.5 h-4 bg-current opacity-30 mx-auto my-0.5" />
                      <p className="text-xs font-semibold opacity-70">{slot.endTime}</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-base">{slot.subject}</h3>
                      {!isBreak && (
                        <>
                          <p className="text-sm opacity-80">{slot.teacherName}</p>
                          {slot.room && (
                            <p className="text-xs opacity-60 mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Room: {slot.room}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {!isBreak && (
                    <div className="shrink-0 text-right">
                      <span className="text-xs font-medium opacity-70 bg-black/10 px-2 py-1 rounded-full">
                        {(() => {
                          const [sh, sm] = slot.startTime.split(':').map(Number);
                          const [eh, em] = slot.endTime.split(':').map(Number);
                          const mins = (eh * 60 + em) - (sh * 60 + sm);
                          return `${mins} min`;
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
