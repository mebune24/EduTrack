import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// ─── 1. Generate Matricule when registration is approved ──────────────────────
export const generateMatriculeOnApproval = functions.firestore
  .document('registrations/{regId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();

    if (newData.status === 'active' && previousData.status !== 'active' && !newData.matricule) {
      try {
        const currentYear = new Date().getFullYear().toString().slice(-2);
        const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
        const matricule = `EDUT${currentYear}${randomDigits}`;

        await change.after.ref.update({
          matricule,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        if (newData.submittedBy) {
          await db.collection('users').doc(newData.submittedBy).update({
            matricule,
            status: 'active',
          });
        }

        // Create a welcome notification for the student/parent
        await db.collection('notifications').add({
          recipientId: newData.submittedBy ?? null,
          type: 'registration_approved',
          title: 'Application Approved! 🎉',
          message: `${newData.firstName} ${newData.lastName}'s application has been approved. Matricule: ${matricule}`,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`Generated matricule ${matricule} for registration ${context.params.regId}`);
        return null;
      } catch (error) {
        console.error('Error generating matricule', error);
        return null;
      }
    }
    return null;
  });

// ─── 2. AI Recommendation Engine ──────────────────────────────────────────────
// Triggered when a student's result is published.
// Generates personalised academic recommendations using rule-based logic.
// In production, replace the rule engine with a Gemini/OpenAI API call.
export const generateAIRecommendation = functions.firestore
  .document('results/{resultId}')
  .onWrite(async (change, context) => {
    const data = change.after.data();
    if (!data || data.status !== 'published') return null;

    const previousData = change.before.data();
    // Only run when status changes TO published (avoid repeated triggers)
    if (previousData && previousData.status === 'published') return null;

    try {
      const { studentId, studentName, scores, average, rank, totalStudents, classId, term } = data;

      // ── Rule-based recommendation engine ──────────────────────────────────
      const insights: { type: string; title: string; description: string }[] = [];

      // Sort scores to find weakest and strongest subjects
      const sorted = [...(scores as any[])].sort((a, b) => a.total - b.total);
      const weakest = sorted[0];
      const strongest = sorted[sorted.length - 1];

      // Recommendation 1: Flag weakest subject
      if (weakest && weakest.total < 50) {
        insights.push({
          type: 'academic',
          title: `Improve your ${weakest.subjectName} score`,
          description: `Your ${weakest.subjectName} score is ${weakest.total}/100 (Grade ${weakest.grade}). Focus additional study time here — consider forming a study group or requesting extra tutorials from your teacher.`,
        });
      }

      // Recommendation 2: Celebrate strongest subject
      if (strongest && strongest.total >= 70) {
        insights.push({
          type: 'achievement',
          title: `Excellent work in ${strongest.subjectName}! 🌟`,
          description: `You scored ${strongest.total}/100 in ${strongest.subjectName}. Keep up this momentum — consider entering subject competitions or mentoring your peers.`,
        });
      }

      // Recommendation 3: Overall performance commentary
      if (average >= 75) {
        insights.push({
          type: 'general',
          title: 'Outstanding Overall Performance',
          description: `Your average of ${average.toFixed(1)}% places you at rank ${rank}/${totalStudents} in your class. You are well on track for distinction in your end-of-year exams.`,
        });
      } else if (average >= 55 && average < 75) {
        insights.push({
          type: 'general',
          title: 'Good Progress — Push for Excellence',
          description: `Your average of ${average.toFixed(1)}% is solid. Consistent revision, especially in your weaker subjects, could move you into the top 5 of your class by the next term.`,
        });
      } else {
        insights.push({
          type: 'general',
          title: 'Attention Required — Let\'s Improve Together',
          description: `Your current average of ${average.toFixed(1)}% requires attention. We recommend scheduling a meeting with your form master and creating a structured revision plan for the upcoming term.`,
        });
      }

      // Recommendation 4: CA vs Exam imbalance
      const caUnderachievers = (scores as any[]).filter(s => s.caScore < 15 && s.examScore > 45);
      if (caUnderachievers.length >= 2) {
        insights.push({
          type: 'academic',
          title: 'Improve Your Continuous Assessment (CA) Scores',
          description: `Your exam scores are strong, but your CA performance is dragging down your totals in ${caUnderachievers.length} subjects. Focus on submitting all assignments on time and participating actively in class.`,
        });
      }

      // ── Save recommendation to Firestore ────────────────────────────────
      await db.collection('ai_recommendations').add({
        studentId,
        studentName,
        classId,
        term,
        resultId: context.params.resultId,
        insights,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // ── Notify the student ───────────────────────────────────────────────
      await db.collection('notifications').add({
        recipientId: studentId,
        type: 'results_published',
        title: `Your ${term} Results are Ready 📊`,
        message: `Your ${term} results have been published. Average: ${average.toFixed(1)}% · Rank: ${rank}/${totalStudents}. Check your personalized AI insights!`,
        link: '/results',
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`AI recommendation generated for student ${studentId}, term ${term}`);
      return null;
    } catch (error) {
      console.error('Error generating AI recommendation', error);
      return null;
    }
  });

// ─── 3. Fee Payment Webhook ───────────────────────────────────────────────────
// Called by a payment gateway (MoMo/Orange) to confirm a payment.
export const confirmPaymentWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { transactionId, status, reference } = req.body;

  if (!transactionId || !status) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    // Find and update the transaction
    const txnQuery = await db.collection('transactions')
      .where('reference', '==', reference)
      .limit(1)
      .get();

    if (txnQuery.empty) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    const txnDoc = txnQuery.docs[0];
    const txnData = txnDoc.data();

    await txnDoc.ref.update({
      status: status === 'SUCCESS' ? 'confirmed' : 'failed',
      confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
      gatewayTransactionId: transactionId,
    });

    // Notify the student/parent
    if (status === 'SUCCESS') {
      await db.collection('notifications').add({
        recipientId: txnData.studentId,
        type: 'payment_confirmed',
        title: 'Payment Confirmed ✅',
        message: `Payment of ${txnData.amountPaid} FCFA has been confirmed. Reference: ${reference}`,
        link: '/fees',
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error confirming payment', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── 4. Admin Stats aggregation (callable) ───────────────────────────────────
// Returns real-time KPI stats for the admin dashboard.
export const getAdminStats = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated.');
  }

  try {
    const [studentsSnap, pendingSnap, classesSnap] = await Promise.all([
      db.collection('registrations').where('status', '==', 'active').get(),
      db.collection('registrations').where('status', '==', 'pending').get(),
      db.collection('classes').get(),
    ]);

    return {
      totalStudents: studentsSnap.size,
      pendingApprovals: pendingSnap.size,
      totalClasses: classesSnap.size,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Failed to fetch stats.');
  }
});
