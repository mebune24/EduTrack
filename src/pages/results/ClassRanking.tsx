import { useEffect, useState } from 'react';
import { Medal, TrendingUp, Users, Loader2 } from 'lucide-react';
import type { StudentResult } from '../../types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const MEDAL_COLORS = ['text-amber-500', 'text-slate-400', 'text-amber-700'];

export function ClassRanking() {
  const [selectedClass, setSelectedClass] = useState('form1');
  const [selectedTerm, setSelectedTerm] = useState('Term 2');
  const [rankings, setRankings] = useState<(StudentResult & { position: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'results'),
          where('classId', '==', selectedClass),
          where('term', '==', selectedTerm),
          where('status', '==', 'published')
        );
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentResult));

        // Sort by average descending and assign position
        results.sort((a, b) => b.average - a.average);
        const rankedResults = results.map((res, idx) => ({ ...res, position: idx + 1 }));

        setRankings(rankedResults);
      } catch (err) {
        console.error('Error fetching rankings', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [selectedClass, selectedTerm]);

  const top3 = rankings.slice(0, 3);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Class Rankings</h1>
          <p className="text-slate-600">Academic performance leaderboard.</p>
        </div>
        <div className="flex gap-3">
          <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            <option value="form1">Form 1</option>
            <option value="form2">Form 2</option>
            <option value="l6">Lower Sixth</option>
          </select>
          <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)}>
            <option>Term 1</option>
            <option>Term 2</option>
            <option>Term 3</option>
          </select>
        </div>
      </div>

      {/* Podium for top 3 */}
      <div className="grid grid-cols-3 gap-4 mb-8 max-w-xl mx-auto">
        {[top3[1], top3[0], top3[2]].map((student, podiumIdx) => {
          if (!student) return null;
          const realPos = student.position;
          const heights = ['h-28', 'h-36', 'h-24'];
          const bgColors = ['bg-slate-100', 'bg-amber-50 border-amber-200', 'bg-orange-50 border-orange-200'];
          return (
            <div key={student.id} className="flex flex-col items-center gap-2">
              <Medal className={`w-7 h-7 ${MEDAL_COLORS[realPos - 1]}`} />
              <div className={`w-full rounded-t-xl border-2 ${bgColors[podiumIdx]} ${heights[podiumIdx]} flex flex-col items-center justify-end pb-3 px-2`}>
                <p className="font-bold text-slate-800 text-sm text-center leading-tight">{student.studentName.split(' ')[0]}</p>
                <p className="text-primary font-semibold text-sm">{student.average.toFixed(1)}%</p>
                <p className="text-xs text-slate-500">#{realPos}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-slate-800">Full Rankings — {selectedTerm}</h2>
          <span className="ml-auto text-xs text-slate-500">{rankings.length} students</span>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : rankings.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No published results found for this term and class.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-600 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-center font-semibold w-16">Rank</th>
                <th className="px-6 py-3 text-left font-semibold">Student</th>
                <th className="px-6 py-3 text-center font-semibold">Total Marks</th>
                <th className="px-6 py-3 text-center font-semibold">Average</th>
                <th className="px-6 py-3 text-center font-semibold">Progress</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map(student => (
                <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4 text-center">
                    {student.position <= 3 ? (
                      <Medal className={`w-5 h-5 mx-auto ${MEDAL_COLORS[student.position - 1]}`} />
                    ) : (
                      <span className="font-bold text-slate-500">#{student.position}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">{student.studentName}</td>
                  <td className="px-6 py-4 text-center text-slate-700">{student.totalMarks}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-bold ${student.average >= 70 ? 'text-green-600' : student.average >= 50 ? 'text-amber-600' : 'text-red-600'
                      }`}>{student.average.toFixed(1)}%</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 max-w-[120px] mx-auto">
                      <div className="flex-1 bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${student.average}%` }}
                        />
                      </div>
                      <TrendingUp className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
