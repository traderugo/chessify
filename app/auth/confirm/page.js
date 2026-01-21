'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseClient();

  useEffect(() => {
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    const next = searchParams.get('next') || '/auth/update-password';

    if (token_hash && type === 'recovery') {
      async function verify() {
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'recovery',
        });

        if (!error) {
          router.push(next);
        } else {
          router.push('/auth/forgot-password?error=Invalid or expired link');
        }
      }
      verify();
    } else {
      router.push('/auth/forgot-password');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
      <p className="text-gray-700 dark:text-gray-300">Verifying your reset link...</p>
    </div>
  );
}