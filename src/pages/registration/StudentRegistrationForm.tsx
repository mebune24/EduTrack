import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, CheckCircle2 } from 'lucide-react';

const registrationSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female']),
  previousSchool: z.string().optional(),
  classAppliedFor: z.string().min(1, 'Class is required'),
  parentName: z.string().min(2, 'Parent/Guardian name is required'),
  parentEmail: z.string().email('Invalid email address'),
  parentPhone: z.string().min(6, 'Phone number is required'),
  address: z.string().min(5, 'Address is required'),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export function StudentRegistrationForm() {
  const { user } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      parentName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
      parentEmail: user?.email || '',
    }
  });

  const onSubmit = async (data: RegistrationFormValues) => {
    try {
      setError(null);
      await addDoc(collection(db, 'registrations'), {
        ...data,
        status: 'pending',
        submittedBy: user?.id || 'anonymous',
        createdAt: new Date().toISOString(),
      });
      setIsSubmitted(true);
      reset();
    } catch (err: any) {
      console.error("Error submitting registration", err);
      setError("Failed to submit registration. Please try again later.");
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-8 bg-white rounded-xl shadow-sm border border-slate-200 text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Registration Submitted!</h2>
        <p className="text-slate-600 mb-6">
          Your application has been received and is currently under review. 
          You will be notified once the administration approves the application.
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors"
        >
          Submit Another Application
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-4 mb-12">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">New Student Registration</h2>
            <p className="text-sm text-slate-500">Fill out the form below to apply for admission.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Student Details Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">Student Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                <input
                  {...register('firstName')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                />
                {errors.firstName && <p className="mt-1 text-sm text-destructive">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                <input
                  {...register('lastName')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                />
                {errors.lastName && <p className="mt-1 text-sm text-destructive">{errors.lastName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  {...register('dateOfBirth')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                />
                {errors.dateOfBirth && <p className="mt-1 text-sm text-destructive">{errors.dateOfBirth.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
                <select
                  {...register('gender')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                {errors.gender && <p className="mt-1 text-sm text-destructive">{errors.gender.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Class Applied For *</label>
                <select
                  {...register('classAppliedFor')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white"
                >
                  <option value="">Select Class</option>
                  <option value="form1">Form 1</option>
                  <option value="form2">Form 2</option>
                  <option value="form3">Form 3</option>
                  <option value="form4">Form 4</option>
                  <option value="form5">Form 5</option>
                  <option value="l6">Lower Sixth (L6)</option>
                  <option value="u6">Upper Sixth (U6)</option>
                </select>
                {errors.classAppliedFor && <p className="mt-1 text-sm text-destructive">{errors.classAppliedFor.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Previous School (Optional)</label>
                <input
                  {...register('previousSchool')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Parent/Guardian Details Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">Parent/Guardian Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                  {...register('parentName')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                />
                {errors.parentName && <p className="mt-1 text-sm text-destructive">{errors.parentName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  {...register('parentEmail')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                />
                {errors.parentEmail && <p className="mt-1 text-sm text-destructive">{errors.parentEmail.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  {...register('parentPhone')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                />
                {errors.parentPhone && <p className="mt-1 text-sm text-destructive">{errors.parentPhone.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Physical Address *</label>
                <textarea
                  {...register('address')}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                />
                {errors.address && <p className="mt-1 text-sm text-destructive">{errors.address.message}</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
