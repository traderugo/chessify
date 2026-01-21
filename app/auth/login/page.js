"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '../../../components/auth/LoginForm';

export default function LoginPage() {
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (email, password) => {
    try {
      const { supabase } = require('../../../lib/supabase/client');
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto ">
      <LoginForm onSubmit={handleLogin} />
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}