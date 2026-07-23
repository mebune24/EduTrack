import { useState, useEffect } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar
} from 'recharts';
import { Award, TrendingUp, Medal, BookOpen, ChevronDown, Loader2 } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import type { StudentResult } from '../../types';

export function StudentResultView() {
  const { user } = useAuth();
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTermId, setSelectedTermId] = useState<string>('');

  useEffect(() => {
    const fetchResults = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const q = query(
          collection(db, 'results'),
          where('studentId', '==', user.id),
          where('status', '==', 'published')
        );
        const snapshot = await getDocs(q);
        const data: StudentResult[] = [];
        snapshot.forEach(doc => {
          data.push({ id: doc.id, ...doc.data() } as StudentResult);
        });
        setResults(data);
        if (data.length > 0) {
          setSelectedTermId(data[0].id!);
        }
      } catch (err) {
        console.error("Error fetching results:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [user?.id]);

  const result = results.find(r => r.id === selectedTermId) ?? results[0];

  // Radar data – subject averages
  if (loading) return <div className="p-8 text-center text-slate-500">Loading results…</div>;
  if (!result) return <div className="p-8 text-center text-slate-500">No published results yet.</div>;

  const radarData = result.scores.map(s => ({
    subject: s.subjectName.split(' ')[0],
    score: s.total,
    fullMark: 100,
  }));

  const barData = result.scores.map(s => ({
    name: s.subjectName.split(' ')[0],
    CA: s.caScore,
    Exam: s.examScore,
  }));

  const termResults = results.filter(r => r.status === 'published');
  const trendData = termResults.map(r => ({
    term: r.term,
    average: r.average,
    rank: r.rank,
  }));

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Results</h1>
          <p className="text-slate-600">Academic Year 2025/2026</p>
        </div>
        {/* Term selector */}
        <div className="relative w-44">
          <select
            className="w-full border border-slate-300 rounded-lg px-3 py-2 pr-8 text-sm bg-white appearance-none"
            value={selectedTermId}
            onChange={e => setSelectedTermId(e.target.value)}
          >
            {MOCK_TERMS.filter(r => r.status === 'published').map(r => (
              <option key={r.id} value={r.id}>{r.term}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Summary KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Average</p>
          <p className="text-3xl font-bold text-primary">{result.average.toFixed(1)}<span className="text-sm text-slate-400">%</span></p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <Medal className="w-4 h-4 text-amber-500" />
            <p className="text-xs text-slate-500 uppercase tracking-wide">Rank</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">
            {result.rank}<span className="text-sm text-slate-400">/{result.totalStudents}</span>
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Total Marks</p>
          <p className="text-3xl font-bold text-slate-800">{result.totalMarks}<span className="text-sm text-slate-400">/{result.scores.length * 100}</span></p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Subjects</p>
          <p className="text-3xl font-bold text-slate-800">{result.scores.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Radar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> Performance Radar
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Trend Line Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 lg:col-span-2">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Performance Trend
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="term" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="average" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} name="Average %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CA vs Exam Bar Chart */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
        <h2 className="font-bold text-slate-800 mb-4">CA vs Exam Score by Subject</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} barSize={14} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="CA" fill="#3b82f6" radius={[3, 3, 0, 0]} name="CA (/30)" />
            <Bar dataKey="Exam" fill="#0f172a" radius={[3, 3, 0, 0]} name="Exam (/70)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed subject table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-slate-800">Subject Breakdown — {result.term}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-600 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Subject</th>
                <th className="px-4 py-3 text-center font-semibold">CA (/30)</th>
                <th className="px-4 py-3 text-center font-semibold">Exam (/70)</th>
                <th className="px-4 py-3 text-center font-semibold">Total (/100)</th>
                <th className="px-4 py-3 text-center font-semibold">Grade</th>
                <th className="px-4 py-3 text-center font-semibold">Remark</th>
              </tr>
            </thead>
            <tbody>
              {result.scores.map(s => (
                <tr key={s.subjectId} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-800">{s.subjectName}</td>
                  <td className="px-4 py-3 text-center text-slate-700">{s.caScore}</td>
                  <td className="px-4 py-3 text-center text-slate-700">{s.examScore}</td>
                  <td className="px-4 py-3 text-center font-bold text-slate-800">{s.total}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${GRADE_COLORS[s.grade] || ''}`}>
                      {s.grade}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600">{s.remark}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 bg-slate-50">
              <tr>
                <td className="px-6 py-3 font-bold text-slate-800">Overall</td>
                <td colSpan={2}></td>
                <td className="px-4 py-3 text-center font-bold text-primary text-base">{result.average.toFixed(1)}%</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${GRADE_COLORS[result.average >= 80 ? 'A' : result.average >= 70 ? 'B' : result.average >= 60 ? 'C' : 'D']}`}>
                    {result.average >= 80 ? 'A' : result.average >= 70 ? 'B' : result.average >= 60 ? 'C' : 'D'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-slate-600 font-medium">
                  Rank {result.rank}/{result.totalStudents}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
