import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  setDoc,
  doc,
} from 'firebase/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { resolve } from 'path';

const __dirname = resolve(fileURLToPath(import.meta.url), '..', '..');

function loadEnv(): Record<string, string> {
  const envPath = resolve(__dirname, '.env');
  const content = readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    env[key] = value;
  }
  return env;
}

const env = loadEnv();
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY!,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN!,
  projectId: env.VITE_FIREBASE_PROJECT_ID!,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID!,
  appId: env.VITE_FIREBASE_APP_ID!,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log('Seeding Firestore...\n');

  const now = new Date().toISOString();

  // ─── USERS ────────────────────────────────────────────────────────────────
  const users = [
    { firstName: 'Admin', lastName: 'User', email: 'admin@edutrack.com', role: 'admin', status: 'active' },
    { firstName: 'Bursar', lastName: 'User', email: 'bursar@edutrack.com', role: 'bursar', status: 'active' },
    { firstName: 'Registrar', lastName: 'User', email: 'registrar@edutrack.com', role: 'teacher', status: 'active' },
    { firstName: 'Teacher', lastName: 'User', email: 'teacher@edutrack.com', role: 'teacher', status: 'active' },
    { firstName: 'Parent', lastName: 'User', email: 'parent@edutrack.com', role: 'parent', status: 'active' },
    { firstName: 'John', lastName: 'Doe', email: 'student@edutrack.com', role: 'student', status: 'active' },
  ];

  const userIds: Record<string, string> = {};
  for (const user of users) {
    const ref = await addDoc(collection(db, 'users'), {
      ...user,
      createdAt: serverTimestamp(),
    });
    userIds[user.email] = ref.id;
    console.log(`[users] ${ref.id} → ${user.email}`);
  }

  // ─── REGISTRATIONS ────────────────────────────────────────────────────────
  const registrations = [
    {
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: '2010-05-15',
      gender: 'female',
      previousSchool: 'Greenfield Primary',
      classAppliedFor: 'form1',
      parentName: 'Sarah Smith',
      parentEmail: 'parent@edutrack.com',
      parentPhone: '+237 670 000 001',
      address: '123 Main St, Yaoundé',
      status: 'pending',
      createdAt: serverTimestamp(),
    },
    {
      firstName: 'Michael',
      lastName: 'Johnson',
      dateOfBirth: '2009-03-22',
      gender: 'male',
      previousSchool: 'Sunrise Academy',
      classAppliedFor: 'form2',
      parentName: 'Robert Johnson',
      parentEmail: 'parent2@edutrack.com',
      parentPhone: '+237 670 000 002',
      address: '456 Oak Ave, Douala',
      status: 'pending',
      createdAt: serverTimestamp(),
    },
  ];

  for (const reg of registrations) {
    const ref = await addDoc(collection(db, 'registrations'), reg);
    console.log(`[registrations] ${ref.id} → ${reg.firstName} ${reg.lastName}`);
  }

  // ─── FEE STRUCTURES ───────────────────────────────────────────────────────
  const feeStructures = [
    {
      classId: 'form1',
      academicYear: '2025/2026',
      term: 'Term 1',
      items: [
        { id: '1', label: 'Tuition', amount: 150000 },
        { id: '2', label: 'PTA Levy', amount: 15000 },
        { id: '3', label: 'ICT Fee', amount: 20000 },
      ],
      totalAmount: 185000,
      updatedAt: serverTimestamp(),
    },
    {
      classId: 'form2',
      academicYear: '2025/2026',
      term: 'Term 1',
      items: [
        { id: '1', label: 'Tuition', amount: 160000 },
        { id: '2', label: 'PTA Levy', amount: 15000 },
        { id: '3', label: 'ICT Fee', amount: 20000 },
      ],
      totalAmount: 195000,
      updatedAt: serverTimestamp(),
    },
  ];

  for (const fee of feeStructures) {
    const id = `${fee.classId}-${fee.academicYear.replace('/', '-')}-${fee.term.replace(' ', '')}`;
    await setDoc(doc(db, 'feeStructures', id), fee);
    console.log(`[feeStructures] ${id}`);
  }

  // ─── PAYMENTS ─────────────────────────────────────────────────────────────
  const payments = [
    {
      studentId: userIds['student@edutrack.com'],
      studentName: 'John Doe',
      feeStructureId: 'form1-2025-2026-Term1',
      amountPaid: 100000,
      method: 'momo',
      status: 'confirmed',
      reference: 'MOMO-2025-001',
      paidAt: serverTimestamp(),
      confirmedAt: serverTimestamp(),
    },
    {
      studentId: userIds['student@edutrack.com'],
      studentName: 'John Doe',
      feeStructureId: 'form1-2025-2026-Term1',
      amountPaid: 85000,
      method: 'orange_money',
      status: 'pending',
      reference: 'OM-2025-002',
      paidAt: serverTimestamp(),
    },
  ];

  for (const payment of payments) {
    const ref = await addDoc(collection(db, 'payments'), payment);
    console.log(`[payments] ${ref.id} → ${payment.reference}`);
  }

  // ─── RESULTS ──────────────────────────────────────────────────────────────
  const results = [
    {
      studentId: userIds['student@edutrack.com'],
      studentName: 'John Doe',
      classId: 'form1',
      streamId: 'A',
      academicYear: '2025/2026',
      term: 'Term 1',
      scores: [
        { subjectId: 'math', subjectName: 'Mathematics', caScore: 25, examScore: 55, total: 80, grade: 'A', remark: 'Excellent' },
        { subjectId: 'eng', subjectName: 'English', caScore: 22, examScore: 48, total: 70, grade: 'B', remark: 'Very Good' },
        { subjectId: 'sci', subjectName: 'Science', caScore: 20, examScore: 50, total: 70, grade: 'B', remark: 'Very Good' },
      ],
      totalMarks: 220,
      average: 73.3,
      rank: 2,
      totalStudents: 45,
      status: 'published',
      createdAt: serverTimestamp(),
      publishedAt: serverTimestamp(),
    },
    {
      studentId: userIds['student@edutrack.com'],
      studentName: 'John Doe',
      classId: 'form1',
      streamId: 'A',
      academicYear: '2025/2026',
      term: 'Term 1',
      scores: [
        { subjectId: 'math', subjectName: 'Mathematics', caScore: 20, examScore: 45, total: 65, grade: 'C', remark: 'Good' },
        { subjectId: 'eng', subjectName: 'English', caScore: 18, examScore: 40, total: 58, grade: 'D', remark: 'Fair' },
      ],
      totalMarks: 123,
      average: 61.5,
      status: 'draft',
      createdAt: serverTimestamp(),
    },
  ];

  for (const result of results) {
    const docId = `${result.studentId}-${result.academicYear.replace('/', '-')}-${result.term.replace(' ', '')}`;
    await setDoc(doc(db, 'results', docId), result, { merge: true });
    console.log(`[results] ${docId}`);
  }

  // ─── COMPLAINTS ───────────────────────────────────────────────────────────
  const complaint = {
    ticketNo: 'TKT-2025-001',
    title: 'Missing score in Mathematics',
    description: 'My score for the continuous assessment was not recorded correctly.',
    category: 'academic',
    priority: 'medium',
    status: 'open',
    submittedBy: userIds['student@edutrack.com'],
    submitterName: 'John Doe',
    submitterRole: 'student',
    messages: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const complaintRef = await addDoc(collection(db, 'complaints'), complaint);
  console.log(`[complaints] ${complaintRef.id} → ${complaint.ticketNo}`);

  // ─── TIMETABLES ───────────────────────────────────────────────────────────
  const timetable = {
    classId: 'form1',
    streamId: 'A',
    academicYear: '2025/2026',
    slots: [
      { id: '1', day: 'Monday', startTime: '08:00', endTime: '09:00', subject: 'Mathematics', teacherName: 'Mr. Kamga', room: 'Room 101' },
      { id: '2', day: 'Monday', startTime: '09:00', endTime: '10:00', subject: 'English', teacherName: 'Ms. Fong', room: 'Room 102' },
      { id: '3', day: 'Tuesday', startTime: '08:00', endTime: '09:00', subject: 'Science', teacherName: 'Mr. Nkeng', room: 'Lab 1' },
    ],
    updatedAt: serverTimestamp(),
  };

  const timetableId = `${timetable.classId}-${timetable.streamId}-${timetable.academicYear.replace('/', '-')}`;
  await setDoc(doc(db, 'timetables', timetableId), timetable);
  console.log(`[timetables] ${timetableId}`);

  // ─── EVENTS ───────────────────────────────────────────────────────────────
  const events = [
    {
      title: 'Mid-Term Examinations',
      description: 'Mid-term examinations for all classes.',
      category: 'academic',
      startDate: '2025-11-10',
      endDate: '2025-11-15',
      allDay: true,
      location: 'School Hall',
      createdBy: userIds['admin@edutrack.com'],
      createdAt: serverTimestamp(),
    },
    {
      title: 'Sports Day',
      description: 'Annual sports competition between classes.',
      category: 'sports',
      startDate: '2025-12-05',
      endDate: '2025-12-05',
      allDay: true,
      createdBy: userIds['admin@edutrack.com'],
      createdAt: serverTimestamp(),
    },
  ];

  for (const event of events) {
    const ref = await addDoc(collection(db, 'events'), event);
    console.log(`[events] ${ref.id} → ${event.title}`);
  }

  // ─── NOTIFICATIONS ────────────────────────────────────────────────────────
  const notifications = [
    {
      recipientId: userIds['student@edutrack.com'],
      type: 'results_published',
      title: 'Results Published',
      message: 'Your Term 1 results have been published.',
      link: '/results',
      read: false,
      createdAt: serverTimestamp(),
    },
    {
      recipientId: userIds['student@edutrack.com'],
      type: 'payment_confirmed',
      title: 'Payment Confirmed',
      message: 'Your payment of 100,000 XAF has been confirmed.',
      read: true,
      createdAt: serverTimestamp(),
    },
  ];

  for (const notif of notifications) {
    const ref = await addDoc(collection(db, 'notifications'), notif);
    console.log(`[notifications] ${ref.id} → ${notif.title}`);
  }

  console.log('\n✅ Seeding complete!');
}

seed().catch(error => {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
});
