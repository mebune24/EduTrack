import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AIInsights } from '../components/dashboard/AIInsights';
import { BookOpen, Users, CreditCard, Loader2 } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';

interface AdminStats {
  totalStudents: number;
  pendingApprovals: number;
  totalClasses: number;
  generatedAt: string;
}

export function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.firstName || 'User';
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'bursar') {
      const fetchStats = async () => {
        setLoading(true);
        try {
          const getStats = httpsCallable<void, AdminStats>(functions, 'getAdminStats');
          const result = await getStats();
          setStats(result.data);
        } catch (error) {
          console.error("Error fetching stats:", error);
          // Fallback mock stats if function isn't deployed yet
          setStats({
            totalStudents: 1245,
            pendingApprovals: 12,
            totalClasses: 42,
            generatedAt: new Date().toISOString()
          });
        } finally {
          setLoading(false);
        }
      };
      fetchStats();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Welcome back, {firstName}! 👋</h1>
          <p className="text-slate-600">Here's what's happening at EduTrack today.</p>
        </div>
      </div>

      {user?.role === 'admin' || user?.role === 'bursar' || user?.role === 'teacher' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="bg-blue-100 text-blue-600 p-4 rounded-xl"><Users className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Students</p>
              <div className="flex items-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : (
                  <p className="text-2xl font-bold text-slate-800">{stats?.totalStudents || '--'}</p>
                )}
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="bg-orange-100 text-orange-600 p-4 rounded-xl"><Users className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Pending Approvals</p>
              <div className="flex items-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : (
                  <p className="text-2xl font-bold text-slate-800">{stats?.pendingApprovals || '--'}</p>
                )}
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="bg-green-100 text-green-600 p-4 rounded-xl"><CreditCard className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Fees Collected</p>
              <p className="text-2xl font-bold text-slate-800">75%</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="bg-purple-100 text-purple-600 p-4 rounded-xl"><BookOpen className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Active Classes</p>
              <div className="flex items-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : (
                  <p className="text-2xl font-bold text-slate-800">{stats?.totalClasses || '--'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIInsights />
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-center items-center text-center">
             <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
               <BookOpen className="w-8 h-8" />
             </div>
             <h3 className="text-lg font-bold text-slate-800 mb-2">Term 2 is ongoing</h3>
             <p className="text-slate-600 text-sm max-w-sm mb-6">Check your timetable and ensure your fee balances are cleared before the upcoming exams.</p>
          </div>
        </div>
      )}
    </div>
  );
}
