import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { StudentRegistrationForm } from './pages/registration/StudentRegistrationForm';
import { RegistrationApprovals } from './pages/admin/RegistrationApprovals';
import { ClassManagement } from './pages/admin/ClassManagement';
import { ClassRegister } from './pages/shared/ClassRegister';
import { StudentFeeView } from './pages/fees/StudentFeeView';
import { FeeStructureAdmin } from './pages/admin/FeeStructureAdmin';
import { ScoreEntry } from './pages/results/ScoreEntry';
import { StudentResultView } from './pages/results/StudentResultView';
import { ClassRanking } from './pages/results/ClassRanking';
import { TimetableView } from './pages/timetable/TimetableView';
import { TimetableAdmin } from './pages/timetable/TimetableAdmin';
import { EventsCalendar } from './pages/timetable/EventsCalendar';
import { ComplaintsHub } from './pages/complaints/ComplaintsHub';
import { ParentalDashboard } from './pages/parent/ParentalDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            
            {/* Parent/Student Routes */}
            <Route path="apply" element={<StudentRegistrationForm />} />
            
            {/* Admin & Bursar Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'bursar']} />}>
              <Route path="approvals" element={<RegistrationApprovals />} />
              <Route path="fee-structures" element={<FeeStructureAdmin />} />
            </Route>

            {/* Classes: admin/bursar manage, teacher/student/parent view */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'bursar', 'teacher', 'student', 'parent']} />}>
              <Route path="classes" element={<ClassManagement />} />
              <Route path="classes/:classId/streams/:streamId" element={<ClassRegister />} />
            </Route>

            {/* Student & Parent Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'student', 'bursar', 'parent']} />}>
              <Route path="fees" element={<StudentFeeView />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin', 'student', 'teacher', 'bursar', 'parent']} />}>
              <Route path="results" element={<StudentResultView />} />
            </Route>

            {/* All authenticated routes */}
            <Route path="ranking" element={<ClassRanking />} />
            <Route path="timetable" element={<TimetableView />} />
            <Route path="events" element={<EventsCalendar />} />
            <Route path="complaints" element={<ComplaintsHub />} />
            <Route path="settings" element={<div className="p-4">Settings Placeholder</div>} />

            {/* Teacher routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'teacher']} />}>
              <Route path="score-entry" element={<ScoreEntry />} />
              <Route path="timetable-admin" element={<TimetableAdmin />} />
            </Route>

            {/* Parent-specific routes */}
            <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
              <Route path="my-children" element={<ParentalDashboard />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
