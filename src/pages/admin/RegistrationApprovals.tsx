import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { StudentRegistration } from '../../types';
import { CheckCircle, XCircle } from 'lucide-react';

export function RegistrationApprovals() {
  const [registrations, setRegistrations] = useState<StudentRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingRegistrations = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'registrations'), where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);
      const data: StudentRegistration[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as StudentRegistration);
      });
      setRegistrations(data);
    } catch (err: any) {
      console.error("Error fetching registrations", err);
      setError("Failed to load pending registrations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRegistrations();
  }, []);

  const handleApprove = async (id: string, reg: StudentRegistration) => {
    try {
      const docRef = doc(db, 'registrations', id);
      await updateDoc(docRef, { 
        status: 'active',
        matricule: reg.matricule || `MAT-${Date.now().toString().slice(-6)}`
      });

      // If the student registered an account, update their classId
      const userQuery = query(collection(db, 'users'), where('email', '==', reg.parentEmail));
      const userSnap = await getDocs(userQuery);
      if (!userSnap.empty) {
        const userData = userSnap.docs[0];
        await updateDoc(userData.ref, { 
          classId: reg.classAppliedFor,
          status: 'active'
        });
      }

      setRegistrations(registrations.filter(r => r.id !== id));
    } catch (err) {
      console.error("Error approving", err);
      alert("Failed to approve registration");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const docRef = doc(db, 'registrations', id);
      await updateDoc(docRef, { status: 'suspended' });
      setRegistrations(registrations.filter(r => r.id !== id));
    } catch (err) {
      console.error("Error rejecting", err);
      alert("Failed to reject registration");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading registrations...</div>;
  if (error) return <div className="p-8 text-center text-destructive">{error}</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Registration Approvals</h1>
        <p className="text-slate-600">Review and approve new student applications.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {registrations.length === 0 ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center">
            <CheckCircle className="w-12 h-12 text-green-500 mb-3 opacity-50" />
            <p>No pending registrations at the moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Student Name</th>
                  <th className="px-6 py-4 font-medium">Class</th>
                  <th className="px-6 py-4 font-medium">Parent Contact</th>
                  <th className="px-6 py-4 font-medium">Date Applied</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => (
                  <tr key={reg.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {reg.firstName} {reg.lastName}
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {reg.classAppliedFor}
                    </td>
                    <td className="px-6 py-4">
                      <div>{reg.parentName}</div>
                      <div className="text-xs text-slate-500">{reg.parentEmail}</div>
                      <div className="text-xs text-slate-500">{reg.parentPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(reg.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleApprove(reg.id!, reg)}
                          className="p-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleReject(reg.id!)}
                          className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
