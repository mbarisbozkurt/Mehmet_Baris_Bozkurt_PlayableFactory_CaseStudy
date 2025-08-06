'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, PasswordInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRegisterMutation } from '@/store/api/authApi';
import { useState } from 'react';

// Validation schema for register form
const registerSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [registerUser, { isLoading, isSuccess, error }] = useRegisterMutation();
  const [customError, setCustomError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Handle form submit and call the API
  const onSubmit = async (data: RegisterFormData) => {
    setCustomError(null); // Reset error on new submit
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
      }).unwrap();
      reset(); // Reset form after success
    } catch (err: any) {
      // Show a user-friendly error message
      if (err?.data?.message) {
        setCustomError(err.data.message);
      } else {
        setCustomError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="w-full max-w-sm mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-sm text-gray-500">
            Enter your details to create your account.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="First Name"
                  size="large"
                  className="w-full"
                  error={errors.firstName?.message}
                />
              )}
            />
          </div>
          <div>
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Last Name"
                  size="large"
                  className="w-full"
                  error={errors.lastName?.message}
                />
              )}
            />
          </div>
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
          <div>
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Phone Number"
                  size="large"
                  className="w-full"
                  error={errors.phoneNumber?.message}
                />
              )}
            />
          </div>
          <div>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <PasswordInput
                  {...field}
                  placeholder="Password"
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
            <div className="text-green-600 text-center text-sm">Registration successful! Please check your email to verify your account.</div>
          )}
          {(error || customError) && (
            <div className="text-red-500 text-center text-sm">{customError || (error as any)?.data?.message || 'Registration failed.'}</div>
          )}
          <div>
            <Button
              type="primary"
              size="large"
              className="w-full h-12"
              htmlType="submit"
              loading={isSubmitting || isLoading}
            >
              Create Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}