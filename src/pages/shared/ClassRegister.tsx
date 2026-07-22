import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { StudentRegistration } from '../../types';
import { ArrowLeft, Download, Search, Users } from 'lucide-react';
import * as XLSX from 'xlsx';

export function ClassRegister() {
  const { classId, streamId } = useParams<{ classId: string; streamId: string }>();
  const [students, setStudents] = useState<StudentRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // In a real app, we'd query by classId and streamId. 
    // Here we're fetching active students.
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'registrations'), 
          where('status', '==', 'active')
        );
        const snapshot = await getDocs(q);
        const data: StudentRegistration[] = [];
        snapshot.forEach(doc => {
          const student = { id: doc.id, ...doc.data() } as StudentRegistration;
          // Temporary client-side filter since we don't have deep schema yet
          if (student.classAppliedFor === classId) {
            data.push(student);
          }
        });
        setStudents(data);
      } catch (err) {
        console.error("Error fetching class register", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, [classId, streamId]);

  const handleExport = () => {
    const exportData = students.map((s, index) => ({
      'S/N': index + 1,
      'Matricule': s.matricule || 'N/A',
      'First Name': s.firstName,
      'Last Name': s.lastName,
      'Gender': s.gender.toUpperCase(),
      'Parent Contact': s.parentPhone,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Register");
    
    // Generate file and trigger download
    XLSX.writeFile(workbook, `Class_Register_${classId}_${streamId}.xlsx`);
  };

  const filteredStudents = students.filter(s => 
    s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.matricule && s.matricule.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="mb-6">
        <Link to="/classes" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Classes
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 capitalize">
              {classId} - Stream {streamId?.toUpperCase()} Register
            </h1>
            <p className="text-slate-600">Total Students: {students.length}</p>
          </div>
          <button 
            onClick={handleExport}
            disabled={students.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export to Excel</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or matricule..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading register...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="p-3 bg-slate-100 text-slate-400 rounded-full mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No students found</h3>
            <p className="text-slate-500">There are no active students in this class matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium w-16">#</th>
                  <th className="px-6 py-4 font-medium">Matricule</th>
                  <th className="px-6 py-4 font-medium">Student Name</th>
                  <th className="px-6 py-4 font-medium">Gender</th>
                  <th className="px-6 py-4 font-medium">Parent Info</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, idx) => (
                  <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-500">{idx + 1}</td>
                    <td className="px-6 py-4 font-mono text-slate-600">
                      {student.matricule || <span className="text-slate-400 italic">Pending</span>}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {student.gender}
                    </td>
                    <td className="px-6 py-4">
                      <div>{student.parentName}</div>
                      <div className="text-xs text-slate-500">{student.parentPhone}</div>
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
