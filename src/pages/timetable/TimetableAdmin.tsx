import { useState } from 'react';
import { Plus, Trash2, Save, Clock } from 'lucide-react';
import type { Weekday, TimetableSlot } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const DAYS: Weekday[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const TIME_SLOTS = [
  '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00',
  '14:30', '15:00', '15:30', '16:00',
];

const SUBJECTS = [
  'Mathematics', 'English Language', 'French', 'Physics', 'Chemistry',
  'Biology', 'History', 'Geography', 'ICT', 'Physical Education', 'Break',
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
  Break: 'bg-slate-100 border-slate-300 text-slate-600',
};

const SEED_SLOTS: TimetableSlot[] = [
  { id: '1', day: 'Monday', startTime: '07:30', endTime: '09:00', subject: 'Mathematics', teacherName: 'Mr. Tchamba', teacherId: 'teacher-1', room: 'R101' },
  { id: '2', day: 'Monday', startTime: '09:00', endTime: '10:30', subject: 'English Language', teacherName: 'Mrs. Abah', teacherId: 'teacher-2', room: 'R102' },
  { id: '3', day: 'Monday', startTime: '10:30', endTime: '11:00', subject: 'Break', teacherName: '', teacherId: '', room: '' },
  { id: '4', day: 'Monday', startTime: '11:00', endTime: '12:30', subject: 'Physics', teacherName: 'Mr. Ndeh', teacherId: 'teacher-3', room: 'Lab 1' },
  { id: '5', day: 'Tuesday', startTime: '07:30', endTime: '09:00', subject: 'French', teacherName: 'Ms. Ngono', teacherId: 'teacher-4', room: 'R103' },
  { id: '6', day: 'Tuesday', startTime: '09:00', endTime: '10:30', subject: 'Chemistry', teacherName: 'Mr. Fon', teacherId: 'teacher-5', room: 'Lab 2' },
  { id: '7', day: 'Tuesday', startTime: '10:30', endTime: '11:00', subject: 'Break', teacherName: '', teacherId: '', room: '' },
  { id: '8', day: 'Tuesday', startTime: '11:00', endTime: '12:30', subject: 'Biology', teacherName: 'Mrs. Kemba', teacherId: 'teacher-6', room: 'R104' },
  { id: '9', day: 'Wednesday', startTime: '07:30', endTime: '09:00', subject: 'History', teacherName: 'Mr. Bih', teacherId: 'teacher-7', room: 'R105' },
  { id: '10', day: 'Wednesday', startTime: '09:00', endTime: '10:30', subject: 'Geography', teacherName: 'Ms. Tabi', teacherId: 'teacher-8', room: 'R106' },
  { id: '11', day: 'Thursday', startTime: '07:30', endTime: '09:00', subject: 'ICT', teacherName: 'Mr. Ngu', teacherId: 'teacher-9', room: 'Lab 3' },
  { id: '12', day: 'Thursday', startTime: '09:00', endTime: '10:30', subject: 'Mathematics', teacherName: 'Mr. Tchamba', teacherId: 'teacher-1', room: 'R101' },
  { id: '13', day: 'Friday', startTime: '07:30', endTime: '09:00', subject: 'Physical Education', teacherName: 'Mr. Mbarga', teacherId: 'teacher-10', room: 'Field' },
  { id: '14', day: 'Friday', startTime: '09:00', endTime: '10:30', subject: 'English Language', teacherName: 'Mrs. Abah', teacherId: 'teacher-2', room: 'R102' },
];

const emptySlot = (teacherId: string, teacherName: string): Omit<TimetableSlot, 'id'> => ({
  day: 'Monday',
  startTime: '07:30',
  endTime: '09:00',
  subject: 'Mathematics',
  teacherName,
  teacherId,
  room: '',
});

export function TimetableAdmin() {
  const { user } = useAuth();
  const [slots, setSlots] = useState<TimetableSlot[]>(SEED_SLOTS);
  const [selectedClass, setSelectedClass] = useState('form1');
  const [selectedStream, setSelectedStream] = useState('a');
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [draft, setDraft] = useState<Omit<TimetableSlot, 'id'>>(emptySlot(user?.id || '', user?.firstName ? `${user.firstName} ${user.lastName}` : ''));
  const [savedMsg, setSavedMsg] = useState(false);

  const isAdmin = user?.role === 'admin';
  const visibleSlots = isAdmin ? slots : slots.filter(s => s.teacherId === user?.id);

  const slotsForDay = (day: Weekday) =>
    visibleSlots.filter(s => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const openAdd = () => {
    setEditingSlot(null);
    setDraft(emptySlot(user?.id || '', user?.firstName ? `${user.firstName} ${user.lastName}` : ''));
    setShowModal(true);
  };

  const openEdit = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setDraft({ day: slot.day, startTime: slot.startTime, endTime: slot.endTime, subject: slot.subject, teacherName: slot.teacherName, teacherId: slot.teacherId, room: slot.room });
    setShowModal(true);
  };

  const handleSaveSlot = () => {
    if (editingSlot) {
      setSlots(prev => prev.map(s => s.id === editingSlot.id ? { ...s, ...draft } : s));
    } else {
      setSlots(prev => [...prev, { id: Date.now().toString(), ...draft }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setSlots(prev => prev.filter(s => s.id !== id));
  };

  const handlePublish = async () => {
    // In production: write to Firestore
    await new Promise(r => setTimeout(r, 800));
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const colorFor = (subject: string) => SUBJECT_COLORS[subject] || 'bg-slate-100 border-slate-300 text-slate-700';

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Timetable Management</h1>
          <p className="text-slate-600">Build and publish the weekly class schedule.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            <option value="form1">Form 1</option>
            <option value="form2">Form 2</option>
            <option value="l6">Lower Sixth</option>
            <option value="u6">Upper Sixth</option>
          </select>
          <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" value={selectedStream} onChange={e => setSelectedStream(e.target.value)}>
            <option value="a">Stream A</option>
            <option value="b">Stream B</option>
          </select>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Slot
          </button>
          <button onClick={handlePublish} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium">
            <Save className="w-4 h-4" /> Publish
          </button>
        </div>
      </div>

      {savedMsg && (
        <div className="mb-4 px-4 py-3 bg-green-100 text-green-800 text-sm font-medium rounded-lg">
          ✅ Timetable published successfully!
        </div>
      )}

      {/* Grid view */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {DAYS.map(day => (
          <div key={day} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-800 text-white text-sm font-bold py-3 px-4 text-center">{day}</div>
            <div className="p-3 space-y-2 min-h-[200px]">
              {slotsForDay(day).length === 0 && (
                <p className="text-xs text-slate-400 italic text-center pt-4">No slots</p>
              )}
              {slotsForDay(day).map(slot => (
                <div
                  key={slot.id}
                  className={`rounded-lg border p-2.5 cursor-pointer group relative ${colorFor(slot.subject)}`}
                  onClick={() => openEdit(slot)}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <p className="font-semibold text-xs leading-tight">{slot.subject}</p>
                      <p className="text-xs opacity-70 mt-0.5">{slot.teacherName}</p>
                      <p className="text-xs opacity-60 flex items-center gap-1 mt-1">
                        <Clock className="w-2.5 h-2.5" />{slot.startTime} – {slot.endTime}
                      </p>
                      {slot.room && <p className="text-xs opacity-60">{slot.room}</p>}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(slot.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-black/10 shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">
                {editingSlot ? 'Edit Timetable Slot' : 'New Timetable Slot'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Day</label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                    value={draft.day}
                    onChange={e => setDraft({ ...draft, day: e.target.value as Weekday })}
                  >
                    {DAYS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                    value={draft.subject}
                    onChange={e => setDraft({ ...draft, subject: e.target.value })}
                  >
                    {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                    value={draft.startTime}
                    onChange={e => setDraft({ ...draft, startTime: e.target.value })}
                  >
                    {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                    value={draft.endTime}
                    onChange={e => setDraft({ ...draft, endTime: e.target.value })}
                  >
                    {TIME_SLOTS.filter(t => t > draft.startTime).map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teacher Name</label>
                  <input
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="e.g. Mr. Tchamba"
                    value={draft.teacherName}
                    onChange={e => setDraft({ ...draft, teacherName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Room</label>
                  <input
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="e.g. R101 / Lab 1"
                    value={draft.room}
                    onChange={e => setDraft({ ...draft, room: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
              <button onClick={handleSaveSlot} className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90">Save Slot</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
