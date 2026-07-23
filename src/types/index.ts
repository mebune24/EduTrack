export type Role = 'admin' | 'teacher' | 'bursar' | 'parent' | 'student';
export type StudentStatus = 'pending' | 'active' | 'graduated' | 'suspended';

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  status: StudentStatus;
  classId?: string;
  parentId?: string;
}

export interface StudentRegistration {
  id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  previousSchool?: string;
  classAppliedFor: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  address: string;
  status: StudentStatus;
  matricule?: string;
  createdAt: string;
}

export interface ClassStream {
  id: string;
  name: string; // e.g., 'A', 'B', 'Science', 'Arts'
  capacity: number;
}

export interface SchoolClass {
  id: string; // e.g., 'form1', 'form2'
  category: string; // e.g., 'Form 1', 'Lower Sixth'
  level: number;
  streams: ClassStream[];
}

export interface FeeItem {
  id: string;
  label: string; // e.g., 'Tuition', 'PTA Levy', 'ICT Fee'
  amount: number;
}

export interface FeeStructure {
  id: string;
  classId: string;        // e.g., 'form1'
  academicYear: string;   // e.g., '2025/2026'
  term: 'Term 1' | 'Term 2' | 'Term 3';
  items: FeeItem[];
  totalAmount: number;
}

export type PaymentMethod = 'momo' | 'orange_money' | 'card' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'processing' | 'confirmed' | 'failed';

export interface PaymentTransaction {
  id: string;
  studentId: string;
  studentName: string;
  feeStructureId: string;
  amountPaid: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string;       // e.g., MoMo transaction ID
  paidAt: string;
  confirmedAt?: string;
}

export interface StudentFeeBalance {
  studentId: string;
  classId: string;
  academicYear: string;
  term: string;
  totalFee: number;
  totalPaid: number;
  balance: number;
  transactions: PaymentTransaction[];
}

export interface SubjectScore {
  subjectId: string;
  subjectName: string;
  subject?: string;         // display name alias (same as subjectName, optional)
  caScore: number;       // Continuous Assessment (out of 30)
  examScore: number;     // Exam score (out of 70)
  total: number;         // total out of 100
  grade: string;         // A, B, C, D, E, F
  remark: string;        // Excellent, Very Good, etc.
}

export type ResultStatus = 'draft' | 'published';

export interface StudentResult {
  id?: string;
  studentId: string;
  studentName: string;
  classId: string;
  streamId: string;
  academicYear: string;
  term: 'Term 1' | 'Term 2' | 'Term 3';
  scores: SubjectScore[];
  totalMarks: number;
  average: number;
  rank?: number;
  totalStudents?: number;
  teacherId: string;
  status: ResultStatus;
  createdAt: string;
  publishedAt?: string;
}

// ─── Timetable ─────────────────────────────────────────────────────────────
export type Weekday = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export interface TimetableSlot {
  id: string;
  day: Weekday;
  startTime: string; // e.g. '08:00'
  endTime: string;   // e.g. '09:00'
  subject: string;
  teacherName: string;
  teacherId: string;
  room?: string;
}

export interface ClassTimetable {
  id: string;
  classId: string;
  streamId: string;
  academicYear: string;
  slots: TimetableSlot[];
}

// ─── Events ────────────────────────────────────────────────────────────────
export type EventCategory = 'academic' | 'cultural' | 'sports' | 'holiday' | 'meeting';

export interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  startDate: string; // ISO date string
  endDate: string;
  allDay: boolean;
  location?: string;
  createdBy: string;
}

// ─── Notifications ─────────────────────────────────────────────────────────
export type NotificationType =
  | 'registration_approved'
  | 'results_published'
  | 'payment_confirmed'
  | 'complaint_update'
  | 'general';

export interface AppNotification {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

// ─── Complaints ────────────────────────────────────────────────────────────
export type ComplaintCategory = 'academic' | 'financial' | 'disciplinary' | 'facility' | 'other';
export type ComplaintStatus = 'open' | 'in_review' | 'resolved' | 'closed';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ComplaintMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  message: string;
  sentAt: string;
}

export interface Complaint {
  id: string;
  ticketNo: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  submittedBy: string;
  submitterName: string;
  submitterRole: Role;
  assignedTo?: string;
  messages: ComplaintMessage[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}
