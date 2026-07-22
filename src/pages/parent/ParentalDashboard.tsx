import { useState } from 'react';
import {
  User, CreditCard, Award, Calendar, MessageSquare,
  TrendingUp, TrendingDown, Minus, ChevronDown, BookOpen
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

// ─── Mock data for the parent view ───────────────────────────────────────────
const CHILDREN = [
  { id: 'c1', name: 'Alice Mbah',  class: 'Form 1A', matricule: 'EDUT260001', avatar: 'AM' },
  { id: 'c2', name: 'Bob Mbah',    class: 'Form 3B', matricule: 'EDUT250017', avatar: 'BM' },
];

const MOCK_PERFORMANCE_DATA: Record<string, { term: string; average: number; rank: number }[]> = {
  c1: [
    { term: 'Term 1', average: 73.3, rank: 2 },
    { term: 'Term 2', average: 79.7, rank: 1 },
  ],
  c2: [
    { term: 'Term 1', average: 65.0, rank: 8 },
    { term: 'Term 2', average: 68.5, rank: 6 },
  ],
};

const MOCK_FEE_STATUS: Record<string, { totalFee: number; totalPaid: number; term: string }> = {
  c1: { totalFee: 95000, totalPaid: 50000, term: 'Term 2' },
  c2: { totalFee: 100000, totalPaid: 100000, term: 'Term 2' },
};

const MOCK_RECENT_EVENTS = [
  { date: '2026-07-14', title: 'Term 2 Exams Begin' },
  { date: '2026-07-20', title: 'Independence Day Holiday' },
  { date: '2026-07-24', title: 'Inter-House Sports Day' },
  { date: '2026-07-27', title: 'PTA Meeting' },
];

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
  const [selectedChildId, setSelectedChildId] = useState(CHILDREN[0].id);
  const child = CHILDREN.find(c => c.id === selectedChildId)!;
  const performance = MOCK_PERFORMANCE_DATA[selectedChildId] ?? [];
  const latestPerf = performance[performance.length - 1];
  const prevPerf = performance[performance.length - 2];
  const fee = MOCK_FEE_STATUS[selectedChildId];
  const balance = fee.totalFee - fee.totalPaid;
  const avgDelta = latestPerf && prevPerf ? (latestPerf.average - prevPerf.average).toFixed(1) : null;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Parent Dashboard</h1>
          <p className="text-slate-600">Monitor your child's progress and school status.</p>
        </div>

        {/* Child selector */}
        {CHILDREN.length > 1 && (
          <div className="relative w-52">
            <select
              className="w-full border border-slate-300 rounded-xl pl-10 pr-8 py-2.5 text-sm bg-white appearance-none font-medium"
              value={selectedChildId}
              onChange={e => setSelectedChildId(e.target.value)}
            >
              {CHILDREN.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <User className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <ChevronDown className="absolute right-2.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Child Info Banner */}
      <div className="bg-gradient-to-r from-primary to-blue-700 text-white rounded-2xl p-6 mb-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold shrink-0">
          {child.avatar}
        </div>
        <div>
          <h2 className="text-xl font-bold">{child.name}</h2>
          <p className="text-blue-200 text-sm">{child.class} · Matricule: {child.matricule}</p>
          {latestPerf && (
            <p className="text-blue-100 text-sm mt-1">
              Latest average: <strong>{latestPerf.average.toFixed(1)}%</strong> · Rank: <strong>#{latestPerf.rank}</strong>
            </p>
          )}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Average</p>
            <Award className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{latestPerf?.average.toFixed(1) ?? '—'}%</p>
          {avgDelta && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${parseFloat(avgDelta) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendIcon current={latestPerf?.average ?? 0} previous={prevPerf?.average} />
              {parseFloat(avgDelta) >= 0 ? '+' : ''}{avgDelta}% from last term
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Class Rank</p>
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-slate-800">#{latestPerf?.rank ?? '—'}</p>
          {latestPerf && prevPerf && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${latestPerf.rank < prevPerf.rank ? 'text-green-600' : latestPerf.rank > prevPerf.rank ? 'text-red-600' : 'text-slate-500'}`}>
              <TrendIcon current={-(latestPerf.rank)} previous={-(prevPerf.rank)} />
              {latestPerf.rank < prevPerf.rank ? `Up ${prevPerf.rank - latestPerf.rank} place${prevPerf.rank - latestPerf.rank > 1 ? 's' : ''}` :
               latestPerf.rank > prevPerf.rank ? `Down ${latestPerf.rank - prevPerf.rank} place${latestPerf.rank - prevPerf.rank > 1 ? 's' : ''}` : 'Same rank'}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Fees Paid</p>
            <CreditCard className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCFA(fee.totalPaid)}</p>
          <p className="text-xs text-slate-500 mt-1">of {formatCFA(fee.totalFee)}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Balance Due</p>
            <CreditCard className="w-4 h-4 text-red-500" />
          </div>
          <p className={`text-2xl font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {balance > 0 ? formatCFA(balance) : 'Cleared ✓'}
          </p>
          <p className="text-xs text-slate-500 mt-1">{fee.term}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance trend */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Academic Performance
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={performance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="term" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="average" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 5, fill: '#3b82f6' }} name="Average %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Upcoming events */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-slate-800">Upcoming Events</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {MOCK_RECENT_EVENTS.map((ev, i) => (
              <div key={i} className="px-4 py-3 flex items-start gap-3">
                <div className="bg-primary/10 text-primary rounded-lg p-2 shrink-0 text-center min-w-[44px]">
                  <p className="text-xs font-bold leading-none">{new Date(ev.date).toLocaleDateString('en', { month: 'short' })}</p>
                  <p className="text-base font-bold leading-none mt-0.5">{new Date(ev.date).getDate()}</p>
                </div>
                <p className="text-sm text-slate-700 mt-1">{ev.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: CreditCard, label: 'Pay Fees',      path: '/fees',      color: 'text-green-600 bg-green-50 border-green-200' },
          { icon: Award,      label: 'View Results',  path: '/results',   color: 'text-blue-600 bg-blue-50 border-blue-200' },
          { icon: Calendar,   label: 'Timetable',     path: '/timetable', color: 'text-purple-600 bg-purple-50 border-purple-200' },
          { icon: MessageSquare, label: 'Complaints', path: '/complaints', color: 'text-orange-600 bg-orange-50 border-orange-200' },
        ].map(({ icon: Icon, label, color }) => (
          <button key={label} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-medium text-sm transition-all hover:shadow-md ${color}`}>
            <Icon className="w-6 h-6" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
