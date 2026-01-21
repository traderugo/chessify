'use client';

import { useState } from 'react';
import { supabaseClient } from '@/lib/supabase/client';

export default function UpdatePasswordPage() {
  const supabase = supabaseClient;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (newPassword !== confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  setLoading(true);
  setError('');
  setMessage('');

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    setError(error.message);
  } else {
    // Password updated successfully

    // OPTIONAL: Sign out immediately to end the recovery session
    await supabase.auth.signOut();

    setMessage('Password updated successfully! Redirecting to login...');
    setTimeout(() => {
      window.location.href = '/auth/login';
    }, 3000);
  }

  setLoading(false);
};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Update Password</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#161b22] px-4 py-2 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#161b22] px-4 py-2 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full transition px-5 py-2 flex items-center justify-center w-full gap-2"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
        {message && <p className="mt-4 text-green-600 dark:text-green-400 text-sm">{message}</p>}
      </div>
    </div>
  );
}