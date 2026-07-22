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
            
            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'bursar']} />}>
              <Route path="approvals" element={<RegistrationApprovals />} />
              <Route path="classes" element={<ClassManagement />} />
              <Route path="classes/:classId/streams/:streamId" element={<ClassRegister />} />
            </Route>

            <Route path="students" element={<div className="p-4">Students Placeholder</div>} />
            {/* Admin-only Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'bursar']} />}>
              <Route path="fee-structures" element={<FeeStructureAdmin />} />
            </Route>

            <Route path="fees" element={<StudentFeeView />} />
            <Route path="results" element={<StudentResultView />} />
            <Route path="ranking" element={<ClassRanking />} />

            {/* Teacher routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'teacher']} />}>
              <Route path="score-entry" element={<ScoreEntry />} />
            </Route>

            <Route path="timetable" element={<TimetableView />} />
            <Route path="events" element={<EventsCalendar />} />
            {/* Admin timetable builder */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'teacher']} />}>
              <Route path="timetable-admin" element={<TimetableAdmin />} />
            </Route>
            <Route path="complaints" element={<ComplaintsHub />} />

            {/* Parent-specific routes */}
            <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
              <Route path="my-children" element={<ParentalDashboard />} />
            </Route>

            <Route path="settings" element={<div className="p-4">Settings Placeholder</div>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
