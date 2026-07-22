import { useState, useEffect } from 'react';
import { Save, Send, Plus, Trash2, Loader2 } from 'lucide-react';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { StudentRegistration, StudentResult } from '../../types';

// Grading logic (GCE Cameroon style)
function getGrade(total: number): { grade: string; remark: string } {
  if (total >= 80) return { grade: 'A', remark: 'Excellent' };
  if (total >= 70) return { grade: 'B', remark: 'Very Good' };
  if (total >= 60) return { grade: 'C', remark: 'Good' };
  if (total >= 50) return { grade: 'D', remark: 'Satisfactory' };
  if (total >= 40) return { grade: 'E', remark: 'Pass' };
  return { grade: 'F', remark: 'Fail' };
}

const DEFAULT_SUBJECTS = [
  'Mathematics', 'English Language', 'Physics', 'Chemistry',
  'Biology', 'History', 'Geography', 'French',
];

interface ScoreRow {
  studentId: string;
  studentName: string;
  scores: Record<string, { ca: number; exam: number }>;
}

export function ScoreEntry() {
  const [subjects, setSubjects] = useState<string[]>(DEFAULT_SUBJECTS);
  const [newSubject, setNewSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('form1');
  const [selectedTerm, setSelectedTerm] = useState<'Term 1' | 'Term 2' | 'Term 3'>('Term 1');
  const academicYear = '2025/2026';
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<'draft' | 'published' | null>(null);

  const [scoreRows, setScoreRows] = useState<ScoreRow[]>([]);

  // Fetch students and existing results
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch active students in class
        const studentsQ = query(
          collection(db, 'registrations'),
          where('status', '==', 'active'),
          where('classAppliedFor', '==', selectedClass)
        );
        const studentSnap = await getDocs(studentsQ);
        const students = studentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentRegistration));

        // Fetch existing results for this class and term
        const resultsQ = query(
          collection(db, 'results'),
          where('classId', '==', selectedClass),
          where('term', '==', selectedTerm),
          where('academicYear', '==', academicYear)
        );
        const resultsSnap = await getDocs(resultsQ);
        const resultsMap = new Map<string, StudentResult>();
        resultsSnap.forEach(doc => {
          const res = doc.data() as StudentResult;
          resultsMap.set(res.studentId, res);
        });

        const rows: ScoreRow[] = students.map(student => {
          const studentId = student.id || `anon-${Math.random()}`;
          const existingResult = resultsMap.get(studentId);
          const initialScores: Record<string, { ca: number; exam: number }> = {};
          
          if (existingResult) {
            existingResult.scores.forEach(s => {
              initialScores[s.subjectName] = { ca: s.caScore, exam: s.examScore };
              if (!subjects.includes(s.subjectName)) {
                setSubjects(prev => [...prev, s.subjectName]);
              }
            });
          }
          
          // Fill missing subjects with 0
          subjects.forEach(sub => {
            if (!initialScores[sub]) initialScores[sub] = { ca: 0, exam: 0 };
          });

          return {
            studentId,
            studentName: `${student.firstName} ${student.lastName}`.trim(),
            scores: initialScores,
          };
        });

        setScoreRows(rows);
      } catch (err) {
        console.error("Error fetching students/results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedClass, selectedTerm, academicYear]);

  const updateScore = (studentId: string, subject: string, field: 'ca' | 'exam', value: number) => {
    setScoreRows(prev =>
      prev.map(row =>
        row.studentId === studentId
          ? { ...row, scores: { ...row.scores, [subject]: { ...row.scores[subject], [field]: value } } }
          : row
      )
    );
  };

  const getTotal = (scores: { ca: number; exam: number }) =>
    Math.min(scores.ca, 30) + Math.min(scores.exam, 70);

  const addSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      const sub = newSubject.trim();
      setSubjects(prev => [...prev, sub]);
      setScoreRows(prev =>
        prev.map(row => ({
          ...row,
          scores: { ...row.scores, [sub]: { ca: 0, exam: 0 } },
        }))
      );
      setNewSubject('');
    }
  };

  const removeSubject = (sub: string) => {
    setSubjects(prev => prev.filter(s => s !== sub));
  };

  const handleSave = async (publish: boolean) => {
    setSaving(true);
    try {
      const promises = scoreRows.map(async (row) => {
        let totalMarks = 0;
        const resultScores = subjects.map(sub => {
          const s = row.scores[sub] || { ca: 0, exam: 0 };
          const total = getTotal(s);
          const { grade, remark } = getGrade(total);
          totalMarks += total;
          return {
            subjectId: sub.toLowerCase().replace(/\s+/g, '-'),
            subjectName: sub,
            subject: sub,
            caScore: s.ca || 0,
            examScore: s.exam || 0,
            total,
            grade,
            remark
          };
        });

        const average = subjects.length ? totalMarks / subjects.length : 0;
        
        const docId = `${row.studentId}-${academicYear.replace('/', '-')}-${selectedTerm.replace(' ', '')}`;
        const docRef = doc(db, 'results', docId);

        const resultData: Omit<StudentResult, 'id'> = {
          studentId: row.studentId,
          studentName: row.studentName,
          classId: selectedClass,
          streamId: 'a', // Hardcoded for now, normally selected or fetched
          academicYear,
          term: selectedTerm,
          scores: resultScores,
          totalMarks,
          average,
          status: publish ? 'published' : 'draft',
          createdAt: new Date().toISOString()
        };

        await setDoc(docRef, resultData, { merge: true });
      });

      await Promise.all(promises);
      
      setSavedMsg(publish ? 'published' : 'draft');
      setTimeout(() => setSavedMsg(null), 3000);
    } catch (err) {
      console.error("Error saving results:", err);
      alert("Failed to save results");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Score Entry</h1>
        <p className="text-slate-600">Enter CA and exam scores for each student.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
          value={selectedClass}
          onChange={e => setSelectedClass(e.target.value)}
        >
          <option value="form1">Form 1</option>
          <option value="form2">Form 2</option>
          <option value="form3">Form 3</option>
          <option value="l6">Lower Sixth</option>
          <option value="u6">Upper Sixth</option>
        </select>
        <select
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
          value={selectedTerm}
          onChange={e => setSelectedTerm(e.target.value as any)}
        >
          <option>Term 1</option>
          <option>Term 2</option>
          <option>Term 3</option>
        </select>

        {/* Add subject */}
        <div className="flex gap-2 ml-auto">
          <input
            placeholder="Add subject…"
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-36"
            value={newSubject}
            onChange={e => setNewSubject(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSubject()}
          />
          <button onClick={addSubject} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {savedMsg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${savedMsg === 'published' ? 'bg-green-100 text-green-800' : 'bg-blue-50 text-blue-800'}`}>
          {savedMsg === 'published' ? '✅ Results published successfully!' : '💾 Draft saved successfully!'}
        </div>
      )}

      {/* Score Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : scoreRows.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No active students found in this class.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-left font-semibold text-slate-700 sticky left-0 bg-slate-50 min-w-[150px]">Student</th>
              {subjects.map(sub => (
                <th key={sub} className="px-3 py-3 text-center font-semibold text-slate-700 min-w-[130px]">
                  <div className="flex items-center justify-center gap-1">
                    <span className="truncate max-w-[90px]">{sub}</span>
                    <button onClick={() => removeSubject(sub)} className="text-slate-300 hover:text-destructive shrink-0">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex gap-1 mt-1 text-xs text-slate-400 font-normal justify-center">
                    <span className="w-12 text-center">CA/30</span>
                    <span className="w-14 text-center">Exam/70</span>
                    <span className="w-12 text-center">Tot</span>
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-center font-semibold text-slate-700 min-w-[80px]">Avg</th>
            </tr>
          </thead>
          <tbody>
            {scoreRows.map(row => {
              const totals = subjects.map(sub => getTotal(row.scores[sub] || { ca: 0, exam: 0 }));
              const avg = totals.length ? (totals.reduce((a, b) => a + b, 0) / totals.length) : 0;
              const { grade } = getGrade(avg);
              return (
                <tr key={row.studentId} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800 sticky left-0 bg-white hover:bg-slate-50">{row.studentName}</td>
                  {subjects.map(sub => {
                    const s = row.scores[sub] || { ca: 0, exam: 0 };
                    const tot = getTotal(s);
                    const { grade: g } = getGrade(tot);
                    return (
                      <td key={sub} className="px-3 py-2">
                        <div className="flex gap-1 items-center justify-center">
                          <input
                            type="number"
                            min={0} max={30}
                            className="w-12 border border-slate-200 rounded px-1 py-1 text-center text-xs focus:ring-primary focus:border-primary"
                            value={s.ca || ''}
                            onChange={e => updateScore(row.studentId, sub, 'ca', parseFloat(e.target.value) || 0)}
                          />
                          <input
                            type="number"
                            min={0} max={70}
                            className="w-14 border border-slate-200 rounded px-1 py-1 text-center text-xs focus:ring-primary focus:border-primary"
                            value={s.exam || ''}
                            onChange={e => updateScore(row.studentId, sub, 'exam', parseFloat(e.target.value) || 0)}
                          />
                          <span className={`w-12 text-center text-xs font-bold ${
                            g === 'A' ? 'text-green-600' : g === 'F' ? 'text-red-600' : 'text-slate-700'
                          }`}>{tot} ({g})</span>
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-center">
                    <span className={`font-bold text-sm ${
                      grade === 'A' ? 'text-green-600' : grade === 'F' ? 'text-red-600' : 'text-amber-600'
                    }`}>{avg.toFixed(1)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-3 justify-end">
        <button
          onClick={() => handleSave(false)}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save Draft'}
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium disabled:opacity-60"
        >
          <Send className="w-4 h-4" />
          {saving ? 'Publishing…' : 'Publish Results'}
        </button>
      </div>
    </div>
  );
}
