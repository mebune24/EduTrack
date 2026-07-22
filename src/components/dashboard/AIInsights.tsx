import { useState } from 'react';
import { Sparkles, BookOpen, CreditCard, Target, RefreshCw } from 'lucide-react';

interface Insight {
  id: string;
  type: 'academic' | 'financial' | 'general';
  title: string;
  description: string;
}

const MOCK_INSIGHTS: Insight[] = [
  {
    id: '1',
    type: 'academic',
    title: 'Focus on Mathematics',
    description: 'Your Mathematics score dropped by 8% this term. Consider joining the Friday afternoon study group to improve your calculus fundamentals.',
  },
  {
    id: '2',
    type: 'financial',
    title: 'Upcoming Fee Deadline',
    description: 'You have an outstanding balance of 45,000 FCFA for Term 2. The deadline is in 14 days. Please remind your sponsor to avoid late penalties.',
  },
  {
    id: '3',
    type: 'general',
    title: 'Consistent Attendance',
    description: 'Great job! You have maintained a 98% attendance rate this term. Consistent attendance strongly correlates with academic success.',
  },
];

export function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateInsights = () => {
    setLoading(true);
    // Simulate network request to Cloud Function calling Gemini API
    setTimeout(() => {
      setInsights(MOCK_INSIGHTS);
      setLoading(false);
      setHasGenerated(true);
    }, 2500);
  };

  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'academic': return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'financial': return <CreditCard className="w-5 h-5 text-red-500" />;
      case 'general': return <Target className="w-5 h-5 text-green-500" />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
      {/* Decorative background effects */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            AI Study Assistant
          </h2>
          <p className="text-slate-400 text-sm mt-1">Personalised recommendations based on your performance.</p>
        </div>
        <button
          onClick={generateInsights}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-400" />
          )}
          {hasGenerated ? 'Refresh' : 'Generate'}
        </button>
      </div>

      <div className="relative z-10 min-h-[200px] flex flex-col justify-center">
        {loading ? (
          <div className="text-center py-8 space-y-4">
            <div className="inline-block relative">
              <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
              <div className="absolute inset-0 bg-amber-400 blur-xl opacity-30 animate-pulse" />
            </div>
            <p className="text-sm text-slate-300 animate-pulse">Analyzing your academic profile...</p>
          </div>
        ) : insights.length > 0 ? (
          <div className="space-y-3">
            {insights.map(insight => (
              <div key={insight.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="bg-white/10 p-2 rounded-lg shrink-0 h-fit">
                  {getIcon(insight.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100 text-sm mb-1">{insight.title}</h3>
                  <p className="text-slate-300 text-xs leading-relaxed">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-300 text-sm">Click generate to receive personalized study tips and alerts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
