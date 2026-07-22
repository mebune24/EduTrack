import { useState } from 'react';
import { type SchoolClass } from '../../types';
import { BookOpen, Plus, Edit2, Trash2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data for initial development (would come from Firestore)
const initialClasses: SchoolClass[] = [
  {
    id: 'form1',
    category: 'Form 1',
    level: 1,
    streams: [
      { id: '1a', name: 'A', capacity: 40 },
      { id: '1b', name: 'B', capacity: 40 },
    ]
  },
  {
    id: 'form2',
    category: 'Form 2',
    level: 2,
    streams: [
      { id: '2a', name: 'A', capacity: 40 },
      { id: '2b', name: 'B', capacity: 40 },
    ]
  }
];

export function ClassManagement() {
  const [classes] = useState<SchoolClass[]>(initialClasses);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Class Management</h1>
          <p className="text-slate-600">Configure academic classes and streams.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          <span>New Class</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {classes.map((schoolClass) => (
          <div key={schoolClass.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">{schoolClass.category}</h2>
              </div>
              <div className="flex gap-2">
                <button className="p-1.5 text-slate-400 hover:text-primary transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-slate-700">Streams</h3>
                <button className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Stream
                </button>
              </div>

              <div className="space-y-3">
                {schoolClass.streams.map((stream) => (
                  <div key={stream.id} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-800">Stream {stream.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full">
                        Capacity: {stream.capacity}
                      </span>
                    </div>
                    <Link
                      to={`/classes/${schoolClass.id}/streams/${stream.id}`}
                      className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80"
                    >
                      <Users className="w-4 h-4" />
                      <span>View Register</span>
                    </Link>
                  </div>
                ))}
                {schoolClass.streams.length === 0 && (
                  <div className="text-sm text-slate-500 italic">No streams configured.</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
