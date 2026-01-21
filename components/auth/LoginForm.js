"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const { login, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Auto-redirect when logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);  // Use the login from AuthProvider

      // Optional: Force a hard refresh after login to sync cookies/session
      window.location.href = "/dashboard";  // ← This helps trigger middleware
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-black flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Main Card - Slightly redesigned with more personality */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
          
          {/* Top accent bar */}
          <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600" />

          {/* Content */}
          <div className="p-8 pb-10">
            {/* Header - More welcoming & compact */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Welcome back
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Sign in to continue your chess journey
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50"
                    placeholder="you@example.com"
                    required
                    disabled={submitting || loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50"
                    placeholder="••••••••"
                    required
                    disabled={submitting || loading}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400 text-center font-medium">
                    {error}
                  </p>
                </div>
              )}

              {/* Submit Button - More dynamic */}
              <button
                type="submit"
                disabled={submitting || loading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-full transition shadow-md flex items-center justify-center gap-2 group"
              >
                {submitting || loading ? (
                  "Signing you in..."
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
              <p>
                Don't have an account?{" "}
                <a href="/auth/register" className="text-blue-500 hover:text-blue-600 font-medium transition">
                  Create one now
                </a>
              </p>
              <p className="mt-3">
                <a href="/auth/forgot-password" className="text-gray-500 dark:text-gray-400 hover:text-blue-500 transition">
                  Forgot password?
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}