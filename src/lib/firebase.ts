/**
 * firebase.ts
 * ============================================================
 * Central Firebase service layer for EduTrack.
 * Import helpers from this file instead of calling Firebase
 * SDK methods directly throughout the app.
 * ============================================================
 */

import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User,
  type UserCredential,
  type Unsubscribe,
} from "firebase/auth";

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  writeBatch,
  type DocumentReference,
} from "firebase/firestore";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import { getFunctions, httpsCallable } from "firebase/functions";

import type {
  Role,
  StudentRegistration,
  FeeStructure,
  PaymentTransaction,
  StudentResult,
  Complaint,
  ComplaintMessage,
  ComplaintStatus,
  TimetableSlot,
  SchoolEvent,
  AppNotification,
  PaymentStatus,
  ResultStatus,
} from "../types";

// ─── Firebase Config (reads from .env) ───────────────────────────────────────

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Prevent re-initializing on Vite hot-reload
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// ─── Collection Names ─────────────────────────────────────────────────────────

export const COLLECTIONS = {
  USERS: "users",
  REGISTRATIONS: "registrations",
  FEE_STRUCTURES: "feeStructures",
  PAYMENTS: "payments",
  RESULTS: "results",
  COMPLAINTS: "complaints",
  TIMETABLES: "timetables",
  EVENTS: "events",
  NOTIFICATIONS: "notifications",
  CLASSES: "classes",
} as const;

// ─── Local types ─────────────────────────────────────────────────────────────

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  AUTH HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Sign in an existing user with email and password. */
export async function signIn(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

/** Register a new user and save their profile to Firestore. */
export async function registerUser({
  firstName, lastName, email, password, role,
}: RegisterData): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, COLLECTIONS.USERS, credential.user.uid), {
    firstName,
    lastName,
    email,
    role,
    status: role === "student" ? "pending" : "active",
    createdAt: serverTimestamp(),
  });
  return credential;
}

/** Sign out the currently authenticated user. */
export async function signOut(): Promise<void> {
  return firebaseSignOut(auth);
}

/** Send a password-reset email. */
export async function resetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}

/** Change the current user's password (requires recent sign-in). */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const user = auth.currentUser;
  if (!user?.email) throw new Error("No authenticated user.");
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  return updatePassword(user, newPassword);
}

/** Subscribe to auth state changes. Returns an unsubscribe function. */
export function subscribeToAuthState(
  callback: (user: User | null) => void,
): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  USER PROFILE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Fetch a single user profile from Firestore. */
export async function getUserProfile(uid: string): Promise<Record<string, unknown> | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Update fields on a user profile. */
export async function updateUserProfile(
  uid: string,
  updates: Record<string, unknown>,
): Promise<void> {
  return updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/** Fetch all users, optionally filtered by role. */
export async function getAllUsers(role: Role | null = null): Promise<Record<string, unknown>[]> {
  const colRef = collection(db, COLLECTIONS.USERS);
  const q = role
    ? query(colRef, where("role", "==", role), orderBy("lastName"))
    : query(colRef, orderBy("lastName"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ═══════════════════════════════════════════════════════════════════════════════
//  STUDENT REGISTRATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Submit a new student registration application. */
export async function submitRegistration(
  data: Omit<StudentRegistration, "id" | "status" | "createdAt">,
): Promise<DocumentReference> {
  return addDoc(collection(db, COLLECTIONS.REGISTRATIONS), {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

/** Fetch all registrations, optionally filtered by status. */
export async function getRegistrations(
  status: StudentRegistration["status"] | null = null,
): Promise<Record<string, unknown>[]> {
  const colRef = collection(db, COLLECTIONS.REGISTRATIONS);
  const q = status
    ? query(colRef, where("status", "==", status), orderBy("createdAt", "desc"))
    : query(colRef, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Approve or reject a registration. */
export async function updateRegistrationStatus(
  registrationId: string,
  newStatus: StudentRegistration["status"],
  matricule?: string,
): Promise<void> {
  const updates: Record<string, unknown> = {
    status: newStatus,
    updatedAt: serverTimestamp(),
  };
  if (matricule) updates.matricule = matricule;
  return updateDoc(doc(db, COLLECTIONS.REGISTRATIONS, registrationId), updates);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  FEE STRUCTURE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Create or overwrite a fee structure for a class/term. */
export async function saveFeeStructure(
  id: string,
  data: Omit<FeeStructure, "id">,
): Promise<void> {
  return setDoc(doc(db, COLLECTIONS.FEE_STRUCTURES, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/** Get all fee structures, optionally filtered by academic year. */
export async function getFeeStructures(
  academicYear: string | null = null,
): Promise<Record<string, unknown>[]> {
  const colRef = collection(db, COLLECTIONS.FEE_STRUCTURES);
  const q = academicYear
    ? query(colRef, where("academicYear", "==", academicYear))
    : query(colRef);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Get a single fee structure by its Firestore document ID. */
export async function getFeeStructure(
  id: string,
): Promise<Record<string, unknown> | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.FEE_STRUCTURES, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PAYMENT HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Record a new payment transaction. */
export async function recordPayment(
  data: Omit<PaymentTransaction, "id" | "status" | "paidAt">,
): Promise<DocumentReference> {
  return addDoc(collection(db, COLLECTIONS.PAYMENTS), {
    ...data,
    status: "pending" as PaymentStatus,
    paidAt: serverTimestamp(),
  });
}

/** Confirm a payment (bursar action). */
export async function confirmPayment(paymentId: string): Promise<void> {
  return updateDoc(doc(db, COLLECTIONS.PAYMENTS, paymentId), {
    status: "confirmed" as PaymentStatus,
    confirmedAt: serverTimestamp(),
  });
}

/** Get all payments for a specific student. */
export async function getStudentPayments(
  studentId: string,
): Promise<Record<string, unknown>[]> {
  const q = query(
    collection(db, COLLECTIONS.PAYMENTS),
    where("studentId", "==", studentId),
    orderBy("paidAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Get all payments, optionally filtered by status. */
export async function getAllPayments(
  status: PaymentStatus | null = null,
): Promise<Record<string, unknown>[]> {
  const colRef = collection(db, COLLECTIONS.PAYMENTS);
  const q = status
    ? query(colRef, where("status", "==", status), orderBy("paidAt", "desc"))
    : query(colRef, orderBy("paidAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ═══════════════════════════════════════════════════════════════════════════════
//  RESULTS HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Save (or update) a student result document.
 * Composite key: {studentId}-{academicYear}-{term}
 */
export async function saveResult(
  studentId: string,
  academicYear: string,
  term: string,
  data: Omit<StudentResult, "id">,
): Promise<void> {
  const docId = `${studentId}-${academicYear.replace("/", "-")}-${term.replace(" ", "")}`;
  return setDoc(
    doc(db, COLLECTIONS.RESULTS, docId),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

/** Get results for a class and term. */
export async function getClassResults(
  classId: string,
  term: string,
  status: ResultStatus | null = null,
): Promise<Record<string, unknown>[]> {
  let q = query(
    collection(db, COLLECTIONS.RESULTS),
    where("classId", "==", classId),
    where("term", "==", term),
  );
  if (status) q = query(q, where("status", "==", status));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Get all results for a specific student. */
export async function getStudentResults(
  studentId: string,
): Promise<Record<string, unknown>[]> {
  const q = query(
    collection(db, COLLECTIONS.RESULTS),
    where("studentId", "==", studentId),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Publish all draft results for a class/term in a single batch write. */
export async function publishResults(resultIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  resultIds.forEach(id => {
    batch.update(doc(db, COLLECTIONS.RESULTS, id), {
      status: "published" as ResultStatus,
      publishedAt: serverTimestamp(),
    });
  });
  return batch.commit();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  COMPLAINTS HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Submit a new complaint. */
export async function submitComplaint(
  data: Omit<Complaint, "id" | "status" | "messages" | "createdAt" | "updatedAt">,
): Promise<DocumentReference> {
  return addDoc(collection(db, COLLECTIONS.COMPLAINTS), {
    ...data,
    status: "open" as ComplaintStatus,
    messages: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/** Add a reply message to an existing complaint thread. */
export async function addComplaintMessage(
  complaintId: string,
  message: Omit<ComplaintMessage, "id" | "sentAt">,
): Promise<void> {
  const ref = doc(db, COLLECTIONS.COMPLAINTS, complaintId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Complaint not found.");
  const existing: ComplaintMessage[] = snap.data().messages ?? [];
  return updateDoc(ref, {
    messages: [...existing, { ...message, sentAt: new Date().toISOString() }],
    updatedAt: serverTimestamp(),
  });
}

/** Update the status of a complaint. */
export async function updateComplaintStatus(
  complaintId: string,
  status: ComplaintStatus,
): Promise<void> {
  const updates: Record<string, unknown> = { status, updatedAt: serverTimestamp() };
  if (status === "resolved") updates.resolvedAt = serverTimestamp();
  return updateDoc(doc(db, COLLECTIONS.COMPLAINTS, complaintId), updates);
}

/** Get all complaints, newest first. */
export async function getAllComplaints(): Promise<Record<string, unknown>[]> {
  const q = query(
    collection(db, COLLECTIONS.COMPLAINTS),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TIMETABLE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Save a class timetable (upsert). */
export async function saveTimetable(
  classId: string,
  streamId: string,
  academicYear: string,
  slots: TimetableSlot[],
): Promise<void> {
  const id = `${classId}-${streamId}-${academicYear.replace("/", "-")}`;
  return setDoc(doc(db, COLLECTIONS.TIMETABLES, id), {
    classId, streamId, academicYear, slots,
    updatedAt: serverTimestamp(),
  });
}

/** Fetch a timetable for a specific class/stream/year. */
export async function getTimetable(
  classId: string,
  streamId: string,
  academicYear: string,
): Promise<Record<string, unknown> | null> {
  const id = `${classId}-${streamId}-${academicYear.replace("/", "-")}`;
  const snap = await getDoc(doc(db, COLLECTIONS.TIMETABLES, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  EVENTS HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Create a new school event. */
export async function createEvent(
  data: Omit<SchoolEvent, "id">,
): Promise<DocumentReference> {
  return addDoc(collection(db, COLLECTIONS.EVENTS), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

/** Get all upcoming events ordered by start date. */
export async function getEvents(
  maxResults = 50,
): Promise<Record<string, unknown>[]> {
  const q = query(
    collection(db, COLLECTIONS.EVENTS),
    orderBy("startDate"),
    limit(maxResults),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Delete a school event. */
export async function deleteEvent(eventId: string): Promise<void> {
  return deleteDoc(doc(db, COLLECTIONS.EVENTS, eventId));
}

// ═══════════════════════════════════════════════════════════════════════════════
//  NOTIFICATIONS HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Send an in-app notification to a user. */
export async function sendNotification(
  data: Omit<AppNotification, "id" | "read" | "createdAt">,
): Promise<DocumentReference> {
  return addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  });
}

/** Fetch unread notifications for a user. */
export async function getUnreadNotifications(
  recipientId: string,
): Promise<Record<string, unknown>[]> {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where("recipientId", "==", recipientId),
    where("read", "==", false),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Mark a notification as read. */
export async function markNotificationRead(notificationId: string): Promise<void> {
  return updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationId), { read: true });
}

/** Live-subscribe to a user's notifications. Returns an unsubscribe function. */
export function subscribeToNotifications(
  recipientId: string,
  callback: (notifications: Record<string, unknown>[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where("recipientId", "==", recipientId),
    orderBy("createdAt", "desc"),
    limit(20),
  );
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Upload a file to Firebase Storage and return its download URL.
 * @param file  Browser File object
 * @param path  Storage path e.g. "receipts/studentId/file.pdf"
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

/** Delete a file from Firebase Storage by its storage path. */
export async function deleteFile(path: string): Promise<void> {
  return deleteObject(ref(storage, path));
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CLOUD FUNCTIONS HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Call a named Firebase Cloud Function and return its response data. */
export async function callFunction<TData = unknown, TResult = unknown>(
  name: string,
  data: TData = {} as TData,
): Promise<TResult> {
  const fn = httpsCallable<TData, TResult>(functions, name);
  const result = await fn(data);
  return result.data;
}
