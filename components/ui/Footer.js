// components/layout/Footer.jsx
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full bg-[#f6f8fb] dark:bg-black border-t border-gray-200/60 dark:border-gray-800/40">
      <div className="max-w-6xl mx-auto px-6 py-10 text-center text-sm">
        {/* Links row */}
       

        {/* Made with love SVG heart by Ugo */}
        <div className="text-gray-600 dark:text-gray-400 mb-4 text-base flex items-center justify-center gap-2">
          Made with{" "}
          {/* Red SVG heart */}
          <svg
            width="20"
            height="18"
            viewBox="0 0 24 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="inline-block text-red-500"
          >
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c2.04 0 3.8 1.22 4.5 3.09C12.7 4.22 14.46 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="currentColor"
            />
          </svg>{" "}
          by{" "}
          <a
            href="https://x.com/TraderUgoX"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors"
          >
            ugofromspace
          </a>
        </div>

        {/* Copyright */}
        <div className="text-xs text-gray-500 dark:text-gray-600">
          © {currentYear} Tournament<span className="text-green-500">.</span> • All rights reserved
        </div>
      </div>
    </footer>
  );
}