'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, PasswordInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { useLoginMutation } from '@/store/api/authApi';
import { setCredentials } from '@/store/features/authSlice';
import { useAppDispatch } from '@/store/store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [login, { isLoading, error }] = useLoginMutation();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await login(data).unwrap();
      // Save user and token to Redux store
      dispatch(setCredentials({
        user: {
          ...response.data.user,
          role: response.data.user.role === 'admin' ? 'admin' : 'customer',
        },
        token: response.data.token
      }));
      // Redirect to homepage
      router.push('/');
    } catch (err: any) {
      // Show error message
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="w-full max-w-sm mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Please enter your details to sign in
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
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
          <div className="text-center">
            {/* Use Next.js Link for navigation */}
            <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-primary transition-colors">
              Forgot password?
            </Link>
          </div>
          {error && (
            <div className="text-red-500 text-center text-sm">{(error as any)?.data?.message || 'Login failed'}</div>
          )}
          <div>
            <Button
              type="primary"
              size="large"
              className="w-full h-12"
              htmlType="submit"
              loading={isSubmitting || isLoading}
            >
              Sign in
            </Button>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <a href="/register" className="text-primary hover:text-primary-dark font-medium">
                Sign up
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}