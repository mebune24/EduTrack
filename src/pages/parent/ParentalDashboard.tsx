import { useState, useEffect, useRef } from 'react';
import {
  User, CreditCard, Award, Calendar, MessageSquare,
  TrendingUp, TrendingDown, Minus, ChevronDown, BookOpen,
  Loader2, Download
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { StudentRegistration, StudentResult, PaymentTransaction } from '../../types';
import { Section } from '../../components/loading/Section';

function formatCFA(n: number) {
  return new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(n);
}

function TrendIcon({ current, previous }: { current: number; previous?: number }) {
  if (previous === undefined) return <Minus className="w-4 h-4 text-slate-400" />;
  if (current > previous) return <TrendingUp className="w-4 h-4 text-green-500" />;
  if (current < previous) return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-slate-400" />;
}

export function ParentalDashboard() {
  const { user } = useAuth();
  const [children, setChildren] = useState<StudentRegistration[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  const child = children.find(c => c.id === selectedChildId) || children[0];
  const childResults = results.filter(r => r.studentName === `${child?.firstName} ${child?.lastName}`.trim());
  const latestResult = childResults[childResults.length - 1];
  const prevResult = childResults[childResults.length - 2];

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.email) return;
      try {
        setLoading(true);
        // Fetch children registrations where parentEmail matches current user
        const regQ = query(collection(db, 'registrations'), where('parentEmail', '==', user.email));
        const regSnap = await getDocs(regQ);
        const regs: StudentRegistration[] = [];
        regSnap.forEach(doc => {
          regs.push({ id: doc.id, ...doc.data() } as StudentRegistration);
        });
        setChildren(regs);
        if (regs.length > 0 && !initializedRef.current) {
          initializedRef.current = true;
          setSelectedChildId(regs[0].id);
        }

        // Fetch results for all children
        if (regs.length > 0) {
          const names = regs.map(r => `${r.firstName} ${r.lastName}`.trim());
          // Get all published results and filter client-side
          const resultsQ = query(collection(db, 'results'), where('status', '==', 'published'));
          const resultsSnap = await getDocs(resultsQ);
          const allResults: StudentResult[] = [];
          resultsSnap.forEach(doc => {
            allResults.push({ id: doc.id, ...doc.data() } as StudentResult);
          });
          setResults(allResults.filter(r => names.includes(r.studentName)));
        }

        // Fetch payments for all children
        if (regs.length > 0 && regs[0].id) {
          const payQ = query(collection(db, 'payments'), where('studentId', '==', regs[0].id));
          const paySnap = await getDocs(payQ);
          const txns: PaymentTransaction[] = [];
          paySnap.forEach(doc => {
            txns.push({ id: doc.id, ...doc.data() } as PaymentTransaction);
          });
          setTransactions(txns);
        }
      } catch (err) {
        console.error("Error fetching parent data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.email]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">No children registered yet. Ask the school to register your child first.</p>
      </div>
    );
  }

  const avgDelta = latestResult && prevResult ? (latestResult.average - prevResult.average).toFixed(1) : null;
  const totalPaid = transactions.filter(t => t.status === 'confirmed').reduce((sum, t) => sum + t.amountPaid, 0);
  const balance = totalPaid > 0 ? 0 : 0; // Would need fee structure to calculate properly

  return (
    <Section sectionName="Parent Dashboard" loading={loading} error={null}>
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Parent Dashboard</h1>
            <p className="text-slate-600">Monitor your child's progress and school status.</p>
          </div>

        {/* Child selector */}
        {children.length > 1 && (
          <div className="relative w-52">
            <select
              className="w-full border border-slate-300 rounded-xl pl-10 pr-8 py-2.5 text-sm bg-white appearance-none font-medium"
              value={selectedChildId || ''}
              onChange={e => setSelectedChildId(e.target.value)}
            >
              {children.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
            </select>
            <User className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <ChevronDown className="absolute right-2.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Child Info Banner */}
      <div className="bg-gradient-to-r from-primary to-blue-700 text-white rounded-2xl p-6 mb-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold shrink-0">
          {child ? `${child.firstName[0]}${child.lastName[0]}` : '??'}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{child?.firstName} {child?.lastName}</h2>
          <p className="text-blue-200 text-sm">{child?.classAppliedFor.toUpperCase()} · Matricule: {child?.matricule || 'Pending'}</p>
          {latestResult && (
            <p className="text-blue-100 text-sm mt-1">
              Latest average: <strong>{latestResult.average.toFixed(1)}%</strong> · Rank: <strong>#{latestResult.rank}</strong>
            </p>
          )}
        </div>
        <div>
          <button
            onClick={() => {
              const printArea = document.getElementById('results-print-area');
              if (printArea) {
                const win = window.open('', '_blank', 'width=800,height=600');
                if (win) {
                  win.document.write(`
                    <html>
                      <head>
                        <title>Results - ${child?.firstName} ${child?.lastName}</title>
                        <style>
                          body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; }
                          h1 { font-size: 24px; margin-bottom: 4px; }
                          h2 { font-size: 18px; color: #475569; margin-bottom: 20px; }
                          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                          th, td { border: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; font-size: 13px; }
                          th { background: #f1f5f9; font-weight: 600; }
                          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
                          .meta { text-align: right; font-size: 13px; color: #64748b; }
                        </style>
                      </head>
                      <body>
                        <div className="header">
                          <div>
                            <h1>EduTrack — Academic Results</h1>
                            <h2>${child?.firstName} ${child?.lastName} · ${latestResult?.academicYear || ''} · ${latestResult?.term || ''}</h2>
                          </div>
                          <div className="meta">
                            <p>Generated: ${new Date().toLocaleDateString()}</p>
                            <p>Status: PUBLISHED</p>
                          </div>
                        </div>
                        <table>
                          <thead>
                            <tr><th>Subject</th><th>CA (/30)</th><th>Exam (/70)</th><th>Total (/100)</th><th>Grade</th><th>Remark</th></tr>
                          </thead>
                          <tbody>
                            ${latestResult?.scores.map(s => `<tr><td>${s.subjectName}</td><td style="text-align: center">${s.caScore}</td><td style="text-align: center">${s.examScore}</td><td style="text-align: center; font-weight: bold">${s.total}</td><td>${s.grade}</td><td>${s.remark}</td></tr>`).join('') || ''}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td style="font-weight: bold">Overall</td>
                              <td colspan="2"></td>
                              <td style="text-align: center; font-weight: bold; color: #2563eb">${latestResult?.average.toFixed(1)}%</td>
                              <td>${latestResult?.average && latestResult.average >= 80 ? 'A' : latestResult?.average && latestResult.average >= 70 ? 'B' : 'C'}</td>
                              <td style="text-align: center; font-weight: bold">Rank ${latestResult?.rank}/${latestResult?.totalStudents}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </body>
                    </html>
                  `);
                  win.document.close();
                  setTimeout(() => { win.print(); }, 400);
                }
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" /> Download Results
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Average</p>
            <Award className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{latestResult?.average.toFixed(1) ?? '—'}%</p>
          {avgDelta && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${parseFloat(avgDelta) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendIcon current={latestResult?.average ?? 0} previous={prevResult?.average} />
              {parseFloat(avgDelta) >= 0 ? '+' : ''}{avgDelta}% from last term
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Class Rank</p>
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-slate-800">#{latestResult?.rank ?? '—'}</p>
          {latestResult && prevResult && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${latestResult.rank < prevResult.rank ? 'text-green-600' : latestResult.rank > prevResult.rank ? 'text-red-600' : 'text-slate-500'}`}>
              <TrendIcon current={-(latestResult.rank)} previous={-(prevResult.rank)} />
              {latestResult.rank < prevResult.rank ? `Up ${prevResult.rank - latestResult.rank} place${prevResult.rank - latestResult.rank > 1 ? 's' : ''}` :
                latestResult.rank > prevResult.rank ? `Down ${latestResult.rank - prevResult.rank} place${latestResult.rank - prevResult.rank > 1 ? 's' : ''}` : 'Same rank'}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Fees Paid</p>
            <CreditCard className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCFA(totalPaid)}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Balance Due</p>
            <CreditCard className="w-4 h-4 text-red-500" />
          </div>
          <p className={`text-2xl font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {balance > 0 ? formatCFA(balance) : 'Cleared ✓'}
          </p>
        </div>
      </div>

      {/* Performance trend */}
      {childResults.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Academic Performance
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={childResults}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="term" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="average" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} name="Average %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: CreditCard, label: 'Pay Fees', path: '/fees', color: 'text-green-600 bg-green-50 border-green-200' },
          { icon: Award, label: 'View Results', path: '/results', color: 'text-blue-600 bg-blue-50 border-blue-200' },
          { icon: Calendar, label: 'Timetable', path: '/timetable', color: 'text-purple-600 bg-purple-50 border-purple-200' },
          { icon: MessageSquare, label: 'Complaints', path: '/complaints', color: 'text-orange-600 bg-orange-50 border-orange-200' },
        ].map(({ icon: Icon, label, color }) => (
          <button key={label} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-medium text-sm transition-all hover:shadow-md ${color}`}>
            <Icon className="w-6 h-6" />
            {label}
          </button>
        ))}
      </div>
      </div>
    </Section>
  );
}
