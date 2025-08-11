'use client';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, PasswordInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useResetPasswordMutation } from '@/store/api/authApi';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Validation schema for reset password form
const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const [resetPassword, { isLoading, isSuccess, error }] = useResetPasswordMutation();
  const [customError, setCustomError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Handle form submit and call the API
  const onSubmit = async (data: ResetPasswordFormData) => {
    setCustomError(null); // Reset error on new submit
    if (!token) {
      setCustomError('Invalid or missing token.');
      return;
    }
    try {
      await resetPassword({ token, password: data.password }).unwrap();
      reset();
      // Redirect to login page after success
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      // Show a user-friendly error message
      if (err?.data?.message) {
        setCustomError(err.data.message);
      } else {
        setCustomError('Failed to reset password. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="w-full max-w-sm mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-sm text-gray-500">
            Enter your new password below.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <PasswordInput
                  {...field}
                  placeholder="New Password"
                  size="large"
                  className="w-full"
                  error={errors.password?.message}
                />
              )}
            />
          </div>
          <div>
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <PasswordInput
                  {...field}
                  placeholder="Confirm Password"
                  size="large"
                  className="w-full"
                  error={errors.confirmPassword?.message}
                />
              )}
            />
          </div>
          {isSuccess && (
            <div className="text-green-600 text-center text-sm">Your password has been reset. Redirecting to login...</div>
          )}
          {(error || customError) && (
            <div className="text-red-500 text-center text-sm">{customError || (error as any)?.data?.message || 'Failed to reset password.'}</div>
          )}
          <div>
            <Button
              type="primary"
              size="large"
              className="w-full h-12"
              htmlType="submit"
              loading={isSubmitting || isLoading}
            >
              Reset Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}