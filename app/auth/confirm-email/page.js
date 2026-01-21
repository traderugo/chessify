// app/auth/confirm-email/page.jsx
export default function ConfirmEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Check your email
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            We've sent a confirmation link to your email address. 
            Please click it to activate your account.
          </p>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">
            Didn't receive it? Check your spam folder or try registering again.
          </p>
        </div>
      </div>
    </div>
  );
}