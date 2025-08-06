'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useForgotPasswordMutation } from '@/store/api/authApi';
import { useState } from 'react';

// Validation schema for forgot password form
const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [forgotPassword, { isLoading, isSuccess, error }] = useForgotPasswordMutation();
  const [customError, setCustomError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // Handle form submit and call the API
  const onSubmit = async (data: ForgotPasswordFormData) => {
    setCustomError(null); // Reset error on new submit
    try {
      await forgotPassword({ email: data.email }).unwrap();
      reset(); // Reset form after success
    } catch (err: any) {
      // Show a user-friendly error message
      if (err?.data?.message) {
        setCustomError(err.data.message);
      } else {
        setCustomError('Failed to send reset link. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="w-full max-w-sm mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
          <p className="text-sm text-gray-500">
            Enter your email address and we will send you a password reset link.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Email"
                  size="large"
                  className="w-full"
                  error={errors.email?.message}
                />
              )}
            />
          </div>
          {isSuccess && (
            <div className="text-green-600 text-center text-sm">If an account exists, a reset link has been sent to your email.</div>
          )}
          {(error || customError) && (
            <div className="text-red-500 text-center text-sm">{customError || (error as any)?.data?.message || 'Failed to send reset link.'}</div>
          )}
          <div>
            <Button
              type="primary"
              size="large"
              className="w-full h-12"
              htmlType="submit"
              loading={isSubmitting || isLoading}
            >
              Send Reset Link
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}