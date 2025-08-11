'use client';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useVerifyEmailMutation } from '@/store/api/authApi';
import { useRouter } from 'next/navigation';

function VerifyEmailPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const [verifyEmail, { isLoading, isSuccess, error }] = useVerifyEmailMutation();
  const [customError, setCustomError] = useState<string | null>(null);

  // Handle email verification
  const handleVerify = async () => {
    setCustomError(null); // Reset error on new attempt
    if (!token) {
      setCustomError('Invalid or missing token.');
      return;
    }
    try {
      await verifyEmail({ token }).unwrap();
    } catch (err: any) {
      if (err?.data?.message) {
        setCustomError(err.data.message);
      } else {
        setCustomError('Verification failed. Please try again.');
      }
    }
  };

  // Redirect to login after success
  if (isSuccess) {
    setTimeout(() => router.push('/login'), 2000);
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="w-full max-w-sm mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-sm text-gray-500">
            Please click the button below to verify your email address.
          </p>
        </div>
        {isSuccess && (
          <div className="text-green-600 text-center text-sm mb-4">Email verified! You can now log in.<br />Redirecting to login...</div>
        )}
        {(error || customError) && (
          <div className="text-red-500 text-center text-sm mb-4">{customError || (error as any)?.data?.message || 'Verification failed.'}</div>
        )}
        <Button
          type="primary"
          size="large"
          className="w-full h-12"
          onClick={handleVerify}
          disabled={isSuccess || isLoading}
          loading={isLoading}
        >
          Verify Email
        </Button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center">Loading…</div>}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}