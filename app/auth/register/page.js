"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RegisterForm from "../../../components/auth/RegisterForm";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async ({ fullName, email, location, dob, password }) => {
    try {
      setError(null);
      setIsLoading(true);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            fullName,
            location,
            dob,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signUpError) throw signUpError;

      // Correct check: session exists → fully logged in
      if (data.session) {
        router.push("/dashboard");
      } else {
        // No session → confirmation email sent
        router.push("/auth/confirm-email");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <RegisterForm onSubmit={handleRegister} />
        
        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400 text-center font-medium">
              {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}