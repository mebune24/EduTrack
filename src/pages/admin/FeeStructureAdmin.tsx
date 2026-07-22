import { useState } from 'react';
import { Plus, Trash2, Edit2, BookOpen } from 'lucide-react';
import type { FeeStructure, FeeItem } from '../../types';

// Seed data — in production these live in Firestore
const MOCK_FEE_STRUCTURES: FeeStructure[] = [
  {
    id: 'form1-2526-t1',
    classId: 'form1',
    academicYear: '2025/2026',
    term: 'Term 1',
    items: [
      { id: 'f1', label: 'Tuition Fee', amount: 75000 },
      { id: 'f2', label: 'PTA Levy', amount: 10000 },
      { id: 'f3', label: 'ICT Fee', amount: 5000 },
      { id: 'f4', label: 'Medical/Sports', amount: 5000 },
    ],
    totalAmount: 95000,
  },
  {
    id: 'form2-2526-t1',
    classId: 'form2',
    academicYear: '2025/2026',
    term: 'Term 1',
    items: [
      { id: 'f1', label: 'Tuition Fee', amount: 80000 },
      { id: 'f2', label: 'PTA Levy', amount: 10000 },
      { id: 'f3', label: 'ICT Fee', amount: 5000 },
      { id: 'f4', label: 'Medical/Sports', amount: 5000 },
    ],
    totalAmount: 100000,
  },
];

const CLASS_LABELS: Record<string, string> = {
  form1: 'Form 1', form2: 'Form 2', form3: 'Form 3',
  form4: 'Form 4', form5: 'Form 5', l6: 'Lower Sixth', u6: 'Upper Sixth',
};

function formatCFA(amount: number) {
  return new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(amount);
}

export function FeeStructureAdmin() {
  const [structures, setStructures] = useState<FeeStructure[]>(MOCK_FEE_STRUCTURES);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newItems, setNewItems] = useState<Omit<FeeItem, 'id'>[]>([{ label: '', amount: 0 }]);
  const [newForm, setNewForm] = useState({ classId: 'form1', academicYear: '2025/2026', term: 'Term 1' as const });

  const addItem = () => setNewItems([...newItems, { label: '', amount: 0 }]);
  const removeItem = (i: number) => setNewItems(newItems.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: 'label' | 'amount', value: string | number) => {
    const copy = [...newItems];
    (copy[i] as any)[field] = value;
    setNewItems(copy);
  };

  const handleSave = () => {
    const total = newItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const newStructure: FeeStructure = {
      id: `${newForm.classId}-${Date.now()}`,
      classId: newForm.classId,
      academicYear: newForm.academicYear,
      term: newForm.term,
      items: newItems.map((item, i) => ({ ...item, id: `item-${i}` })),
      totalAmount: total,
    };
    setStructures([...structures, newStructure]);
    setShowNewModal(false);
    setNewItems([{ label: '', amount: 0 }]);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Fee Structures</h1>
          <p className="text-slate-600">Define fee schedules per class and term.</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Structure
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {structures.map(s => (
          <div key={s.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">{CLASS_LABELS[s.classId] || s.classId}</h2>
                  <p className="text-xs text-slate-500">{s.academicYear} · {s.term}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 text-slate-400 hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button
                  onClick={() => setStructures(structures.filter(x => x.id !== s.id))}
                  className="p-1.5 text-slate-400 hover:text-destructive transition-colors"
                ><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="p-4 space-y-2">
              {s.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm py-1.5 border-b border-slate-50">
                  <span className="text-slate-700">{item.label}</span>
                  <span className="font-medium text-slate-900">{formatCFA(item.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-sm pt-2">
                <span className="text-slate-800">Total</span>
                <span className="text-primary">{formatCFA(s.totalAmount)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Fee Structure Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">New Fee Structure</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                    value={newForm.classId}
                    onChange={e => setNewForm({ ...newForm, classId: e.target.value })}
                  >
                    {Object.entries(CLASS_LABELS).map(([id, label]) => (
                      <option key={id} value={id}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                  <input
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    value={newForm.academicYear}
                    onChange={e => setNewForm({ ...newForm, academicYear: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Term</label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                    value={newForm.term}
                    onChange={e => setNewForm({ ...newForm, term: e.target.value as any })}
                  >
                    <option>Term 1</option>
                    <option>Term 2</option>
                    <option>Term 3</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-slate-700">Fee Items</label>
                  <button onClick={addItem} className="text-xs text-primary font-medium flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {newItems.map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        placeholder="Label (e.g. Tuition)"
                        className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        value={item.label}
                        onChange={e => updateItem(i, 'label', e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        className="w-28 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        value={item.amount || ''}
                        onChange={e => updateItem(i, 'amount', parseFloat(e.target.value) || 0)}
                      />
                      <button onClick={() => removeItem(i)} className="p-2 text-slate-400 hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-right text-sm font-semibold text-primary">
                  Total: {formatCFA(newItems.reduce((s, i) => s + (i.amount || 0), 0))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowNewModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90">Save Structure</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
